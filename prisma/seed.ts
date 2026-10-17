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
        language: "ko_KR",
        ageRange: "ADULT",
        preferredReplyType: "COMFORT",
        trustScore: 54
      }
    }),
    prisma.user.create({
      data: {
        anonymousHandle: "Letter SOL",
        language: "ko_KR",
        ageRange: "ADULT",
        preferredReplyType: "JUST_BEING_HEARD",
        trustScore: 68
      }
    }),
    prisma.user.create({
      data: {
        anonymousHandle: "Letter NAMI",
        language: "ko_KR",
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
        title: "국립정신건강센터 마음건강 포털",
        description: "전국 광역·기초 정신건강복지센터 위치 안내 및 정신건강 지원 정보 포털",
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
        "직장 때문에 낯선 도시로 이사 온 뒤로 밤마다 마음이 유독 공허하고 외롭습니다. 당장 거창한 해결책보다는 누군가 제 이야기를 따뜻하게 들어주었으면 좋겠어요.",
      processedText:
        "직장 때문에 낯선 도시로 이사 온 뒤로 밤마다 마음이 유독 공허하고 외롭습니다. 당장 거창한 해결책보다는 누군가 제 이야기를 따뜻하게 들어주었으면 좋겠어요.",
      emotionTags: ["lonely"],
      situationTags: ["work"],
      desiredReplyType: "JUST_BEING_HEARD",
      riskLevel: "NORMAL",
      language: "ko_KR",
      status: "APPROVED"
    }
  });

  const pendingLetter = await prisma.letter.create({
    data: {
      authorId: responder.id,
      rawText:
        "가깝게 지내던 친구들과의 관계가 빠르게 변하면서 저만 홀로 남겨진 기분이 듭니다. 긴 조언보다는 따뜻한 위로의 한마디가 간절해요.",
      processedText:
        "가깝게 지내던 친구들과의 관계가 빠르게 변하면서 저만 홀로 남겨진 기분이 듭니다. 긴 조언보다는 따뜻한 위로의 한마디가 간절해요.",
      emotionTags: ["sad", "lonely"],
      situationTags: ["friendship"],
      desiredReplyType: "COMFORT",
      riskLevel: "NORMAL",
      language: "ko_KR",
      status: "PENDING"
    }
  });

  const highRiskLetter = await prisma.letter.create({
    data: {
      authorId: secondResponder.id,
      rawText:
        "오늘 밤 혼자 버티기가 너무 두렵고 제 자신이 안전하지 않은 것 같아 누군가에게 도움을 청하고 싶습니다.",
      processedText:
        "오늘 밤 혼자 버티기가 너무 두렵고 제 자신이 안전하지 않은 것 같아 누군가에게 도움을 청하고 싶습니다.",
      emotionTags: ["overwhelmed"],
      situationTags: ["life"],
      desiredReplyType: "COMFORT",
      riskLevel: "HIGH",
      language: "ko_KR",
      status: "ROUTED_TO_SUPPORT"
    }
  });

  const approvedReply = await prisma.reply.create({
    data: {
      letterId: approvedLetter.id,
      responderId: responder.id,
      rawText:
        "낯선 곳에서 혼자 밤을 보내는 마음이 얼마나 쓸쓸했을지 전해져요. 이곳에 마음을 적어주셔서 고맙고, 오늘 밤은 조금이나마 덜 외로우셨으면 좋겠습니다.",
      coachedText:
        "낯선 곳에서 혼자 밤을 보내는 마음이 얼마나 쓸쓸했을지 전해져요. 이곳에 마음을 적어주셔서 고맙고, 오늘 밤은 조금이나마 덜 외로우셨으면 좋겠습니다. 모든 것을 당장 해결하지 않아도 당신의 마음은 그 자체로 소중해요.",
      status: "APPROVED"
    }
  });

  await prisma.reply.create({
    data: {
      letterId: approvedLetter.id,
      responderId: secondResponder.id,
      rawText:
        "동호회에 가입하고 규칙적인 일정을 만들면 금방 해결될 거예요.",
      coachedText:
        "일 때문에 새로운 곳으로 옮겨오며 외로움을 느끼시는 게 당연해요. 낯선 환경이 조금씩 익숙해질 때까지 스스로에게 너그러운 시간을 선물하셨으면 좋겠습니다.",
      status: "PENDING"
    }
  });

  await prisma.match.create({
    data: {
      letterId: approvedLetter.id,
      responderId: responder.id,
      status: "RESPONDED",
      matchReason: "선호하시는 답장 방식과 깊이 공명하는 편지입니다."
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
        reason: "일반 위험도 편지 승인 완료",
        previousStatus: "PENDING/NORMAL",
        newStatus: "APPROVED/NORMAL"
      },
      {
        targetType: "LETTER",
        targetId: pendingLetter.id,
        action: "SUBMITTED",
        reason: "작성자 편지 제출 및 검토 대기",
        previousStatus: "DRAFT",
        newStatus: "PENDING"
      },
      {
        targetType: "LETTER",
        targetId: highRiskLetter.id,
        action: "SAFETY_ROUTED",
        reason: "고위험 위기 감지 — EXIT 전문 지원 정보로 즉시 안내",
        previousStatus: "DRAFT",
        newStatus: "ROUTED_TO_SUPPORT"
      },
      {
        targetType: "REPLY",
        targetId: approvedReply.id,
        action: "ADMIN_MODERATED",
        reason: "또래 공감 답장 승인 완료",
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
