import type { AiMiddleware } from "@/lib/ai/middleware";
import { MockAiMiddleware } from "@/lib/ai/mock";

export function getAiMiddleware(): AiMiddleware {
  return new MockAiMiddleware();
}
