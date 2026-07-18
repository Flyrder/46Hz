import type {
  AiMiddleware,
  AnonymizationInput,
  AnonymizationResult,
  CoachReplyInput,
  CoachedReplyResult,
  ProcessLetterInput,
  ProcessedLetterResult,
  RiskClassificationInput,
  RiskClassificationResult
} from "@/lib/ai/middleware";
import type { ReplyType } from "@/lib/domain";

const emotionDictionary: Array<[string, string[]]> = [
  ["lonely", ["lonely", "alone", "isolated"]],
  ["anxious", ["anxious", "panic", "worried", "scared"]],
  ["sad", ["sad", "grief", "crying", "heartbroken"]],
  ["overwhelmed", ["overwhelmed", "burned out", "too much"]],
  ["ashamed", ["ashamed", "embarrassed", "guilty"]],
  ["angry", ["angry", "furious", "resentful"]]
];

const situationDictionary: Array<[string, string[]]> = [
  ["work", ["work", "job", "boss", "career", "company"]],
  ["family", ["family", "parent", "mother", "father", "sibling"]],
  ["relationship", ["partner", "breakup", "dating", "relationship"]],
  ["school", ["school", "class", "exam", "teacher", "college"]],
  ["health", ["health", "sick", "illness", "body"]],
  ["friendship", ["friend", "friends", "friendship"]]
];

const desiredReplyHints: Array<[ReplyType, string[]]> = [
  ["JUST_BEING_HEARD", ["heard", "listen", "no advice", "do not need advice"]],
  ["COMFORT", ["comfort", "kind words", "reassurance"]],
  ["SIMILAR_EXPERIENCES", ["similar", "been through", "experience"]],
  ["ADVICE", ["advice", "what should i do", "suggestion"]]
];

export class MockAiMiddleware implements AiMiddleware {
  async processLetter(input: ProcessLetterInput): Promise<ProcessedLetterResult> {
    const anonymization = await this.anonymize({
      text: input.text,
      language: input.language
    });
    const risk = await this.classifyRisk({
      text: input.text,
      language: input.language
    });
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
    const lower = input.replyText.toLowerCase();
    const flags: string[] = [];
    const suggestions: string[] = [];

    if (/\b(should|must|just|obviously|stop feeling sorry)\b/i.test(input.replyText)) {
      flags.push("judgmental");
      suggestions.push("Name the feeling without telling the writer what they must do.");
    }

    if (
      input.desiredReplyType !== "ADVICE" &&
      /\b(fix|solution|you need to|you have to|routine|plan)\b/i.test(input.replyText)
    ) {
      flags.push("too_advice_heavy");
      suggestions.push("The writer asked to be heard, so keep advice light or leave it out.");
    }

    if (/\b(at least|not a big deal|get over it)\b/i.test(input.replyText)) {
      flags.push("invalidating");
      suggestions.push("Avoid minimizing the experience.");
    }

    if (/\b(i|me|my)\b/g.test(lower) && lower.split(/\b(i|me|my)\b/g).length > 6) {
      flags.push("centers_responder");
      suggestions.push("Use your experience only briefly, then return attention to the writer.");
    }

    const coachedText =
      flags.length === 0
        ? normalizeReply(input.replyText)
        : buildWarmerReply(input.replyText, input.desiredReplyType);

    return {
      coachedText,
      flags,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ["This already reads gentle and focused on the writer."]
    };
  }

  async classifyRisk(
    input: RiskClassificationInput
  ): Promise<RiskClassificationResult> {
    const text = input.text.toLowerCase();

    if (/\b(kill someone|hurt someone|graphic violence|explicit threat)\b/i.test(text)) {
      return {
        level: "BLOCKED",
        reasons: ["possible threat or graphic unsafe content"],
        peerSafe: false,
        supportMessage: safetySupportMessage
      };
    }

    if (
      /\b(kill myself|hurt myself|self harm|suicide|end my life|do not feel safe)\b/i.test(
        text
      )
    ) {
      return {
        level: "HIGH",
        reasons: ["possible immediate personal safety risk"],
        peerSafe: false,
        supportMessage: safetySupportMessage
      };
    }

    if (/\b(abuse|assault|trauma|stalking|unsafe at home)\b/i.test(text)) {
      return {
        level: "SENSITIVE",
        reasons: ["sensitive experience needing extra moderation review"],
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
    const flaggedTerms: string[] = [];
    let text = input.text;

    text = text.replace(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g, () => {
      flaggedTerms.push("phone number");
      return "[phone removed]";
    });

    text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => {
      flaggedTerms.push("email address");
      return "[email removed]";
    });

    text = text.replace(/\b[Mm]y name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g, () => {
      flaggedTerms.push("possible name");
      return "my name is [name removed]";
    });

    text = text.replace(/\bI am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g, () => {
      flaggedTerms.push("possible name");
      return "I am [name removed]";
    });

    return {
      text,
      flaggedTerms: Array.from(new Set(flaggedTerms))
    };
  }
}

const safetySupportMessage =
  "This feels too important for an anonymous peer letter. Please consider reaching out to a trusted person nearby or a local support resource.";

function normalizeLetter(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

function normalizeReply(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
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

function buildWarmerReply(replyText: string, desiredReplyType: ReplyType): string {
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
