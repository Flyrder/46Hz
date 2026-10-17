import { NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";
import { LlmAiMiddleware, MockAiMiddleware, type AiConnectionTestResult } from "@/lib/ai";
import { aiSettings, type SupportedAiThinkingLevel } from "@/settings";

export async function POST(request: Request) {
  const role = await getAdminRole();
  if (role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Permission Denied: System Administrator privileges required." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const provider = body.provider === "gemini" ? "gemini" : "mock";

  if (provider === "mock") {
    const startTime = Date.now();
    const mock = new MockAiMiddleware({
      delayMs: Number(body.mockDelayMs ?? aiSettings.mockDelayMs ?? 40)
    });
    const sample = await mock.classifyRisk({
      text: "오늘 하루가 조금 외롭고 지치네요.",
      language: "ko_KR"
    });
    const result: AiConnectionTestResult = {
      ok: true,
      provider: "mock",
      model: "mock-heuristic-engine",
      endpoint: "local://mock-ai-middleware",
      thinkingLevel: "minimal",
      storeInteractions: false,
      latencyMs: Math.max(1, Date.now() - startTime),
      message: `Local Mock AI Middleware active (Risk check: ${sample.level}, peerSafe=${sample.peerSafe}).`
    };
    return NextResponse.json(result);
  }

  const validThinkingLevels: SupportedAiThinkingLevel[] = ["minimal", "low", "medium", "high"];
  const thinkingLevel: SupportedAiThinkingLevel = validThinkingLevels.includes(body.thinkingLevel)
    ? body.thinkingLevel
    : aiSettings.thinkingLevel;

  const nonEmpty = (value: unknown): string | undefined =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

  const llm = new LlmAiMiddleware({
    provider: "gemini",
    apiKey: nonEmpty(body.apiKey),
    baseURL: nonEmpty(body.baseUrl),
    model: nonEmpty(body.model),
    systemPrompt: nonEmpty(body.systemPrompt),
    thinkingLevel,
    storeInteractions: Boolean(body.storeInteractions),
    maxTokens: Number(body.maxTokens) || aiSettings.maxTokens,
    timeoutMs: Number(body.timeoutMs) || aiSettings.timeoutMs
  });

  const result = await llm.testConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
