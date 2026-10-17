import type {
  AiMiddleware,
  AnonymizationInput,
  AnonymizationResult,
  CoachReplyInput,
  CoachedReplyResult,
  ProcessLetterInput,
  ProcessedLetterResult,
  ResonanceMatchInput,
  ResonanceMatchResult,
  RiskClassificationInput,
  RiskClassificationResult,
  WritingSparksInput,
  WritingSparksResult
} from "@/lib/ai/middleware";
import type { ReplyType } from "@/lib/domain";
import { aiSettings } from "@/settings";

const emotionDictionary: Array<[string, string[]]> = [
  ["lonely", ["lonely", "alone", "isolated", "외로움", "외로워", "혼자", "고립", "孤独", "孤单"]],
  ["anxious", ["anxious", "panic", "worried", "scared", "불안", "초조", "걱정", "두려워", "焦虑", "慌张"]],
  ["sad", ["sad", "grief", "crying", "heartbroken", "슬픔", "우울", "눈물", "마음아파", "难过", "伤心"]],
  ["overwhelmed", ["overwhelmed", "burned out", "too much", "번아웃", "지침", "지쳤어", "과부하", "崩溃", "心累"]],
  ["ashamed", ["ashamed", "embarrassed", "guilty", "자책", "부끄러워", "죄책감", "내탓", "自责", "惭愧"]],
  ["angry", ["angry", "furious", "resentful", "화남", "억울", "분노", "원망", "生气", "委屈"]]
];

const situationDictionary: Array<[string, string[]]> = [
  ["work", ["work", "job", "boss", "career", "company", "직장", "회사", "상사", "야근", "이직", "工作", "上班"]],
  ["family", ["family", "parent", "mother", "father", "sibling", "가족", "부모", "엄마", "아빠", "형제", "家庭", "父母"]],
  ["relationship", ["partner", "breakup", "dating", "relationship", "연애", "이별", "애인", "연인", "헤어짐", "恋爱", "分手"]],
  ["school", ["school", "class", "exam", "teacher", "college", "학교", "시험", "성적", "공부", "대학", "学校", "考试"]],
  ["health", ["health", "sick", "illness", "body", "건강", "아픔", "병원", "몸", "피로", "生病", "健康"]],
  ["friendship", ["friend", "friends", "friendship", "친구", "우정", "대인관계", "싸움", "朋友", "人际"]]
];

const desiredReplyHints: Array<[ReplyType, string[]]> = [
  ["JUST_BEING_HEARD", ["heard", "listen", "no advice", "do not need advice", "들어줘", "조언사절", "그냥들어", "倾听"]],
  ["COMFORT", ["comfort", "kind words", "reassurance", "위로", "따뜻한말", "안아줘", "토닥", "安慰", "温暖"]],
  ["SIMILAR_EXPERIENCES", ["similar", "been through", "experience", "비슷한", "경험", "나같은사람", "공감", "相似", "经历"]],
  ["ADVICE", ["advice", "what should i do", "suggestion", "조언", "어떡하죠", "어떻게해야", "해결", "建议", "怎么办"]]
];

export class MockAiMiddleware implements AiMiddleware {
  private delayMs: number;

  constructor(options?: { delayMs?: number }) {
    this.delayMs = options?.delayMs ?? aiSettings.mockDelayMs ?? 40;
  }

  async processLetter(input: ProcessLetterInput): Promise<ProcessedLetterResult> {
    if (!aiSettings.enabled) {
      return {
        processedText: normalizeLetter(input.text),
        emotionTags: [],
        situationTags: [],
        desiredReplyType: input.preferredReplyType,
        anonymization: { text: input.text, flaggedTerms: [] },
        risk: { level: "NORMAL", reasons: [], peerSafe: true }
      };
    }

    const anonymization = aiSettings.enableAnonymization
      ? await this.anonymize({
          text: input.text,
          language: input.language
        })
      : { text: input.text, flaggedTerms: [] };

    const risk = aiSettings.enableRiskSafety
      ? await this.classifyRisk({
          text: input.text,
          language: input.language
        })
      : { level: "NORMAL" as const, reasons: [], peerSafe: true };

    const desiredReplyType = inferDesiredReplyType(
      anonymization.text,
      input.preferredReplyType
    );

    return {
      processedText: normalizeLetter(anonymization.text),
      emotionTags: collectTags(anonymization.text, emotionDictionary, ["uncertain"]),
      situationTags: collectTags(anonymization.text, situationDictionary, ["life"]),
      desiredReplyType,
      anonymization,
      risk
    };
  }

  async coachReply(input: CoachReplyInput): Promise<CoachedReplyResult> {
    if (!aiSettings.enabled || !aiSettings.enableReplyCoach) {
      return {
        coachedText: input.replyText,
        flags: [],
        suggestions: [],
        reframings: [],
        metrics: { empathy: 85, gentleness: 85, nonJudgmental: 85 }
      };
    }

    const lang = normalizeAiLang(input.language);
    const lower = input.replyText.toLowerCase();
    const flags: string[] = [];
    const suggestions: string[] = [];

    if (
      /\b(should|must|just|obviously|stop feeling sorry)\b/i.test(input.replyText) ||
      /(당연히|해야 해|해야지|틀렸어|왜 그랬어|그만 징징)/.test(input.replyText) ||
      /(你应该|必须|显然|别再矫情)/.test(input.replyText)
    ) {
      flags.push("judgmental");
      suggestions.push(
        lang === "ko_KR"
          ? "작성자가 무엇을 해야 하는지 단정하거나 지시하기보다, 지금 느끼는 감정을 먼저 있는 그대로 읽어주세요."
          : lang === "zh_CN"
            ? "请先温柔地看见并呼应写信人的感受，而不是直接告诉对方应该怎么做。"
            : "Name the feeling without telling the writer what they must do."
      );
    }

    if (
      input.desiredReplyType !== "ADVICE" &&
      (/\b(fix|solution|you need to|you have to|routine|plan)\b/i.test(input.replyText) ||
        /(해결책|방법은|이렇게 해봐|플랜|루틴|실천)/.test(input.replyText) ||
        /(解决方法|你得|去做计划)/.test(input.replyText))
    ) {
      flags.push("too_advice_heavy");
      suggestions.push(
        lang === "ko_KR"
          ? "작성자는 해결책보다 따뜻한 경청을 원하고 있어요. 조언은 가볍게 줄이거나 공감의 말로 대신해 보세요."
          : lang === "zh_CN"
            ? "写信人更希望被倾听，建议减少具体解决方案，多给予温暖的陪伴。"
            : "The writer asked to be heard, so keep advice light or leave it out."
      );
    }

    if (
      /\b(at least|not a big deal|get over it)\b/i.test(input.replyText) ||
      /(별일 아니야|시간이 약|다들 그래|나 때는)/.test(input.replyText) ||
      /(算了吧|没什么大不了|大家都是这样)/.test(input.replyText)
    ) {
      flags.push("invalidating");
      suggestions.push(
        lang === "ko_KR"
          ? "작성자가 겪은 아픔이나 무게를 가볍게 여기거나 축소하는 표현은 피해 주세요."
          : lang === "zh_CN"
            ? "请避免淡化或轻视写信人正在经历的痛苦与不易。"
            : "Avoid minimizing the experience."
      );
    }

    const enFirstPersonCount = lower.split(/\b(i|me|my)\b/g).length;
    const koFirstPersonCount = (input.replyText.match(/(제가|나는|내 생각엔|저도|내가)/g) ?? []).length;
    if (enFirstPersonCount > 6 || koFirstPersonCount >= 5) {
      flags.push("centers_responder");
      suggestions.push(
        lang === "ko_KR"
          ? "자신의 경험은 짧게 나누고, 다시 편지 작성자의 마음에 초점을 돌려주세요."
          : lang === "zh_CN"
            ? "只需简短分享您的个人经历，随后请将注意力重新回到写信人身上。"
            : "Use your experience only briefly, then return attention to the writer."
      );
    }

    const coachedText =
      flags.length === 0
        ? normalizeReply(input.replyText)
        : buildWarmerReply(input.replyText, input.desiredReplyType, lang);

    // Dynamic reframings across 3 compassionate tones
    const reframings = [
      {
        label: lang === "ko_KR" ? "온화한 공감" : lang === "zh_CN" ? "温润共情" : "Gentle Empathy",
        text: buildEmpatheticReframing(input.replyText, lang),
        tone: "warm" as const
      },
      {
        label: lang === "ko_KR" ? "경청 중심" : lang === "zh_CN" ? "专注倾听" : "Deep Listening",
        text: buildListeningReframing(input.replyText, lang),
        tone: "listening" as const
      },
      {
        label: lang === "ko_KR" ? "차분한 지지" : lang === "zh_CN" ? "从容支持" : "Calm Grounding",
        text: buildGroundingReframing(input.replyText, lang),
        tone: "grounding" as const
      }
    ];

    const metrics = {
      empathy: flags.includes("invalidating") ? 55 : 92,
      gentleness: flags.includes("too_advice_heavy") ? 65 : 95,
      nonJudgmental: flags.includes("judgmental") ? 50 : 98
    };

    const defaultSuggestion =
      lang === "ko_KR"
        ? "작성자의 마음에 초점을 맞춘 다정하고 온기 있는 답장입니다."
        : lang === "zh_CN"
          ? "这封回信温和体贴，很好地将关怀聚焦在写信人身上。"
          : "This reads gentle and centered on the writer.";

    return {
      coachedText,
      flags,
      suggestions: suggestions.length > 0 ? suggestions : [defaultSuggestion],
      reframings,
      metrics
    };
  }

  async classifyRisk(
    input: RiskClassificationInput
  ): Promise<RiskClassificationResult> {
    if (!aiSettings.enabled || !aiSettings.enableRiskSafety) {
      return {
        level: "NORMAL",
        reasons: [],
        peerSafe: true
      };
    }

    const lang = normalizeAiLang(input.language);
    const text = input.text.toLowerCase();

    if (
      /\b(kill someone|hurt someone|graphic violence|explicit threat)\b/i.test(text) ||
      /(타인을 해치|죽이겠다|폭력|테러|살해)/.test(text) ||
      /(伤害他人|暴力威胁|杀人)/.test(text)
    ) {
      return {
        level: "BLOCKED",
        reasons: [
          lang === "ko_KR"
            ? "타인 위협 또는 폭력적 위험 요소 감지"
            : lang === "zh_CN"
              ? "检测到潜在威胁或暴力风险内容"
              : "possible threat or graphic unsafe content"
        ],
        peerSafe: false,
        supportMessage: getSafetySupportMessage(lang)
      };
    }

    if (
      /\b(kill myself|hurt myself|self harm|suicide|end my life|do not feel safe)\b/i.test(text) ||
      /(자살|자해|죽고 싶|생을 마감|세상을 떠나고|더 살기 싫)/.test(text) ||
      /(自杀|自残|不想活了|结束生命)/.test(text)
    ) {
      return {
        level: "HIGH",
        reasons: [
          lang === "ko_KR"
            ? "자해·자살 등 즉각적인 신변 안전 위기 징후 감지"
            : lang === "zh_CN"
              ? "检测到直接个人安全或自伤风险"
              : "possible immediate personal safety risk"
        ],
        peerSafe: false,
        supportMessage: getSafetySupportMessage(lang)
      };
    }

    if (
      /\b(abuse|assault|trauma|stalking|unsafe at home)\b/i.test(text) ||
      /(학대|폭행|가정폭력|스토킹|성범죄|트라우마)/.test(text) ||
      /(虐待|家暴|跟踪|创伤|受袭)/.test(text)
    ) {
      return {
        level: "SENSITIVE",
        reasons: [
          lang === "ko_KR"
            ? "트라우마·학대 등 세심한 검토가 필요한 민감 사연"
            : lang === "zh_CN"
              ? "涉及创伤或敏感经历，需额外人工审核"
              : "sensitive experience needing extra moderation review"
        ],
        peerSafe: false
      };
    }

    return {
      level: "NORMAL",
      reasons: [],
      peerSafe: true
    };
  }

  async anonymize(input: AnonymizationInput): Promise<AnonymizationResult> {
    if (!aiSettings.enabled || !aiSettings.enableAnonymization) {
      return {
        text: input.text,
        flaggedTerms: []
      };
    }

    const lang = normalizeAiLang(input.language);
    const flaggedTerms: string[] = [];
    let text = input.text;

    // 1. Korean & International Phone Numbers
    text = text.replace(/01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}\b/g, () => {
      flaggedTerms.push("phone number");
      return "[연락처 비공개]";
    });
    text = text.replace(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g, () => {
      flaggedTerms.push("phone number");
      return lang === "ko_KR"
        ? "[연락처 비공개]"
        : lang === "zh_CN"
          ? "[已隐藏电话]"
          : "[phone removed]";
    });

    // 2. Korean Resident Registration Number (주민등록번호)
    text = text.replace(/\b\d{6}[-.\s]?[1-4]\d{6}\b/g, () => {
      flaggedTerms.push("resident registration number");
      return "[식별번호 비공개]";
    });

    // 3. Bank Account Numbers (계좌번호 패턴)
    text = text.replace(/\b\d{3,6}[-.\s]\d{2,6}[-.\s]\d{3,6}\b/g, () => {
      flaggedTerms.push("bank account");
      return "[계좌번호 비공개]";
    });

    // 4. Email Addresses
    text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => {
      flaggedTerms.push("email address");
      return lang === "ko_KR"
        ? "[이메일 비공개]"
        : lang === "zh_CN"
          ? "[已隐藏邮箱]"
          : "[email removed]";
    });

    // 5. KakaoTalk / Social IDs
    text = text.replace(
      /(?:카카오톡|카톡|Kakao|Line|라인|텔레그램|Telegram)\s*(?:아이디|ID|id)?(?:\s*(?:는|은|이|가))?\s*[:：]?\s*([a-zA-Z0-9._-]{4,20})/gi,
      () => {
        flaggedTerms.push("messaging handle");
        return "[메신저 아이디 비공개]";
      }
    );

    // 6. Names (English & Korean)
    text = text.replace(/\b[Mm]y name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g, () => {
      flaggedTerms.push("possible name");
      return lang === "ko_KR"
        ? "제 이름은 [이름 비공개]"
        : lang === "zh_CN"
          ? "我的名字是 [已隐藏姓名]"
          : "my name is [name removed]";
    });
    text = text.replace(/\bI am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g, () => {
      flaggedTerms.push("possible name");
      return lang === "ko_KR"
        ? "저는 [이름 비공개]"
        : lang === "zh_CN"
          ? "我是 [已隐藏姓名]"
          : "I am [name removed]";
    });
    text = text.replace(/(?:제 이름은|저는)\s+([가-힣]{2,4})(?:입니다|이라고 합니다|예요|에요)/g, () => {
      flaggedTerms.push("possible name");
      return "저는 [이름 비공개]입니다";
    });

    return {
      text,
      flaggedTerms: Array.from(new Set(flaggedTerms))
    };
  }

  async generateWritingSparks(input: WritingSparksInput): Promise<WritingSparksResult> {
    if (!aiSettings.enabled || !aiSettings.enableWritingSparks) {
      return {
        sparks: [],
        suggestedEmotionTags: []
      };
    }

    const lang = normalizeAiLang(input.language);
    const mood = (input.mood ?? "").toLowerCase();

    if (lang === "ko_KR") {
      if (mood.includes("burnout") || mood.includes("지침") || mood.includes("번아웃")) {
        return {
          sparks: [
            { id: "spark-1", text: "열심히 달려왔다고 생각했는데, 문득 돌아보니 마음의 에너지가 바닥나 있었어요.", prompt: "지친 마음 돌아보기" },
            { id: "spark-2", text: "누구에게도 짐이 되고 싶지 않아 괜찮은 척했지만, 오늘은 조금 버겁다고 고백해봅니다.", prompt: "스스로를 안아주기" },
            { id: "spark-3", text: "잠시 모든 역할을 내려놓고, 아무것도 증명하지 않아도 되는 나로서 쉬고 싶어요.", prompt: "무거운 짐 내려놓기" }
          ],
          suggestedEmotionTags: ["overwhelmed", "tired"]
        };
      }
      if (mood.includes("anxious") || mood.includes("불안") || mood.includes("막막")) {
        return {
          sparks: [
            { id: "spark-1", text: "내일이 오는 게 두렵고, 머릿속에 수많은 생각과 걱정들이 엉켜 잠들기 어려워요.", prompt: "엉킨 생각 정리" },
            { id: "spark-2", text: "어떤 선택이 맞는지, 내가 잘 가고 있는지 확신이 서지 않아 발걸음이 무거워요.", prompt: "흔들리는 마음" },
            { id: "spark-3", text: "심장이 불쑥 빠르게 뛸 때가 많아, 잠시 숨을 고르며 솔직한 마음을 적어내려갑니다.", prompt: "호흡 가다듬기" }
          ],
          suggestedEmotionTags: ["anxious", "uncertain"]
        };
      }
      if (mood.includes("ashamed") || mood.includes("자책") || mood.includes("부끄")) {
        return {
          sparks: [
            { id: "spark-1", text: "이미 지나간 일인데도 자꾸만 내 탓인 것 같아 마음이 무겁고 스스로가 작아지는 기분이에요.", prompt: "자책 내려놓기" },
            { id: "spark-2", text: "누구에게도 말 못 할 실수나 부끄러운 마음을 혼자 삼키다 보니 어느새 숨이 턱 막혀왔어요.", prompt: "서툰 나 마주하기" },
            { id: "spark-3", text: "완벽하지 못했던 어제의 나를 너무 미워하지 않도록, 오늘은 조용히 속마음을 털어놓아 봅니다.", prompt: "스스로 용서하기" }
          ],
          suggestedEmotionTags: ["ashamed", "self_compassion"]
        };
      }
      // Default: loneliness / comfort
      return {
        sparks: [
          { id: "spark-1", text: "요즘 부쩍 혼자 있는 시간이 길어지며, 마음 한구석이 서늘하게 비어있는 것 같아요.", prompt: "외로움의 자리" },
          { id: "spark-2", text: "수많은 사람들 속에 있어도 나만 홀로 겉도는 기분이 들어 조용히 글을 띄웁니다.", prompt: "마음의 거리" },
          { id: "spark-3", text: "어디서부터 털어놓아야 할지 망설였지만, 서툰 말이라도 누군가 들어주었으면 해요.", prompt: "첫 말문 열기" }
        ],
        suggestedEmotionTags: ["lonely", "seeking_comfort"]
      };
    }

    if (lang === "zh_CN") {
      if (mood.includes("burnout")) {
        return {
          sparks: [
            { id: "spark-1", text: "一直拼命往前跑，停下来才发现心里的力气好像已经耗尽了。", prompt: "觉察疲惫" },
            { id: "spark-2", text: "不想成为任何人的负担而假装坚强，但今天我想承认自己真的很累。", prompt: "拥抱自己" },
            { id: "spark-3", text: "想暂时放下所有身份与期待，做一个不需要证明任何事的自己。", prompt: "卸下重担" }
          ],
          suggestedEmotionTags: ["overwhelmed", "tired"]
        };
      }
      if (mood.includes("anxious")) {
        return {
          sparks: [
            { id: "spark-1", text: "对明天感到莫名的惶恐，脑海里思绪万千，久久难以入眠。", prompt: "梳理思绪" },
            { id: "spark-2", text: "不确定眼前的选择是否正确，每一步都走得很沉重。", prompt: "安放迷茫" },
            { id: "spark-3", text: "心跳总是不由自主地加快，想借着这封信慢下来深呼吸一次。", prompt: "平复呼吸" }
          ],
          suggestedEmotionTags: ["anxious", "uncertain"]
        };
      }
      if (mood.includes("ashamed")) {
        return {
          sparks: [
            { id: "spark-1", text: "明明事情已经过去，却还是忍不住把错都揽在自己身上。", prompt: "放下自责" },
            { id: "spark-2", text: "有些难以启齿的遗憾一直压在心底，今天想鼓起勇气写下来。", prompt: "直面脆弱" },
            { id: "spark-3", text: "希望能对那个不够完美的自己温柔一点，不再一味苛责。", prompt: "自我宽恕" }
          ],
          suggestedEmotionTags: ["ashamed", "self_compassion"]
        };
      }
      return {
        sparks: [
          { id: "spark-1", text: "最近一个人待着的时间变长了，总觉得心底深处空落落的。", prompt: "倾吐孤单" },
          { id: "spark-2", text: "明明身边人来人往，我却好像游离在人群之外，不知所措。", prompt: "迷茫心绪" },
          { id: "spark-3", text: "不想成为别人的负担，但今天我真的很想被温柔地听一听。", prompt: "卸下防备" }
        ],
        suggestedEmotionTags: ["lonely", "comfort"]
      };
    }

    // en_US default
    if (mood.includes("burnout")) {
      return {
        sparks: [
          { id: "spark-1", text: "I kept pushing forward for so long, and only now realized my emotional battery is completely empty.", prompt: "Recognizing burnout" },
          { id: "spark-2", text: "I did not want to burden anyone so I pretended to be fine, but today I need to admit I am exhausted.", prompt: "Dropping the mask" },
          { id: "spark-3", text: "For just a moment, I want to set down every role and rest without having to prove anything.", prompt: "Setting down weight" }
        ],
        suggestedEmotionTags: ["overwhelmed", "tired"]
      };
    }
    if (mood.includes("anxious")) {
      return {
        sparks: [
          { id: "spark-1", text: "Tomorrow feels daunting, and my thoughts keep tangling up whenever I try to rest.", prompt: "Untangling worry" },
          { id: "spark-2", text: "I am not sure if I am walking in the right direction, and every step feels heavy with doubt.", prompt: "Walking through doubt" },
          { id: "spark-3", text: "My heart has been racing lately, so I am pausing here to take a slow breath and write honestly.", prompt: "Slowing the breath" }
        ],
        suggestedEmotionTags: ["anxious", "uncertain"]
      };
    }
    if (mood.includes("ashamed")) {
      return {
        sparks: [
          { id: "spark-1", text: "Even though time has passed, I keep blaming myself and feeling small inside.", prompt: "Releasing self-blame" },
          { id: "spark-2", text: "Swallowing mistakes I could not tell anyone has left a heavy knot in my chest.", prompt: "Facing imperfection" },
          { id: "spark-3", text: "I want to stop being so harsh on yesterday's version of me and speak gently here.", prompt: "Self-forgiveness" }
        ],
        suggestedEmotionTags: ["ashamed", "self_compassion"]
      };
    }
    return {
      sparks: [
        { id: "spark-1", text: "Lately the days feel unusually quiet, and there is an empty corner in my chest.", prompt: "Quiet loneliness" },
        { id: "spark-2", text: "Even around other people, I feel like I am walking on the outside looking in.", prompt: "Feeling detached" },
        { id: "spark-3", text: "I tried to keep it all together, but today I just need a place where I do not have to pretend.", prompt: "Being vulnerable" }
      ],
      suggestedEmotionTags: ["lonely", "seeking_care"]
    };
  }

  async matchResonantLetters(input: ResonanceMatchInput): Promise<ResonanceMatchResult> {
    if (!aiSettings.enabled || !aiSettings.enableResonanceMatch) {
      return {
        recommendedLetterIds: input.availableLetters.map((l) => l.id),
        matchReasons: {}
      };
    }

    const lang = normalizeAiLang(input.language);
    const recommended: string[] = [];
    const reasons: Record<string, string> = {};

    const modeReason =
      lang === "ko_KR"
        ? "선호하시는 답장 방식과 깊이 공명하는 편지입니다."
        : lang === "zh_CN"
          ? "与您偏好的回信方式高度契合。"
          : "Matches your preferred reply mode perfectly.";

    const healingReason =
      lang === "ko_KR"
        ? "따뜻한 감정적 위로와 경청이 필요한 사연입니다."
        : lang === "zh_CN"
          ? "这封信正需要温柔的情感共鸣与倾听。"
          : "Resonates with common emotional healing needs.";

    const openReason =
      lang === "ko_KR"
        ? "조용한 또래 공명을 기다리고 있는 편지입니다."
        : lang === "zh_CN"
          ? "正在等待一份温暖的同伴回音。"
          : "Open for gentle peer resonance.";

    for (const letter of input.availableLetters) {
      if (letter.desiredReplyType === input.responderPreference) {
        recommended.push(letter.id);
        reasons[letter.id] = modeReason;
      } else if (letter.emotionTags.some((tag) => ["lonely", "sad", "overwhelmed"].includes(tag))) {
        recommended.push(letter.id);
        reasons[letter.id] = healingReason;
      }
    }

    // If none matched strictly, recommend the first few
    if (recommended.length === 0) {
      const fallbackIds = input.availableLetters.slice(0, 3).map((l) => l.id);
      return {
        recommendedLetterIds: fallbackIds,
        matchReasons: Object.fromEntries(fallbackIds.map((id) => [id, openReason]))
      };
    }

    return {
      recommendedLetterIds: recommended,
      matchReasons: reasons
    };
  }
}

function normalizeAiLang(language?: string): "ko_KR" | "zh_CN" | "en_US" {
  if (!language) return "ko_KR";
  const lower = language.trim().toLowerCase();
  if (lower.startsWith("ko")) return "ko_KR";
  if (lower.startsWith("zh")) return "zh_CN";
  return "en_US";
}

function getSafetySupportMessage(language: string): string {
  const lang = normalizeAiLang(language);
  if (lang === "ko_KR") {
    return "현재 겪고 계신 마음의 무게는 익명 또래 편지만으로는 안전하게 다루기 어려울 수 있습니다. 언제든 도움을 받을 수 있는 24시간 전문 위기상담 기관으로 연결해 드립니다.";
  }
  if (lang === "zh_CN") {
    return "您当前的心情与困境非常重要，匿名同伴信箱可能无法提供及时的专业保护。我们建议您联系身边的信任者或24小时专业危机求助热线。";
  }
  return "This situation feels too delicate for an anonymous peer letterbox alone. Please consider reaching out to a professional 24/7 crisis helpline where someone can support you immediately.";
}

function normalizeLetter(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.endsWith(".") || trimmed.endsWith("!") || trimmed.endsWith("?") ? trimmed : `${trimmed}.`;
}

function normalizeReply(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.endsWith(".") || trimmed.endsWith("!") || trimmed.endsWith("?") ? trimmed : `${trimmed}.`;
}

function collectTags(
  text: string,
  dictionary: Array<[string, string[]]>,
  fallback: string[]
): string[] {
  const lower = text.toLowerCase();
  const tags = dictionary
    .filter(([, terms]) => terms.some((term) => lower.includes(term)))
    .map(([tag]) => tag);
  return tags.length > 0 ? tags : fallback;
}

function inferDesiredReplyType(text: string, fallback: ReplyType): ReplyType {
  const lower = text.toLowerCase();
  return (
    desiredReplyHints.find(([, hints]) => hints.some((hint) => lower.includes(hint)))?.[0] ??
    fallback
  );
}

function buildWarmerReply(replyText: string, desiredReplyType: ReplyType, language = "ko_KR"): string {
  const lang = normalizeAiLang(language);
  if (lang === "ko_KR") {
    const base = "그 마음이 얼마나 무거웠을지 짐작이 가요. 용기 내어 솔직한 감정을 적어주셔서 참 고맙습니다.";
    if (desiredReplyType === "ADVICE") {
      return `${base} 서두르지 말고, 오늘 하루 나를 위해 할 수 있는 가장 작은 휴식 하나부터 챙겨보셨으면 좋겠어요.`;
    }
    if (desiredReplyType === "SIMILAR_EXPERIENCES") {
      return `${base} 저 역시 모든 게 낯설고 외로웠던 때가 있어 그 마음에 깊이 공감합니다. 온전히 편안해지시길 바랄게요.`;
    }
    return `${base} 억지로 괜찮은 척하지 않아도, 그 마음 그대로 충분히 소중합니다.`;
  }

  if (lang === "zh_CN") {
    const base = "能感受到你心里的沉重。谢谢你鼓起勇气在这里写下真实的感受。";
    if (desiredReplyType === "ADVICE") {
      return `${base} 不必急着立刻解决所有问题，今天不妨先为自己留出一小段安静喘息的时间。`;
    }
    if (desiredReplyType === "SIMILAR_EXPERIENCES") {
      return `${base} 我也曾有过感到陌生与孤单的时刻，很理解你的心情，愿你今晚能睡个安稳觉。`;
    }
    return `${base} 你不需要强颜欢笑，你此刻的感受本身就值得被温柔对待。`;
  }

  const base =
    "It makes sense that this would feel heavy. I hear how much you have been carrying, and I am glad you wrote it down here.";
  if (desiredReplyType === "ADVICE") {
    return `${base} If it feels useful, one gentle next step might be to choose the smallest thing that helps you feel a little less alone today.`;
  }
  if (desiredReplyType === "SIMILAR_EXPERIENCES") {
    return `${base} I have known moments where a change made everything feel unfamiliar too, and I hope you can be met with patience.`;
  }
  return `${base} You do not have to make this tidy before it deserves care.`;
}

function buildEmpatheticReframing(replyText: string, language: string): string {
  const lang = normalizeAiLang(language);
  if (lang === "ko_KR") {
    return `보내주신 사연을 읽으며 마음이 많이 먹먹했어요. 혼자서 그 많은 짐을 감당하느라 얼마나 고단하셨을까요. 비록 멀리 있지만 온 마음으로 응원과 온기를 보냅니다.`;
  }
  if (lang === "zh_CN") {
    return `读着你的来信，心里感到一阵酸楚。一个人默默承受这些，一定很累吧。虽然隔着屏幕，但我真心为你送上一份陪伴与暖意。`;
  }
  return `Reading your words, I can really feel the weight you have been carrying alone. I hear you, and you are not as alone as it feels right now. Sending warmth your way.`;
}

function buildListeningReframing(replyText: string, language: string): string {
  const lang = normalizeAiLang(language);
  if (lang === "ko_KR") {
    return `어떤 말로도 다 위로가 될 수 없겠지만, 당신이 겪은 아픔과 혼란을 조용히 끝까지 귀 기울여 들었습니다. 말해주셔서 감사해요.`;
  }
  if (lang === "zh_CN") {
    return `或许千言万语都不足以完全宽慰，但我只想静静地守在一旁，听你倾诉所有的委屈与疲惫。谢谢你愿意写下来。`;
  }
  return `No words can fix this instantly, but I wanted you to know that I listened to every single word. Thank you for trusting this space with your honest thoughts.`;
}

function buildGroundingReframing(replyText: string, language: string): string {
  const lang = normalizeAiLang(language);
  if (lang === "ko_KR") {
    return `지금 당장 무언가를 해결하거나 괜찮아지려고 애쓰지 않아도 괜찮아요. 그저 오늘 하루, 숨 한 번 깊게 쉬며 나를 돌봐주세요.`;
  }
  if (lang === "zh_CN") {
    return `此刻你无需急着去解决一切，也不必强迫自己立刻振作起来。今天就请深呼吸一次，先好好善待疲惫的自己。`;
  }
  return `You do not have to figure everything out right now. Please give yourself permission to just breathe, rest, and take today one gentle moment at a time.`;
}

