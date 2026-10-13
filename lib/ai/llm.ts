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
import { MockAiMiddleware } from "@/lib/ai/mock";

export interface LlmConfig {
  provider: "openai" | "deepseek" | "gemini" | "anthropic" | "ollama" | "custom";
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
    const validProviders: LlmConfig["provider"][] = [
      "openai",
      "deepseek",
      "gemini",
      "anthropic",
      "ollama",
      "custom"
    ];
    const provider = (customConfig?.provider ??
      (validProviders.includes(envProvider as any) ? envProvider : "openai")) as LlmConfig["provider"];

    let defaultBaseURL = "https://api.openai.com/v1";
    let defaultModel = "gpt-4o-mini";
    let apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

    if (provider === "deepseek") {
      defaultBaseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
      defaultModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";
      apiKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY;
    } else if (provider === "gemini") {
      defaultBaseURL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
      defaultModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    } else if (provider === "anthropic") {
      defaultBaseURL = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1";
      defaultModel = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";
      apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;
    } else if (provider === "ollama") {
      defaultBaseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
      defaultModel = process.env.OLLAMA_MODEL || "llama3.2";
      apiKey = process.env.OLLAMA_API_KEY || "ollama";
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
    if (this.config.provider === "ollama") return true;
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
      if (this.config.provider === "anthropic") {
        const response = await fetch(`${this.config.baseURL}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey ?? "",
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: this.config.model,
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }]
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Anthropic API responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text;
        if (!content) {
          throw new Error("No content returned from Anthropic message.");
        }
        return content;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (this.config.apiKey) {
        headers["Authorization"] = `Bearer ${this.config.apiKey}`;
      }

      const requestBody: Record<string, any> = {
        model: this.config.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      };

      if (
        this.config.provider === "openai" ||
        this.config.provider === "deepseek" ||
        this.config.provider === "gemini"
      ) {
        requestBody.response_format = { type: "json_object" };
      }

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
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
        emotionTags:
          Array.isArray(parsed.emotionTags) && parsed.emotionTags.length > 0
            ? parsed.emotionTags
            : ["reflective"],
        situationTags:
          Array.isArray(parsed.situationTags) && parsed.situationTags.length > 0
            ? parsed.situationTags
            : ["life"],
        desiredReplyType: normalizeReplyType(parsed.desiredReplyType, input.preferredReplyType),
        anonymization: {
          text: parsed.anonymization?.text ?? input.text,
          flaggedTerms: Array.isArray(parsed.anonymization?.flaggedTerms)
            ? parsed.anonymization.flaggedTerms
            : []
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
  "suggestions": ["array of practical gentle suggestions for the responder"],
  "reframings": [
    { "label": "온화한 공감", "text": "...", "tone": "warm" },
    { "label": "경청 중심", "text": "...", "tone": "listening" },
    { "label": "차분한 지지", "text": "...", "tone": "grounding" }
  ],
  "metrics": {
    "empathy": 90,
    "gentleness": 95,
    "nonJudgmental": 98
  }
}`;

      const userPrompt = `Letter excerpt:\n${input.letterText}\n\nDesired Reply Type: ${input.desiredReplyType}\nLanguage: ${input.language}\n\nDraft Reply:\n${input.replyText}`;

      const rawJson = await this.callChatCompletion(systemPrompt, userPrompt);
      const parsed = extractJson(rawJson);

      const mockCoached = await this.fallback.coachReply(input);

      return {
        coachedText: parsed.coachedText ?? input.replyText,
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        suggestions:
          Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
            ? parsed.suggestions
            : ["This reply feels considerate and gentle."],
        reframings:
          Array.isArray(parsed.reframings) && parsed.reframings.length >= 3
            ? parsed.reframings
            : mockCoached.reframings,
        metrics:
          parsed.metrics && typeof parsed.metrics.empathy === "number"
            ? {
                empathy: Math.min(100, Math.max(0, parsed.metrics.empathy)),
                gentleness: Math.min(100, Math.max(0, parsed.metrics.gentleness ?? 90)),
                nonJudgmental: Math.min(100, Math.max(0, parsed.metrics.nonJudgmental ?? 90))
              }
            : mockCoached.metrics
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
Remove any personally identifiable information (PII) including full names, telephone numbers, emails, resident numbers, and exact locations. Replace them with [name removed], [phone removed], etc.
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

  async generateWritingSparks(input: WritingSparksInput): Promise<WritingSparksResult> {
    if (!this.isConfigured) {
      return this.fallback.generateWritingSparks(input);
    }

    try {
      const systemPrompt = `You are the creative writing prompt assistant for 46Hz emotional letterbox.
Generate 3 gentle, evocative first sentences to help someone begin writing an anonymous letter about their feelings.
Output a valid JSON object strictly matching this schema:
{
  "sparks": [
    { "id": "spark-1", "text": "first sentence...", "prompt": "short 2-4 word theme label" },
    { "id": "spark-2", "text": "first sentence...", "prompt": "short 2-4 word theme label" },
    { "id": "spark-3", "text": "first sentence...", "prompt": "short 2-4 word theme label" }
  ],
  "suggestedEmotionTags": ["tag1", "tag2"]
}`;

      const userPrompt = `Language: ${input.language}\nMood hint: ${input.mood ?? "lonely"}\nSeed text if any: ${input.seedText ?? ""}`;

      const rawJson = await this.callChatCompletion(systemPrompt, userPrompt);
      const parsed = extractJson(rawJson);

      if (Array.isArray(parsed.sparks) && parsed.sparks.length > 0) {
        return {
          sparks: parsed.sparks.map((s: any, idx: number) => ({
            id: s.id || `spark-${idx + 1}`,
            text: s.text || "",
            prompt: s.prompt || "감정 표현하기"
          })),
          suggestedEmotionTags: Array.isArray(parsed.suggestedEmotionTags)
            ? parsed.suggestedEmotionTags
            : ["reflective"]
        };
      }

      return this.fallback.generateWritingSparks(input);
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in generateWritingSparks, falling back to Mock:", err);
      return this.fallback.generateWritingSparks(input);
    }
  }

  async matchResonantLetters(input: ResonanceMatchInput): Promise<ResonanceMatchResult> {
    if (!this.isConfigured) {
      return this.fallback.matchResonantLetters(input);
    }

    try {
      const systemPrompt = `You are the empathetic resonance matcher for 46Hz.
Given a responder's preferred reply style and a list of available anonymous letters seeking support, pick the letters that best resonate with the responder.
Output a valid JSON object strictly matching this schema:
{
  "recommendedLetterIds": ["id1", "id2"],
  "matchReasons": {
    "id1": "short gentle reason why this resonates",
    "id2": "short gentle reason why this resonates"
  }
}`;

      const userPrompt = `Responder preference: ${input.responderPreference}\nAvailable Letters:\n${JSON.stringify(input.availableLetters, null, 2)}`;

      const rawJson = await this.callChatCompletion(systemPrompt, userPrompt);
      const parsed = extractJson(rawJson);

      if (Array.isArray(parsed.recommendedLetterIds) && parsed.recommendedLetterIds.length > 0) {
        return {
          recommendedLetterIds: parsed.recommendedLetterIds,
          matchReasons:
            typeof parsed.matchReasons === "object" && parsed.matchReasons !== null
              ? parsed.matchReasons
              : {}
        };
      }

      return this.fallback.matchResonantLetters(input);
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in matchResonantLetters, falling back to Mock:", err);
      return this.fallback.matchResonantLetters(input);
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
