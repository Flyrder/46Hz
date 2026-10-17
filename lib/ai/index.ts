import type { AiMiddleware } from "@/lib/ai/middleware";
import { MockAiMiddleware } from "@/lib/ai/mock";
import { LlmAiMiddleware, type LlmConfig } from "@/lib/ai/llm";
import { aiSettings } from "@/settings";

export type AiProviderName =
  | "mock"
  | "openai"
  | "deepseek"
  | "gemini"
  | "anthropic"
  | "ollama"
  | "custom";

export function getAiProviderName(): AiProviderName {
  const provider = (process.env.AI_PROVIDER || aiSettings.defaultProvider || "mock").toLowerCase().trim();
  if (
    provider === "openai" ||
    provider === "deepseek" ||
    provider === "gemini" ||
    provider === "anthropic" ||
    provider === "ollama" ||
    provider === "custom"
  ) {
    return provider;
  }
  return "mock";
}

export function getAiMiddleware(override?: Partial<LlmConfig>): AiMiddleware {
  const provider = override?.provider ?? getAiProviderName();

  if (
    provider === "openai" ||
    provider === "deepseek" ||
    provider === "gemini" ||
    provider === "anthropic" ||
    provider === "ollama" ||
    provider === "custom"
  ) {
    return new LlmAiMiddleware({
      provider,
      model: aiSettings.model,
      apiKey: aiSettings.apiKey || undefined,
      baseURL: aiSettings.baseUrl || undefined,
      systemPrompt: aiSettings.systemPrompt || undefined,
      timeoutMs: aiSettings.timeoutMs,
      temperature: aiSettings.temperature,
      maxTokens: aiSettings.maxTokens,
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
