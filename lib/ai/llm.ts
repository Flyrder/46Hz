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
import {
  aiSettings,
  DEFAULT_AI_PROMPT_ANONYMIZATION,
  DEFAULT_AI_PROMPT_REPLY_COACH,
  DEFAULT_AI_PROMPT_RESONANCE_MATCH,
  DEFAULT_AI_PROMPT_RISK_SAFETY,
  DEFAULT_AI_PROMPT_WRITING_SPARKS,
  DEFAULT_AI_SYSTEM_PROMPT,
  type SupportedAiThinkingLevel
} from "@/settings";

export const GEMINI_DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
export const GEMINI_API_REVISION = "2026-05-20";
export const GEMINI_DEFAULT_MODEL = "gemini-3.8-flash";

export const SUPPORTED_GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-4-argon",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemma-4-31b-it"
] as const;

export interface LlmConfig {
  provider: "gemini" | "mock";
  apiKey?: string;
  baseURL?: string;
  model?: string;
  systemPrompt?: string;
  timeoutMs?: number;
  temperature?: number;
  maxTokens?: number;
  thinkingLevel?: SupportedAiThinkingLevel;
  storeInteractions?: boolean;
  promptRiskSafety?: string;
  promptAnonymization?: string;
  promptReplyCoach?: string;
  promptWritingSparks?: string;
  promptResonanceMatch?: string;
}

export interface GeminiInteractionCreateRequest {
  model: string;
  input: string | Array<Record<string, unknown>>;
  system_instruction?: string;
  store?: boolean;
  generation_config?: {
    thinking_level?: SupportedAiThinkingLevel;
    max_output_tokens?: number;
  };
  response_format?: {
    type: "text";
    mime_type: "application/json";
    schema: Record<string, unknown>;
  };
}

export interface GeminiInteractionStepContent {
  type?: string;
  text?: string;
}

export interface GeminiInteractionStep {
  type?: "thought" | "model_output" | "tool_call" | string;
  content?: GeminiInteractionStepContent[];
}

export interface GeminiInteractionResponse {
  id?: string;
  status?: string;
  output_text?: string;
  steps?: GeminiInteractionStep[];
  outputs?: Array<{ type?: string; text?: string }>;
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
}

export interface AiConnectionTestResult {
  ok: boolean;
  provider: "mock" | "gemini";
  model: string;
  endpoint: string;
  thinkingLevel: SupportedAiThinkingLevel;
  storeInteractions: boolean;
  latencyMs: number;
  message: string;
  error?: string;
}

/**
 * Resolves any model string to a valid, non-deprecated Gemini model identifier.
 * Automatically upgrades legacy models (gemini-1.5-*, gemini-2.0-*, gemini-2.5-*, gpt-*)
 * per the gemini-api-dev specification.
 */
export function resolveGeminiModel(rawModel?: string): string {
  const trimmed = (rawModel ?? "").trim();
  if (!trimmed) {
    return GEMINI_DEFAULT_MODEL;
  }

  const lower = trimmed.toLowerCase();

  // Upgrade deprecated Pro models to gemini-4-argon
  if (
    lower === "gemini-2.5-pro" ||
    lower === "gemini-1.5-pro" ||
    lower.startsWith("gemini-2.5-pro-") ||
    lower.startsWith("gemini-1.5-pro-")
  ) {
    return "gemini-4-argon";
  }

  // Upgrade deprecated Flash-Lite models to gemini-3.5-flash-lite
  if (
    lower === "gemini-2.5-flash-lite" ||
    lower === "gemini-2.0-flash-lite" ||
    lower.startsWith("gemini-2.5-flash-lite-") ||
    lower.startsWith("gemini-2.0-flash-lite-")
  ) {
    return "gemini-3.5-flash-lite";
  }

  // Upgrade deprecated Flash or legacy non-Gemini model strings to gemini-3.8-flash
  if (
    lower.startsWith("gemini-1.5-") ||
    lower.startsWith("gemini-2.0-") ||
    lower.startsWith("gemini-2.5-") ||
    lower.startsWith("gpt-") ||
    lower.startsWith("deepseek-") ||
    lower.startsWith("claude-") ||
    lower.startsWith("llama")
  ) {
    return GEMINI_DEFAULT_MODEL;
  }

  return trimmed;
}

/**
 * Normalizes a custom or default Gemini API base URL to the native /v1beta endpoint root
 * (stripping any legacy /openai or trailing /interactions suffixes).
 */
export function normalizeGeminiBaseUrl(rawUrl?: string): string {
  const trimmed = (rawUrl ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    return GEMINI_DEFAULT_BASE_URL;
  }

  // Strip accidental legacy /openai or /chat/completions or /interactions suffix
  const stripped = trimmed
    .replace(/\/v1beta\/openai(?:\/chat\/completions)?$/i, "/v1beta")
    .replace(/\/openai(?:\/chat\/completions)?$/i, "")
    .replace(/\/interactions$/i, "");

  if (stripped === "https://generativelanguage.googleapis.com") {
    return GEMINI_DEFAULT_BASE_URL;
  }

  return stripped || GEMINI_DEFAULT_BASE_URL;
}

/**
 * Resolves effective thinking_level and max_output_tokens for the selected Gemini model.
 * Note: gemini-4-argon supports "low" | "medium" | "high" (not "minimal") and requires
 * max_output_tokens >= 32768 so reasoning tokens do not starve output tokens.
 */
export function resolveGeminiGenerationConfig(
  model: string,
  thinkingLevel: SupportedAiThinkingLevel = "low",
  maxTokens = 4096
): {
  thinking_level: SupportedAiThinkingLevel;
  max_output_tokens: number;
} {
  const isArgon = model.toLowerCase().includes("gemini-4-argon");
  const normalizedLevel: SupportedAiThinkingLevel =
    isArgon && thinkingLevel === "minimal" ? "low" : thinkingLevel;
  const normalizedMaxTokens = isArgon ? Math.max(32768, maxTokens) : Math.max(50, maxTokens);

  return {
    thinking_level: normalizedLevel,
    max_output_tokens: normalizedMaxTokens
  };
}

/**
 * Extracts text from a Native Gemini Interactions API response object, ignoring
 * any internal reasoning (`step.type === "thought"`) blocks.
 */
export function extractInteractionOutputText(data: GeminiInteractionResponse): string {
  if (typeof data?.output_text === "string" && data.output_text.trim().length > 0) {
    return data.output_text.trim();
  }

  if (Array.isArray(data?.steps)) {
    const textChunks: string[] = [];
    for (const step of data.steps) {
      if (step?.type === "thought") continue;
      if (step?.type === "model_output" && Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item?.type === "text" && typeof item.text === "string") {
            textChunks.push(item.text);
          }
        }
      }
    }
    const joined = textChunks.join("").trim();
    if (joined.length > 0) {
      return joined;
    }
  }

  if (Array.isArray(data?.outputs)) {
    const textChunks = data.outputs
      .filter((out) => out?.type !== "thought" && typeof out?.text === "string")
      .map((out) => out.text as string);
    const joined = textChunks.join("").trim();
    if (joined.length > 0) {
      return joined;
    }
  }

  if (Array.isArray(data?.candidates)) {
    const parts = data.candidates[0]?.content?.parts;
    if (Array.isArray(parts)) {
      const textChunks = parts
        .filter((part) => !part?.thought && typeof part?.text === "string")
        .map((part) => part.text as string);
      const joined = textChunks.join("").trim();
      if (joined.length > 0) {
        return joined;
      }
    }
  }

  throw new Error("No output text returned from Gemini Interactions API.");
}

// Structured Output JSON Schemas for all 6 AI capabilities
const PROCESS_LETTER_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    processedText: { type: "string" },
    emotionTags: { type: "array", items: { type: "string" } },
    situationTags: { type: "array", items: { type: "string" } },
    desiredReplyType: {
      type: "string",
      enum: ["COMFORT", "ADVICE", "SIMILAR_EXPERIENCES", "JUST_BEING_HEARD"]
    },
    anonymization: {
      type: "object",
      properties: {
        text: { type: "string" },
        flaggedTerms: { type: "array", items: { type: "string" } }
      },
      required: ["text", "flaggedTerms"],
      additionalProperties: false
    },
    risk: {
      type: "object",
      properties: {
        level: { type: "string", enum: ["NORMAL", "SENSITIVE", "HIGH", "BLOCKED"] },
        reasons: { type: "array", items: { type: "string" } },
        peerSafe: { type: "boolean" },
        supportMessage: { type: "string" }
      },
      required: ["level", "reasons", "peerSafe"],
      additionalProperties: false
    }
  },
  required: [
    "processedText",
    "emotionTags",
    "situationTags",
    "desiredReplyType",
    "anonymization",
    "risk"
  ],
  additionalProperties: false
};

const COACH_REPLY_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    coachedText: { type: "string" },
    flags: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } },
    reframings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          text: { type: "string" },
          tone: { type: "string", enum: ["warm", "listening", "grounding"] }
        },
        required: ["label", "text", "tone"],
        additionalProperties: false
      }
    },
    metrics: {
      type: "object",
      properties: {
        empathy: { type: "number" },
        gentleness: { type: "number" },
        nonJudgmental: { type: "number" }
      },
      required: ["empathy", "gentleness", "nonJudgmental"],
      additionalProperties: false
    }
  },
  required: ["coachedText", "flags", "suggestions", "reframings", "metrics"],
  additionalProperties: false
};

const CLASSIFY_RISK_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    level: { type: "string", enum: ["NORMAL", "SENSITIVE", "HIGH", "BLOCKED"] },
    reasons: { type: "array", items: { type: "string" } },
    peerSafe: { type: "boolean" },
    supportMessage: { type: "string" }
  },
  required: ["level", "reasons", "peerSafe"],
  additionalProperties: false
};

const ANONYMIZE_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    text: { type: "string" },
    flaggedTerms: { type: "array", items: { type: "string" } }
  },
  required: ["text", "flaggedTerms"],
  additionalProperties: false
};

const WRITING_SPARKS_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    sparks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          prompt: { type: "string" }
        },
        required: ["id", "text", "prompt"],
        additionalProperties: false
      }
    },
    suggestedEmotionTags: { type: "array", items: { type: "string" } }
  },
  required: ["sparks", "suggestedEmotionTags"],
  additionalProperties: false
};

const RESONANCE_MATCH_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    recommendedLetterIds: { type: "array", items: { type: "string" } },
    matchReasons: {
      type: "object",
      additionalProperties: { type: "string" }
    }
  },
  required: ["recommendedLetterIds", "matchReasons"],
  additionalProperties: false
};

export class LlmAiMiddleware implements AiMiddleware {
  private fallback: MockAiMiddleware;
  private config: LlmConfig;

  constructor(customConfig?: Partial<LlmConfig>) {
    this.fallback = new MockAiMiddleware({
      delayMs: aiSettings.mockDelayMs
    });

    const apiKey =
      customConfig?.apiKey ??
      (aiSettings.apiKey?.trim() || undefined) ??
      process.env.GEMINI_API_KEY ??
      process.env.AI_API_KEY;

    const rawBaseUrl =
      customConfig?.baseURL ??
      (aiSettings.baseUrl?.trim() || undefined) ??
      process.env.GEMINI_BASE_URL ??
      process.env.AI_BASE_URL;

    const rawModel =
      customConfig?.model ??
      (aiSettings.model?.trim() || undefined) ??
      process.env.GEMINI_MODEL ??
      process.env.AI_MODEL ??
      GEMINI_DEFAULT_MODEL;

    this.config = {
      provider: "gemini",
      apiKey,
      baseURL: normalizeGeminiBaseUrl(rawBaseUrl),
      model: resolveGeminiModel(rawModel),
      systemPrompt:
        customConfig?.systemPrompt ??
        (aiSettings.systemPrompt?.trim() || DEFAULT_AI_SYSTEM_PROMPT),
      timeoutMs: customConfig?.timeoutMs ?? aiSettings.timeoutMs ?? 12000,
      temperature: customConfig?.temperature ?? aiSettings.temperature ?? 0.7,
      maxTokens: customConfig?.maxTokens ?? aiSettings.maxTokens ?? 4096,
      thinkingLevel: customConfig?.thinkingLevel ?? aiSettings.thinkingLevel ?? "low",
      storeInteractions: customConfig?.storeInteractions ?? aiSettings.storeInteractions ?? false,
      promptRiskSafety:
        customConfig?.promptRiskSafety ??
        (aiSettings.promptRiskSafety?.trim() || DEFAULT_AI_PROMPT_RISK_SAFETY),
      promptAnonymization:
        customConfig?.promptAnonymization ??
        (aiSettings.promptAnonymization?.trim() || DEFAULT_AI_PROMPT_ANONYMIZATION),
      promptReplyCoach:
        customConfig?.promptReplyCoach ??
        (aiSettings.promptReplyCoach?.trim() || DEFAULT_AI_PROMPT_REPLY_COACH),
      promptWritingSparks:
        customConfig?.promptWritingSparks ??
        (aiSettings.promptWritingSparks?.trim() || DEFAULT_AI_PROMPT_WRITING_SPARKS),
      promptResonanceMatch:
        customConfig?.promptResonanceMatch ??
        (aiSettings.promptResonanceMatch?.trim() || DEFAULT_AI_PROMPT_RESONANCE_MATCH)
    };
  }

  get isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.apiKey.trim().length > 0);
  }

  getConfig(): Readonly<LlmConfig> {
    return this.config;
  }

  private buildSystemInstruction(functionDirectives: string, outputContract: string): string {
    const sections: string[] = [];
    const base = this.config.systemPrompt?.trim();
    if (base) {
      sections.push(`[System Initial Prompt]\n${base}`);
    }
    const directives = functionDirectives.trim();
    if (directives) {
      sections.push(`[Function Directives]\n${directives}`);
    }
    const contract = outputContract.trim();
    if (contract) {
      sections.push(`[Structured Output Contract]\n${contract}`);
    }
    return sections.join("\n\n");
  }

  /**
   * Calls the Native Google Gemini Interactions API (`POST /v1beta/interactions`).
   */
  private async callGeminiInteraction(
    systemInstruction: string,
    userInput: string,
    schema: Record<string, unknown>
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error("Gemini API key (GEMINI_API_KEY) is not configured.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const model = resolveGeminiModel(this.config.model);
    const generationConfig = resolveGeminiGenerationConfig(
      model,
      this.config.thinkingLevel ?? "low",
      this.config.maxTokens ?? 4096
    );

    const requestBody: GeminiInteractionCreateRequest = {
      model,
      input: userInput,
      system_instruction: systemInstruction,
      store: Boolean(this.config.storeInteractions),
      generation_config: generationConfig,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema
      }
    };

    try {
      const response = await fetch(`${this.config.baseURL}/interactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.config.apiKey ?? "",
          "Api-Revision": GEMINI_API_REVISION
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Interactions API responded with ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as GeminiInteractionResponse;
      return extractInteractionOutputText(data);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Executes a live diagnostic request against the Native Gemini Interactions API.
   */
  async testConnection(): Promise<AiConnectionTestResult> {
    const startTime = Date.now();
    const model = resolveGeminiModel(this.config.model);
    const endpoint = `${this.config.baseURL}/interactions`;
    const genCfg = resolveGeminiGenerationConfig(
      model,
      this.config.thinkingLevel ?? "low",
      this.config.maxTokens ?? 4096
    );

    if (!this.isConfigured) {
      return {
        ok: false,
        provider: "gemini",
        model,
        endpoint,
        thinkingLevel: genCfg.thinking_level,
        storeInteractions: Boolean(this.config.storeInteractions),
        latencyMs: 0,
        message: "Gemini API key is missing.",
        error: "GEMINI_API_KEY is not configured. Provide an API key in System Settings or environment variables."
      };
    }

    try {
      const rawJson = await this.callGeminiInteraction(
        this.buildSystemInstruction(
          "Verify connectivity for 46Hz emotional support middleware.",
          'Return JSON: {"status": "ok", "message": "46Hz Gemini Interactions API ready"}'
        ),
        "Ping 46Hz Gemini Interactions health check.",
        {
          type: "object",
          properties: {
            status: { type: "string" },
            message: { type: "string" }
          },
          required: ["status", "message"],
          additionalProperties: false
        }
      );
      const parsed = extractJson(rawJson);
      return {
        ok: true,
        provider: "gemini",
        model,
        endpoint,
        thinkingLevel: genCfg.thinking_level,
        storeInteractions: Boolean(this.config.storeInteractions),
        latencyMs: Math.max(1, Date.now() - startTime),
        message: parsed.message || "Connected to Native Gemini Interactions API."
      };
    } catch (err) {
      return {
        ok: false,
        provider: "gemini",
        model,
        endpoint,
        thinkingLevel: genCfg.thinking_level,
        storeInteractions: Boolean(this.config.storeInteractions),
        latencyMs: Math.max(1, Date.now() - startTime),
        message: "Failed to connect to Native Gemini Interactions API.",
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  async processLetter(input: ProcessLetterInput): Promise<ProcessedLetterResult> {
    if (!aiSettings.enabled || !this.isConfigured) {
      return this.fallback.processLetter(input);
    }

    try {
      const directiveParts: string[] = [];
      if (aiSettings.enableAnonymization) {
        directiveParts.push(
          `[Anonymization & PII Scrubbing]\n${this.config.promptAnonymization || DEFAULT_AI_PROMPT_ANONYMIZATION}`
        );
      } else {
        directiveParts.push(
          "[Anonymization Disabled]\nPreserve original text without redacting names or contact details; return empty flaggedTerms."
        );
      }

      if (aiSettings.enableRiskSafety) {
        directiveParts.push(
          `[Risk & Safety Triage]\n${this.config.promptRiskSafety || DEFAULT_AI_PROMPT_RISK_SAFETY}`
        );
      } else {
        directiveParts.push(
          "[Risk Triage Disabled]\nSet risk.level to NORMAL, reasons to [], and peerSafe to true."
        );
      }

      const outputContract = `Analyze the incoming anonymous letter.
IMPORTANT: Write "processedText", "anonymization.text", and "risk.supportMessage" in the exact language specified by Language (${input.language}).
However, "emotionTags" and "situationTags" MUST use canonical lowercase English slugs from the allowed sets below:
- emotionTags: 1-3 slugs from [lonely, anxious, sad, overwhelmed, ashamed, angry, uncertain, tired, seeking_comfort, comfort, reflective, self_compassion, burnout, grief, hopeful]
- situationTags: 1-3 slugs from [work, family, relationship, school, health, friendship, life, career, future, self]
- desiredReplyType: one of [COMFORT, ADVICE, SIMILAR_EXPERIENCES, JUST_BEING_HEARD]`;

      const systemInstruction = this.buildSystemInstruction(
        directiveParts.join("\n\n"),
        outputContract
      );
      const userPrompt = `Language: ${input.language}\nPreferred Reply Type: ${input.preferredReplyType}\nRaw Letter:\n${input.text}`;

      const rawJson = await this.callGeminiInteraction(
        systemInstruction,
        userPrompt,
        PROCESS_LETTER_SCHEMA
      );
      const parsed = extractJson(rawJson);

      const anonymization: AnonymizationResult = aiSettings.enableAnonymization
        ? {
            text: parsed.anonymization?.text ?? input.text,
            flaggedTerms: Array.isArray(parsed.anonymization?.flaggedTerms)
              ? parsed.anonymization.flaggedTerms
              : []
          }
        : {
            text: input.text,
            flaggedTerms: []
          };

      const normalizedLevel = normalizeRiskLevel(parsed.risk?.level);
      const risk: RiskClassificationResult = aiSettings.enableRiskSafety
        ? {
            level: normalizedLevel,
            reasons: Array.isArray(parsed.risk?.reasons) ? parsed.risk.reasons : [],
            peerSafe: parsed.risk?.peerSafe ?? normalizedLevel === "NORMAL",
            supportMessage: parsed.risk?.supportMessage
          }
        : {
            level: "NORMAL",
            reasons: [],
            peerSafe: true
          };

      return {
        processedText: aiSettings.enableAnonymization
          ? (parsed.processedText ?? anonymization.text)
          : input.text,
        emotionTags:
          Array.isArray(parsed.emotionTags) && parsed.emotionTags.length > 0
            ? parsed.emotionTags
            : ["reflective"],
        situationTags:
          Array.isArray(parsed.situationTags) && parsed.situationTags.length > 0
            ? parsed.situationTags
            : ["life"],
        desiredReplyType: normalizeReplyType(parsed.desiredReplyType, input.preferredReplyType),
        anonymization,
        risk
      };
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in processLetter, falling back to Mock:", err);
      return this.fallback.processLetter(input);
    }
  }

  async coachReply(input: CoachReplyInput): Promise<CoachedReplyResult> {
    if (!aiSettings.enabled || !aiSettings.enableReplyCoach || !this.isConfigured) {
      return this.fallback.coachReply(input);
    }

    try {
      const isKo = !input.language || input.language.toLowerCase().startsWith("ko");
      const isZh = input.language?.toLowerCase().startsWith("zh");
      const labelWarm = isKo ? "온화한 공감" : isZh ? "温润共情" : "Gentle Empathy";
      const labelListen = isKo ? "경청 중심" : isZh ? "专注倾听" : "Deep Listening";
      const labelGround = isKo ? "차분한 지지" : isZh ? "从容支持" : "Calm Grounding";

      const outputContract = `Review the peer's draft reply to ensure it is supportive, non-judgmental, and respects the writer's desired reply type (${input.desiredReplyType}).
IMPORTANT: Write "coachedText", all items in "suggestions", and all "reframings[].text" in the language specified by Language (${input.language}).
Keep "flags" as canonical lowercase slugs from: judgmental, too_advice_heavy, invalidating, centers_responder.
Provide 3 reframings with labels "${labelWarm}" (tone: "warm"), "${labelListen}" (tone: "listening"), and "${labelGround}" (tone: "grounding"), plus metrics { empathy, gentleness, nonJudgmental } from 0 to 100.`;

      const systemInstruction = this.buildSystemInstruction(
        this.config.promptReplyCoach || DEFAULT_AI_PROMPT_REPLY_COACH,
        outputContract
      );
      const userPrompt = `Letter excerpt:\n${input.letterText}\n\nDesired Reply Type: ${input.desiredReplyType}\nLanguage: ${input.language}\n\nDraft Reply:\n${input.replyText}`;

      const rawJson = await this.callGeminiInteraction(
        systemInstruction,
        userPrompt,
        COACH_REPLY_SCHEMA
      );
      const parsed = extractJson(rawJson);

      const mockCoached = await this.fallback.coachReply(input);

      return {
        coachedText: parsed.coachedText ?? input.replyText,
        flags: Array.isArray(parsed.flags) ? parsed.flags : [],
        suggestions:
          Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
            ? parsed.suggestions
            : mockCoached.suggestions,
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
    if (!aiSettings.enabled || !aiSettings.enableRiskSafety || !this.isConfigured) {
      return this.fallback.classifyRisk(input);
    }

    try {
      const outputContract = `Classify incoming text into: NORMAL, SENSITIVE, HIGH, or BLOCKED.
Write "reasons" and "supportMessage" in the language specified by Language (${input.language}).`;

      const systemInstruction = this.buildSystemInstruction(
        this.config.promptRiskSafety || DEFAULT_AI_PROMPT_RISK_SAFETY,
        outputContract
      );
      const userPrompt = `Language: ${input.language}\nText:\n${input.text}`;

      const rawJson = await this.callGeminiInteraction(
        systemInstruction,
        userPrompt,
        CLASSIFY_RISK_SCHEMA
      );
      const parsed = extractJson(rawJson);
      const level = normalizeRiskLevel(parsed.level);

      return {
        level,
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
        peerSafe: parsed.peerSafe ?? level === "NORMAL",
        supportMessage: parsed.supportMessage || undefined
      };
    } catch (err) {
      console.warn("[LlmAiMiddleware] Error in classifyRisk, falling back to Mock:", err);
      return this.fallback.classifyRisk(input);
    }
  }

  async anonymize(input: AnonymizationInput): Promise<AnonymizationResult> {
    if (!aiSettings.enabled || !aiSettings.enableAnonymization || !this.isConfigured) {
      return this.fallback.anonymize(input);
    }

    try {
      const outputContract = `Remove personally identifiable information (PII) from the text and list detected PII types in "flaggedTerms".`;
      const systemInstruction = this.buildSystemInstruction(
        this.config.promptAnonymization || DEFAULT_AI_PROMPT_ANONYMIZATION,
        outputContract
      );
      const userPrompt = `Language: ${input.language}\nText:\n${input.text}`;

      const rawJson = await this.callGeminiInteraction(
        systemInstruction,
        userPrompt,
        ANONYMIZE_SCHEMA
      );
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
    if (!aiSettings.enabled || !aiSettings.enableWritingSparks || !this.isConfigured) {
      return this.fallback.generateWritingSparks(input);
    }

    try {
      const outputContract = `Generate 3 gentle, evocative first sentences in "sparks" ({ id, text, prompt }) in Language (${input.language}).
Keep "suggestedEmotionTags" as canonical lowercase slugs from: lonely, anxious, sad, overwhelmed, ashamed, angry, uncertain, tired, seeking_comfort, comfort, reflective, self_compassion.`;

      const systemInstruction = this.buildSystemInstruction(
        this.config.promptWritingSparks || DEFAULT_AI_PROMPT_WRITING_SPARKS,
        outputContract
      );
      const userPrompt = `Language: ${input.language}\nMood hint: ${input.mood ?? "lonely"}\nSeed text if any: ${input.seedText ?? ""}`;

      const rawJson = await this.callGeminiInteraction(
        systemInstruction,
        userPrompt,
        WRITING_SPARKS_SCHEMA
      );
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
    if (!aiSettings.enabled || !aiSettings.enableResonanceMatch || !this.isConfigured) {
      return this.fallback.matchResonantLetters(input);
    }

    try {
      const lang = input.language ?? "ko_KR";
      const outputContract = `Pick the letter IDs that best resonate with the responder's preference and write all "matchReasons" values in ${lang}.`;

      const systemInstruction = this.buildSystemInstruction(
        this.config.promptResonanceMatch || DEFAULT_AI_PROMPT_RESONANCE_MATCH,
        outputContract
      );
      const userPrompt = `Language: ${lang}\nResponder preference: ${input.responderPreference}\nAvailable Letters:\n${JSON.stringify(input.availableLetters, null, 2)}`;

      const rawJson = await this.callGeminiInteraction(
        systemInstruction,
        userPrompt,
        RESONANCE_MATCH_SCHEMA
      );
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
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // Continue to outermost brace fallback
      }
    }

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

    throw new Error(`Unable to parse JSON from Gemini response: ${raw.slice(0, 100)}...`);
  }
}
