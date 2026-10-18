import type { AiMiddleware } from "@/lib/ai/middleware";
import { MockAiMiddleware } from "@/lib/ai/mock";
import { LlmAiMiddleware, type LlmConfig } from "@/lib/ai/llm";
import { ensureSettingsLoadedFromDisk } from "@/lib/settings-store";
import { aiSettings } from "@/settings";

export type AiProviderName = "mock" | "gemini" | "openai";

/**
 * 46Hz supports three AI providers: the local heuristic `mock` engine, native Google
 * Gemini, and any OpenAI API-compatible endpoint. Any other provider string resolves to `mock`.
 */
export function getAiProviderName(): AiProviderName {
  ensureSettingsLoadedFromDisk();
  const provider = (process.env.AI_PROVIDER || aiSettings.defaultProvider || "mock")
    .toLowerCase()
    .trim();
  return provider === "gemini" || provider === "openai" ? provider : "mock";
}

export function getAiMiddleware(override?: Partial<LlmConfig>): AiMiddleware {
  ensureSettingsLoadedFromDisk();
  const provider = override?.provider ?? getAiProviderName();

  if (provider === "gemini" || provider === "openai") {
    return new LlmAiMiddleware({
      provider,
      model: aiSettings.model || undefined,
      apiKey: aiSettings.apiKey || undefined,
      baseURL: aiSettings.baseUrl || undefined,
      systemPrompt: aiSettings.systemPrompt || undefined,
      timeoutMs: aiSettings.timeoutMs,
      temperature: aiSettings.temperature,
      maxTokens: aiSettings.maxTokens,
      thinkingLevel: aiSettings.thinkingLevel,
      storeInteractions: aiSettings.storeInteractions,
      promptRiskSafety: aiSettings.promptRiskSafety || undefined,
      promptAnonymization: aiSettings.promptAnonymization || undefined,
      promptReplyCoach: aiSettings.promptReplyCoach || undefined,
      promptWritingSparks: aiSettings.promptWritingSparks || undefined,
      promptResonanceMatch: aiSettings.promptResonanceMatch || undefined,
      ...override
    });
  }

  return new MockAiMiddleware({
    delayMs: aiSettings.mockDelayMs
  });
}

export * from "@/lib/ai/middleware";
export * from "@/lib/ai/mock";
export * from "@/lib/ai/llm";
