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
import { MockAiMiddleware } from "@/lib/ai/mock";

export interface LlmConfig {
  provider: "openai" | "deepseek" | "custom";
  apiKey?: string;
  baseURL?: string;
  model?: string;
  timeoutMs?: number;
}

export class LlmAiMiddleware implements AiMiddleware {
  private fallback: MockAiMiddleware;
  private config: LlmConfig;

  constructor(customConfig?: Partial<LlmConfig>) {
    this.fallback = new MockAiMiddleware();

    const envProvider = (process.env.AI_PROVIDER ?? "").toLowerCase().trim();
    const provider = (customConfig?.provider ??
      (envProvider === "openai" || envProvider === "deepseek" || envProvider === "custom"
        ? envProvider
        : "openai")) as "openai" | "deepseek" | "custom";

    let defaultBaseURL = "https://api.openai.com/v1";
    let defaultModel = "gpt-4o-mini";
    let apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

    if (provider === "deepseek") {
      defaultBaseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
      defaultModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";
      apiKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY;
    } else if (provider === "openai") {
      defaultBaseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
      apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    } else {
      defaultBaseURL = process.env.AI_BASE_URL || "https://api.openai.com/v1";
      defaultModel = process.env.AI_MODEL || "gpt-4o-mini";
      apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    }

    this.config = {
      provider,
      apiKey: customConfig?.apiKey ?? apiKey,
      baseURL: (customConfig?.baseURL ?? process.env.AI_BASE_URL ?? defaultBaseURL).replace(/\/+$/, ""),
      model: customConfig?.model ?? process.env.AI_MODEL ?? defaultModel,
      timeoutMs: customConfig?.timeoutMs ?? 10000
    };
  }

  get isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.apiKey.trim().length > 0);
  }

  getConfig(): Readonly<LlmConfig> {
    return this.config;
  }

  private async callChatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error(`LLM provider ${this.config.provider} API key not configured.`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No content returned from LLM chat completion.");
      }
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  async processLetter(input: ProcessLetterInput): Promise<ProcessedLetterResult> {
    if (!this.isConfigured) {
      return this.fallback.processLetter(input);
    }

    try {
      const systemPrompt = `You are the empathetic processing middleware for the 46Hz emotional support letterbox.
Analyze the user's incoming anonymous letter.
Output a valid JSON object strictly matching this schema:
{
  "processedText": "cleaned up and gently normalized letter text with no PII",
  "emotionTags": ["array of 1-3 lowercase emotion tags e.g. lonely, anxious, sad, overwhelmed, ashamed, angry"],
  "situationTags": ["array of 1-3 lowercase situation tags e.g. work, family, relationship, school, health, friendship"],
  "desiredReplyType": "one of: COMFORT, ADVICE, SIMILAR_EXPERIENCES, JUST_BEING_HEARD",
  "anonymization": {
    "text": "text with names, phones, emails removed",
    "flaggedTerms": ["array of detected PII types"]
  },
  "risk": {
    "level": "one of: NORMAL, SENSITIVE, HIGH, BLOCKED",
    "reasons": ["array of risk explanations if any"],
    "peerSafe": boolean,
    "supportMessage": "optional crisis helpline guidance if level is HIGH or BLOCKED"
  }
}
Risk level rules:
- BLOCKED: threats, graphic violence, harassment, illegal harm. peerSafe=false.
- HIGH: explicit self-harm, suicide intent, acute crisis. peerSafe=false.
- SENSITIVE: deep trauma, abuse, severe distress requiring extra moderation. peerSafe=false.
- NORMAL: ordinary sadness, loneliness, workplace stress, breakup, grief suitable for peer support. peerSafe=true.`;

      const userPrompt = `Language: ${input.language}\nPreferred Reply Type: ${input.preferredReplyType}\nRaw Letter:\n${input.text}`;

      const rawJson = await this.callChatCompletion(systemPrompt, userPrompt);
      const parsed = extractJson(rawJson);

      return {
        processedText: parsed.processedText ?? input.text,
        emotionTags: Array.isArray(parsed.emotionTags) && parsed.emotionTags.length > 0 ? parsed.emotionTags : ["reflective"],
        situationTags: Array.isArray(parsed.situationTags) && parsed.situationTags.length > 0 ? parsed.situationTags : ["life"],
        desiredReplyType: normalizeReplyType(parsed.desiredReplyType, input.preferredReplyType),
        anonymization: {
          text: parsed.anonymization?.text ?? input.text,
          flaggedTerms: Array.isArray(parsed.anonymization?.flaggedTerms) ? parsed.anonymization.flaggedTerms : []
        },
        risk: {
          level: normalizeRiskLevel(parsed.risk?.level),
          reasons: Array.isArray(parsed.risk?.reasons) ? parsed.risk.reasons : [],
          peerSafe: parsed.risk?.peerSafe ?? (normalizeRiskLevel(parsed.risk?.level) === "NORMAL"),
          supportMessage: parsed.risk?.supportMessage
        }
      };
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in processLetter, falling back to Mock:", err);
      return this.fallback.processLetter(input);
    }
  }

  async coachReply(input: CoachReplyInput): Promise<CoachedReplyResult> {
    if (!this.isConfigured) {
      return this.fallback.coachReply(input);
    }

    try {
      const systemPrompt = `You are the gentle reply coaching middleware for 46Hz.
Review the peer's draft reply to ensure it is supportive, non-judgmental, and respects the writer's desired reply type (${input.desiredReplyType}).
Output a valid JSON object strictly matching this schema:
{
  "coachedText": "a warm, refined, gentle version of the reply that keeps the responder's voice",
  "flags": ["array of detected tone flags e.g. judgmental, too_advice_heavy, invalidating, centers_responder"],
  "suggestions": ["array of practical gentle suggestions for the responder"]
}`;

      const userPrompt = `Letter excerpt:\n${input.letterText}\n\nDesired Reply Type: ${input.desiredReplyType}\n\nDraft Reply:\n${input.replyText}`;

      const rawJson = await this.callChatCompletion(systemPrompt, userPrompt);
      const parsed = extractJson(rawJson);

      return {
        coachedText: parsed.coachedText ?? input.replyText,
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
          ? parsed.suggestions
          : ["This reply feels considerate and gentle."]
      };
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in coachReply, falling back to Mock:", err);
      return this.fallback.coachReply(input);
    }
  }

  async classifyRisk(input: RiskClassificationInput): Promise<RiskClassificationResult> {
    if (!this.isConfigured) {
      return this.fallback.classifyRisk(input);
    }

    try {
      const systemPrompt = `You are the safety classifier for 46Hz.
Classify incoming text into: NORMAL, SENSITIVE, HIGH, or BLOCKED.
Output a valid JSON object strictly matching:
{
  "level": "NORMAL" | "SENSITIVE" | "HIGH" | "BLOCKED",
  "reasons": string[],
  "peerSafe": boolean,
  "supportMessage": string | null
}`;
      const userPrompt = `Language: ${input.language}\nText:\n${input.text}`;

      const rawJson = await this.callChatCompletion(systemPrompt, userPrompt);
      const parsed = extractJson(rawJson);
      const level = normalizeRiskLevel(parsed.level);

      return {
        level,
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
        peerSafe: parsed.peerSafe ?? (level === "NORMAL"),
        supportMessage: parsed.supportMessage || undefined
      };
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in classifyRisk, falling back to Mock:", err);
      return this.fallback.classifyRisk(input);
    }
  }

  async anonymize(input: AnonymizationInput): Promise<AnonymizationResult> {
    if (!this.isConfigured) {
      return this.fallback.anonymize(input);
    }

    try {
      const systemPrompt = `You are the anonymization middleware for 46Hz.
Remove any personally identifiable information (PII) including full names, telephone numbers, emails, and exact locations. Replace them with [name removed], [phone removed], etc.
Output JSON:
{
  "text": "anonymized text",
  "flaggedTerms": ["array of PII types found"]
}`;
      const userPrompt = `Language: ${input.language}\nText:\n${input.text}`;

      const rawJson = await this.callChatCompletion(systemPrompt, userPrompt);
      const parsed = extractJson(rawJson);

      return {
        text: parsed.text ?? input.text,
        flaggedTerms: Array.isArray(parsed.flaggedTerms) ? parsed.flaggedTerms : []
      };
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in anonymize, falling back to Mock:", err);
      return this.fallback.anonymize(input);
    }
  }
}

export function normalizeRiskLevel(val: any): "NORMAL" | "SENSITIVE" | "HIGH" | "BLOCKED" {
  if (typeof val !== "string") return "NORMAL";
  const upper = val.trim().toUpperCase();
  if (upper === "SENSITIVE" || upper === "HIGH" || upper === "BLOCKED" || upper === "NORMAL") {
    return upper as "NORMAL" | "SENSITIVE" | "HIGH" | "BLOCKED";
  }
  return "NORMAL";
}

export function normalizeReplyType(
  val: any,
  fallback: "COMFORT" | "ADVICE" | "SIMILAR_EXPERIENCES" | "JUST_BEING_HEARD"
): "COMFORT" | "ADVICE" | "SIMILAR_EXPERIENCES" | "JUST_BEING_HEARD" {
  if (typeof val !== "string") return fallback;
  const upper = val.trim().toUpperCase();
  if (
    upper === "COMFORT" ||
    upper === "ADVICE" ||
    upper === "SIMILAR_EXPERIENCES" ||
    upper === "JUST_BEING_HEARD"
  ) {
    return upper as "COMFORT" | "ADVICE" | "SIMILAR_EXPERIENCES" | "JUST_BEING_HEARD";
  }
  return fallback;
}

export function extractJson(raw: string): any {
  // Strip DeepSeek R1 / Reasoning thinking blocks if present
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt markdown json match ```json ... ```
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // Continue to outermost brace fallback
      }
    }

    // Attempt to extract outermost JSON object { ... }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // Fall through to error
      }
    }

    throw new Error(`Unable to parse JSON from LLM response: ${raw.slice(0, 100)}...`);
  }
}

