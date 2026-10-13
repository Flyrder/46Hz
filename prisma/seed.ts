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
        title: "24시 자살예방 상담전화 (109)",
        description: "보건복지부 주관 24시간 365일 긴급 위기 상담 및 마음 안심 지원 (국번없이 109, 통화료 무료)",
        region: "KR",
        language: "ko",
        phone: "109",
        active: true
      },
      {
        title: "보건복지상담센터 (1393)",
        description: "자살예방 및 심리적 위기 긴급 상담 전문 핫라인 (국번없이 1393, 24시간 연중무휴)",
        region: "KR",
        language: "ko",
        phone: "1393",
        active: true
      },
      {
        title: "정신건강 위기상담전화 (1577-0199)",
        description: "전국 광역 및 기초 정신건강복지센터 연계 24시간 전문 위기 개입 상담",
        region: "KR",
        language: "ko",
        phone: "1577-0199",
        active: true
      },
      {
        title: "청소년 상담전화 (1388)",
        description: "청소년과 보호자를 위한 24시간 고민 및 심리 상담 핫라인",
        region: "KR",
        language: "ko",
        phone: "1388",
        active: true
      },
      {
        title: "Korea Mental Health Welfare Center",
        description: "Regional mental health welfare centers and counseling information.",
        region: "KR",
        language: "ko",
        url: "https://www.mentalhealth.go.kr",
        active: true
      },
      {
        title: "全国心理危机干预热线 (400-161-9995)",
        description: "全国免费心理危机干预及自杀预防生命热线，提供24小时专业心理疏导与危机干预。",
        region: "CN",
        language: "zh",
        phone: "400-161-9995",
        active: true
      },
      {
        title: "共青团青少年心理援助热线 (12355)",
        description: "面向全国青少年的专业心理咨询与危机救助专线 (统一拨打 12355)。",
        region: "CN",
        language: "zh",
        phone: "12355",
        active: true
      },
      {
        title: "北京心理危机研究与干预中心",
        description: "国家级自杀危机干预与心理救援热线 (北京回龙观医院)。",
        region: "CN",
        language: "zh",
        phone: "010-82951332",
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
