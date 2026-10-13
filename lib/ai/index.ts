import type { AiMiddleware } from "@/lib/ai/middleware";
import { MockAiMiddleware } from "@/lib/ai/mock";
import { LlmAiMiddleware, type LlmConfig } from "@/lib/ai/llm";

export type AiProviderName = "mock" | "openai" | "deepseek" | "custom";

export function getAiProviderName(): AiProviderName {
  const provider = (process.env.AI_PROVIDER ?? "mock").toLowerCase().trim();
  if (provider === "openai") return "openai";
  if (provider === "deepseek") return "deepseek";
  if (provider === "custom") return "custom";
  return "mock";
}

export function getAiMiddleware(override?: Partial<LlmConfig>): AiMiddleware {
  const provider = override?.provider ?? getAiProviderName();

  if (provider === "openai" || provider === "deepseek" || provider === "custom") {
    return new LlmAiMiddleware({
      provider,
      ...override
    });
  }

  return new MockAiMiddleware();
}

export * from "@/lib/ai/middleware";
export * from "@/lib/ai/mock";
export * from "@/lib/ai/llm";
