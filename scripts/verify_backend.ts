import { and, or } from "@prisma/orm-postgres/orm-client";
import { toTimestamp } from "../lib/dates";
import { db, disconnectDatabase, pingDatabase } from "../lib/db";
import { letterPreview, orderedSupportResourcesQuery } from "../lib/db/queries";
import { getAiMiddleware } from "../lib/ai";
import { getLetterRouting, isPeerMatchable } from "../lib/safety/routing";
import { canTransitionLetter, canTransitionReply, nextResponderTrustScore } from "../lib/moderation/status";
import { claimLetterForReply, releaseLetterClaim, findAvailableReplyLetters } from "../lib/reply/claiming";
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
  await pingDatabase();
  const { count: initialUsers } = await db.orm.public.User.aggregate((agg) => ({ count: agg.count() }));
  console.log(`Connected to PostgreSQL. Current user count: ${initialUsers}`);

  console.log("\n=== [3/7] Testing User Creation & 46HZ Migration Code ===");
  const testWriterHandle = createAnonymousHandle();
  const testWriterCode = createMigrationCode();
  console.log(`Generated Handle: ${testWriterHandle}, Migration Code: ${testWriterCode}`);
  if (!testWriterCode.startsWith("46HZ-")) throw new Error("Migration code must start with 46HZ-");

  const [writer, responder, responder2] = await Promise.all([
    db.orm.public.User.create({
      anonymousHandle: testWriterHandle,
      migrationCode: testWriterCode,
      language: "ko_KR",
      ageRange: "ADULT",
      preferredReplyType: "COMFORT",
      trustScore: 50
    }),
    db.orm.public.User.create({
      anonymousHandle: createAnonymousHandle(),
      migrationCode: createMigrationCode(),
      language: "ko_KR",
      ageRange: "ADULT",
      preferredReplyType: "JUST_BEING_HEARD",
      trustScore: 60
    }),
    db.orm.public.User.create({
      anonymousHandle: createAnonymousHandle(),
      migrationCode: createMigrationCode(),
      language: "ko_KR",
      ageRange: "ADULT",
      preferredReplyType: "COMFORT",
      trustScore: 70
    })
  ]);
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
  const letter = await db.orm.public.Letter.create({
    authorId: writer.id,
    rawText: rawLetterText,
    processedText: processed.processedText,
    emotionTags: processed.emotionTags,
    situationTags: processed.situationTags,
    desiredReplyType: processed.desiredReplyType,
    riskLevel: processed.risk.level,
    language: writer.language,
    status: "DRAFT"
  });

  // Author confirms draft -> transitions to PENDING
  if (!canTransitionLetter(letter.status, routing.submitStatus)) {
    throw new Error("Invalid transition from DRAFT to submitStatus");
  }
  await db.orm.public.Letter.where((row) => row.id.eq(letter.id)).updateAndCount({
    status: routing.submitStatus
  });

  // Admin approves letter
  if (!canTransitionLetter(routing.submitStatus, "APPROVED")) {
    throw new Error("Invalid transition from PENDING to APPROVED");
  }
  const approvedLetter = await db.orm.public.Letter.where({ id: letter.id }).update({
    status: "APPROVED"
  });
  if (!approvedLetter) {
    throw new Error("Approved letter was not returned");
  }
  console.log(`Letter created, transitioned to PENDING, and approved (Status: ${approvedLetter.status})`);
  if (!isPeerMatchable(approvedLetter)) throw new Error("Approved normal letter should be peer matchable");

  console.log("\n=== [5/7] Testing 15-Minute Concurrency Claiming & Release Protocol ===");
  // Author claiming own letter -> should be CANNOT_REPLY_OWN_LETTER
  const availableBeforeClaim = await findAvailableReplyLetters(responder.id, 8);
  console.log(`Available reply letters for Responder 1: ${availableBeforeClaim.length}`);
  if (!availableBeforeClaim.some((l) => l.id === letter.id)) {
    throw new Error("Approved letter should be in findAvailableReplyLetters for Responder 1");
  }

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
  const reply = await db.orm.public.Reply.create({
    letterId: approvedLetter.id,
    responderId: responder.id,
    rawText: replyDraft,
    coachedText: coached.coachedText,
    status: "PENDING"
  });

  // Admin approves reply
  if (!canTransitionReply(reply.status, "APPROVED")) throw new Error("Invalid reply transition");
  const approvedReply = await db.orm.public.Reply.where({ id: reply.id }).update({
    status: "APPROVED"
  });
  if (!approvedReply) throw new Error("Approved reply was not returned");
  await db.orm.public.Match
    .where({ letterId: letter.id, responderId: responder.id })
    .updateAndCount({ status: "RESPONDED" });
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

  console.log("\n=== Testing 46Hz Schumann Resonance Harmonic Cap (7 -> 15) ===");
  console.log(`Letter Default Max Replies: ${letter.maxReplies} (expected: 7)`);
  if (letter.maxReplies !== 7) throw new Error("Letter default maxReplies should be 7");

  // Create additional 6 test users and replies to reach the 7-harmonic cap
  const fillerResponders = [];
  for (let i = 2; i <= 7; i++) {
    const fillerUser = await db.orm.public.User.create({
      anonymousHandle: createAnonymousHandle(),
      language: "ko_KR",
      ageRange: "ADULT",
      preferredReplyType: "COMFORT"
    });
    fillerResponders.push(fillerUser);
    await db.orm.public.Reply.create({
      letterId: letter.id,
      responderId: fillerUser.id,
      rawText: `Resonant reply harmonic #${i}`,
      coachedText: `Resonant reply harmonic #${i}`,
      status: "APPROVED"
    });
  }

  // Now letter has 7 approved replies!
  // Another user tries to claim the letter -> should fail with RESONANCE_LIMIT_REACHED
  const testUser8 = await db.orm.public.User.create({
    anonymousHandle: createAnonymousHandle(),
    language: "ko_KR",
    ageRange: "ADULT",
    preferredReplyType: "COMFORT"
  });

  const claimAtCap = await claimLetterForReply(letter.id, testUser8.id);
  console.log("Claim result at 7 replies cap:", claimAtCap);
  if (claimAtCap.ok || claimAtCap.reason !== "RESONANCE_LIMIT_REACHED") {
    throw new Error("Claim at 7 replies cap should fail with RESONANCE_LIMIT_REACHED");
  }

  // Author explicitly consents and expands resonance capacity to 15
  await db.orm.public.Letter.where((row) => row.id.eq(letter.id)).updateAndCount({
    maxReplies: 15
  });
  console.log("Author consented and expanded resonance capacity to 15");

  // Now user8 can claim reply #8!
  const claimExpanded = await claimLetterForReply(letter.id, testUser8.id);
  console.log("Claim result after expanding to 15:", claimExpanded);
  if (!claimExpanded.ok) {
    throw new Error("Claim after expanding to 15 should succeed");
  }

  // Test complex Prisma 8 relation & array filters (letter detail, inbox, admin filters, reports)
  const detailLetter = await db.orm.public.Letter
    .where((l) =>
      and(
        l.id.eq(letter.id),
        or(l.authorId.eq(responder.id), l.replies.some((r) => r.responderId.eq(responder.id)))
      )
    )
    .include("replies", (replies) =>
      replies
        .where((r) => or(r.status.eq("APPROVED"), r.responderId.eq(responder.id)))
        .include("feedback", (feedback) => feedback.where({ fromUserId: writer.id }))
        .orderBy((r) => r.createdAt.desc())
    )
    .include("comments", (comments) => comments.orderBy((c) => c.createdAt.asc()))
    .first();
  if (!detailLetter || detailLetter.replies.length < 7) {
    throw new Error("Complex OR + relation some filter in letter detail failed");
  }

  const taggedLetters = await db.orm.public.Letter
    .where((l, { fns }) =>
      and(
        l.id.eq(letter.id),
        fns.raw`${"lonely"} = ANY(${l.emotionTags})`.returns("pg/bool@1"),
        l.createdAt.gte(toTimestamp(new Date(Date.now() - 60_000))),
        l.createdAt.lte(toTimestamp(new Date(Date.now() + 60_000)))
      )
    )
    .all();
  if (taggedLetters.length !== 1) {
    throw new Error("Array has + Date range (gte/lte) filter failed");
  }

  const inboxLetters = await db.orm.public.Letter
    .with(letterPreview)
    .where({ id: letter.id, authorId: writer.id })
    .include("replies", (replies) => replies.where({ status: "APPROVED" }).count())
    .all();
  if (inboxLetters.length !== 1 || inboxLetters[0].replies < 7) {
    throw new Error("Inbox replies count reducer failed");
  }

  const reports = await db.orm.public.Feedback
    .where((feedback) => feedback.reportReason.isNotNull())
    .include("reply", (r) => r.include("letter").include("responder"))
    .include("fromUser")
    .orderBy((feedback) => feedback.createdAt.desc())
    .limit(5)
    .all();
  if (!Array.isArray(reports)) {
    throw new Error("Admin reports query failed");
  }

  const orderedResources = await orderedSupportResourcesQuery().all();
  if (!Array.isArray(orderedResources)) {
    throw new Error("Admin support resources boolean orderBy query failed");
  }

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
  await db.orm.public.Reply.where({ letterId: letter.id }).deleteAndCount();
  await db.orm.public.Match.where({ letterId: letter.id }).deleteAndCount();
  await db.orm.public.Letter.where({ id: letter.id }).deleteAndCount();
  const allTestUserIds = [
    writer.id,
    responder.id,
    responder2.id,
    ...fillerResponders.map((u) => u.id),
    testUser8.id
  ];
  await db.orm.public.User.where((user) => user.id.in(allTestUserIds)).deleteAndCount();
  console.log("\n Cleaned up test data.");
  console.log("\n ALL ARCHITECTURE & BACKEND INTEGRITY CHECKS PASSED SUCCESSFULLY!");
}

verifyAll()
  .catch((err) => {
    console.error(" Verification Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDatabase();
  });
