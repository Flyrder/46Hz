import { prisma } from "../lib/db";

async function main() {
  await prisma.feedback.deleteMany();
  await prisma.match.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.moderationEvent.deleteMany();
  await prisma.letter.deleteMany();
  await prisma.supportResource.deleteMany();
  await prisma.user.deleteMany();

  const [writer, responder, secondResponder] = await Promise.all([
    prisma.user.create({
      data: {
        anonymousHandle: "Letter MIRA",
        language: "en",
        ageRange: "ADULT",
        preferredReplyType: "COMFORT",
        trustScore: 54
      }
    }),
    prisma.user.create({
      data: {
        anonymousHandle: "Letter SOL",
        language: "en",
        ageRange: "ADULT",
        preferredReplyType: "JUST_BEING_HEARD",
        trustScore: 68
      }
    }),
    prisma.user.create({
      data: {
        anonymousHandle: "Letter NAMI",
        language: "en",
        ageRange: "UNDER_18",
        preferredReplyType: "SIMILAR_EXPERIENCES",
        trustScore: 47
      }
    })
  ]);

  await prisma.supportResource.createMany({
    data: [
      {
        title: "988 Suicide & Crisis Lifeline",
        description: "Free, confidential support in the United States and Canada.",
        region: "US/Canada",
        language: "en",
        url: "https://988lifeline.org",
        phone: "988",
        active: true
      },
      {
        title: "Find a trusted local contact",
        description: "A friend, family member, school counselor, manager, or local emergency line can help in urgent moments.",
        region: "Local",
        language: "en",
        active: true
      },
      {
        title: "Korea Mental Health Welfare Center",
        description: "Regional mental health welfare centers and counseling information.",
        region: "KR",
        language: "ko",
        url: "https://www.mentalhealth.go.kr",
        active: true
      }
    ]
  });

  const approvedLetter = await prisma.letter.create({
    data: {
      authorId: writer.id,
      rawText:
        "I moved for work and I feel lonely most nights. I do not need a solution right now. I mostly want to feel heard by someone kind.",
      processedText:
        "I moved for work and I feel lonely most nights. I do not need a solution right now. I mostly want to feel heard by someone kind.",
      emotionTags: ["lonely"],
      situationTags: ["work"],
      desiredReplyType: "JUST_BEING_HEARD",
      riskLevel: "NORMAL",
      language: "en",
      status: "APPROVED"
    }
  });

  const pendingLetter = await prisma.letter.create({
    data: {
      authorId: responder.id,
      rawText:
        "My friend group changed quickly and I feel left behind. I would appreciate comfort, not a big list of advice.",
      processedText:
        "My friend group changed quickly and I feel left behind. I would appreciate comfort, not a big list of advice.",
      emotionTags: ["sad", "lonely"],
      situationTags: ["friendship"],
      desiredReplyType: "COMFORT",
      riskLevel: "NORMAL",
      language: "en",
      status: "PENDING"
    }
  });

  const highRiskLetter = await prisma.letter.create({
    data: {
      authorId: secondResponder.id,
      rawText:
        "I do not feel safe with myself tonight and I need someone near me to know.",
      processedText:
        "I do not feel safe with myself tonight and I need someone near me to know.",
      emotionTags: ["overwhelmed"],
      situationTags: ["life"],
      desiredReplyType: "COMFORT",
      riskLevel: "HIGH",
      language: "en",
      status: "ROUTED_TO_SUPPORT"
    }
  });

  const approvedReply = await prisma.reply.create({
    data: {
      letterId: approvedLetter.id,
      responderId: responder.id,
      rawText:
        "That sounds really lonely. I am glad you wrote it here, and I hope tonight feels a little less empty.",
      coachedText:
        "That sounds really lonely. I am glad you wrote it here, and I hope tonight feels a little less empty. You do not have to solve all of it before your feelings deserve care.",
      status: "APPROVED"
    }
  });

  await prisma.reply.create({
    data: {
      letterId: approvedLetter.id,
      responderId: secondResponder.id,
      rawText:
        "You should just join clubs and make a schedule, then it will be fixed.",
      coachedText:
        "It makes sense that moving for work could feel lonely. I hope you can be patient with yourself while this new place starts to feel less unfamiliar.",
      status: "PENDING"
    }
  });

  await prisma.match.create({
    data: {
      letterId: approvedLetter.id,
      responderId: responder.id,
      status: "RESPONDED",
      matchReason: "Seeded approved normal-risk letter."
    }
  });

  await prisma.feedback.create({
    data: {
      replyId: approvedReply.id,
      fromUserId: writer.id,
      feltUnderstood: true,
      helpful: true,
      tooJudgmental: false,
      tooMuchAdvice: false
    }
  });

  await prisma.moderationEvent.createMany({
    data: [
      {
        targetType: "LETTER",
        targetId: approvedLetter.id,
        action: "ADMIN_MODERATED",
        reason: "Seed approved normal-risk letter.",
        previousStatus: "PENDING/NORMAL",
        newStatus: "APPROVED/NORMAL"
      },
      {
        targetType: "LETTER",
        targetId: pendingLetter.id,
        action: "SUBMITTED",
        reason: "Seed pending letter.",
        previousStatus: "DRAFT",
        newStatus: "PENDING"
      },
      {
        targetType: "LETTER",
        targetId: highRiskLetter.id,
        action: "SAFETY_ROUTED",
        reason: "Seed high-risk route to support resources.",
        previousStatus: "DRAFT",
        newStatus: "ROUTED_TO_SUPPORT"
      },
      {
        targetType: "REPLY",
        targetId: approvedReply.id,
        action: "ADMIN_MODERATED",
        reason: "Seed approved reply.",
        previousStatus: "PENDING",
        newStatus: "APPROVED"
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
