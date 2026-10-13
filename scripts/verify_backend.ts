import { prisma } from "../lib/db";
import { getAiMiddleware } from "../lib/ai";
import { getLetterRouting, isPeerMatchable } from "../lib/safety/routing";
import { canTransitionLetter, canTransitionReply, nextResponderTrustScore } from "../lib/moderation/status";
import { claimLetterForReply, releaseLetterClaim } from "../lib/reply/claiming";
import { createAnonymousHandle, createMigrationCode } from "../lib/session";
import { translate, defaultLocale } from "../lib/i18n";
import { canManageUsers, canManageResources, canModerateContent, authenticatePasscode } from "../lib/admin";

async function verifyAll() {
  console.log("=== [1/7] Testing i18n and Default Language ===");
  console.log("Default locale:", defaultLocale);
  if (defaultLocale !== "ko_KR") throw new Error("Default locale is not ko_KR");
  console.log("Korean Home Title:", translate("ko_KR", "home.title"));
  console.log("Korean Claim Title:", translate("ko_KR", "reply.reservedByOtherTitle"));
  console.log("Chinese Claim Title:", translate("zh_CN", "reply.reservedByOtherTitle"));
  console.log("English Claim Title:", translate("en_US", "reply.reservedByOtherTitle"));

  console.log("\n=== [2/7] Testing Database Connection & Cleanup ===");
  await prisma.$connect();
  const initialUsers = await prisma.user.count();
  console.log(`Connected to PostgreSQL. Current user count: ${initialUsers}`);

  console.log("\n=== [3/7] Testing User Creation & 46HZ Migration Code ===");
  const testWriterHandle = createAnonymousHandle();
  const testWriterCode = createMigrationCode();
  console.log(`Generated Handle: ${testWriterHandle}, Migration Code: ${testWriterCode}`);
  if (!testWriterCode.startsWith("46HZ-")) throw new Error("Migration code must start with 46HZ-");

  const writer = await prisma.user.create({
    data: {
      anonymousHandle: testWriterHandle,
      migrationCode: testWriterCode,
      language: "ko_KR",
      ageRange: "ADULT",
      preferredReplyType: "COMFORT",
      trustScore: 50
    }
  });

  const responder = await prisma.user.create({
    data: {
      anonymousHandle: createAnonymousHandle(),
      migrationCode: createMigrationCode(),
      language: "ko_KR",
      ageRange: "ADULT",
      preferredReplyType: "JUST_BEING_HEARD",
      trustScore: 60
    }
  });

  const responder2 = await prisma.user.create({
    data: {
      anonymousHandle: createAnonymousHandle(),
      migrationCode: createMigrationCode(),
      language: "ko_KR",
      ageRange: "ADULT",
      preferredReplyType: "COMFORT",
      trustScore: 70
    }
  });
  console.log(`Created Writer (ID: ${writer.id}), Responder 1 (ID: ${responder.id}), and Responder 2 (ID: ${responder2.id})`);

  console.log("\n=== [4/7] Testing AI Middleware & Letter Pipeline ===");
  const ai = getAiMiddleware();
  const rawLetterText = "I feel so lonely and burned out at work lately. Call me at 555-123-4567 or email me at user@test.com. My name is Alex Stone.";
  const processed = await ai.processLetter({
    text: rawLetterText,
    language: writer.language,
    preferredReplyType: writer.preferredReplyType
  });

  console.log("Anonymized Text:", processed.processedText);
  console.log("Emotion Tags:", processed.emotionTags);
  console.log("Situation Tags:", processed.situationTags);
  console.log("Risk Level:", processed.risk.level);
  if (processed.processedText.includes("555-123-4567") || processed.processedText.includes("user@test.com")) {
    throw new Error("PII was not properly anonymized!");
  }

  const routing = getLetterRouting(processed.risk.level);
  const letter = await prisma.letter.create({
    data: {
      authorId: writer.id,
      rawText: rawLetterText,
      processedText: processed.processedText,
      emotionTags: processed.emotionTags,
      situationTags: processed.situationTags,
      desiredReplyType: processed.desiredReplyType,
      riskLevel: processed.risk.level,
      language: writer.language,
      status: "DRAFT"
    }
  });

  // Author confirms draft -> transitions to PENDING
  if (!canTransitionLetter(letter.status, routing.submitStatus)) {
    throw new Error("Invalid transition from DRAFT to submitStatus");
  }
  await prisma.letter.update({
    where: { id: letter.id },
    data: { status: routing.submitStatus }
  });

  // Admin approves letter
  if (!canTransitionLetter(routing.submitStatus, "APPROVED")) {
    throw new Error("Invalid transition from PENDING to APPROVED");
  }
  const approvedLetter = await prisma.letter.update({
    where: { id: letter.id },
    data: { status: "APPROVED" }
  });
  console.log(`Letter created, transitioned to PENDING, and approved (Status: ${approvedLetter.status})`);
  if (!isPeerMatchable(approvedLetter)) throw new Error("Approved normal letter should be peer matchable");

  console.log("\n=== [5/7] Testing 15-Minute Concurrency Claiming & Release Protocol ===");
  // Author claiming own letter -> should be CANNOT_REPLY_OWN_LETTER
  const ownClaim = await claimLetterForReply(letter.id, writer.id);
  console.log("Author claiming own letter result:", ownClaim);
  if (ownClaim.ok || ownClaim.reason !== "CANNOT_REPLY_OWN_LETTER") {
    throw new Error("Author claiming own letter should fail with CANNOT_REPLY_OWN_LETTER");
  }

  // Responder 1 claims letter -> should succeed
  const claim1 = await claimLetterForReply(letter.id, responder.id);
  console.log("Responder 1 claim result:", claim1);
  if (!claim1.ok) throw new Error("First claim should succeed");

  // Responder 2 tries to claim while held by Responder 1 -> should be LOCKED_BY_ANOTHER
  const claim2 = await claimLetterForReply(letter.id, responder2.id);
  console.log("Responder 2 collision claim result:", claim2);
  if (claim2.ok || claim2.reason !== "LOCKED_BY_ANOTHER") {
    throw new Error("Second claim should fail with LOCKED_BY_ANOTHER");
  }

  // Responder 1 releases claim (voluntarily puts back into letterbox)
  await releaseLetterClaim(letter.id, responder.id);
  console.log("Claim released voluntarily by Responder 1");

  // Now claim succeeds again
  const claim3 = await claimLetterForReply(letter.id, responder.id);
  if (!claim3.ok) throw new Error("Claim after release should succeed");

  console.log("\n=== [6/7] Testing AI Reply Coach & Submission ===");
  const replyDraft = "You must just get over it. It is not a big deal. I felt the exact same way all the time.";
  const coached = await ai.coachReply({
    letterText: approvedLetter.processedText,
    replyText: replyDraft,
    desiredReplyType: approvedLetter.desiredReplyType,
    language: approvedLetter.language
  });
  console.log("Coached Reply Flags:", coached.flags);
  console.log("Coached Suggestions:", coached.suggestions);
  console.log("Coached Text:", coached.coachedText);

  // Submit reply
  const reply = await prisma.reply.create({
    data: {
      letterId: approvedLetter.id,
      responderId: responder.id,
      rawText: replyDraft,
      coachedText: coached.coachedText,
      status: "PENDING"
    }
  });

  // Admin approves reply
  if (!canTransitionReply(reply.status, "APPROVED")) throw new Error("Invalid reply transition");
  const approvedReply = await prisma.reply.update({
    where: { id: reply.id },
    data: { status: "APPROVED" }
  });
  console.log(`Reply submitted and approved (Status: ${approvedReply.status})`);

  // Writer provides feedback
  const updatedScore = nextResponderTrustScore(responder.trustScore, {
    feltUnderstood: true,
    helpful: true,
    tooJudgmental: false,
    tooMuchAdvice: false,
    reported: false
  });
  console.log(`Responder Trust Score: ${responder.trustScore} -> ${updatedScore} (expected: +7)`);
  if (updatedScore !== responder.trustScore + 7) throw new Error("Trust score delta should be +7");

  console.log("\n=== [7/7] Testing RBAC Permissions ===");
  const canAdminManageUsers = canManageUsers("ADMIN");
  const canModeratorManageUsers = canManageUsers("MODERATOR");
  const canAdminManageResources = canManageResources("ADMIN");
  const canModeratorManageResources = canManageResources("MODERATOR");
  const canModeratorReview = canModerateContent("MODERATOR");
  const adminPassValid = authenticatePasscode(process.env.ADMIN_PASSCODE ?? "local-admin") === "ADMIN";
  const modPassValid = authenticatePasscode(process.env.MODERATOR_PASSCODE ?? "local-moderator") === "MODERATOR";

  console.log("Admin can manage users:", canAdminManageUsers, "(expected: true)");
  console.log("Moderator can manage users:", canModeratorManageUsers, "(expected: false)");
  console.log("Admin can manage resources:", canAdminManageResources, "(expected: true)");
  console.log("Moderator can manage resources:", canModeratorManageResources, "(expected: false)");
  console.log("Moderator can review content:", canModeratorReview, "(expected: true)");
  console.log("Admin passcode auth:", adminPassValid, "(expected: true)");
  console.log("Moderator passcode auth:", modPassValid, "(expected: true)");

  if (!canAdminManageUsers || canModeratorManageUsers || !canAdminManageResources || canModeratorManageResources || !canModeratorReview || !adminPassValid || !modPassValid) {
    throw new Error("RBAC matrix validation failed!");
  }

  // Cleanup test entities safely
  await prisma.reply.deleteMany({ where: { id: reply.id } });
  await prisma.match.deleteMany({ where: { letterId: letter.id } });
  await prisma.letter.deleteMany({ where: { id: letter.id } });
  await prisma.user.deleteMany({
    where: { id: { in: [writer.id, responder.id, responder2.id] } }
  });
  console.log("\n Cleaned up test data.");
  console.log("\n ALL ARCHITECTURE & BACKEND INTEGRITY CHECKS PASSED SUCCESSFULLY!");
}

verifyAll()
  .catch((err) => {
    console.error(" Verification Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
