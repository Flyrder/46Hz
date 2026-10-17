import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  extractInteractionOutputText,
  GEMINI_API_REVISION,
  GEMINI_DEFAULT_BASE_URL,
  GEMINI_DEFAULT_MODEL,
  getAiMiddleware,
  getAiProviderName,
  LlmAiMiddleware,
  normalizeGeminiBaseUrl,
  resolveGeminiGenerationConfig,
  resolveGeminiModel
} from "@/lib/ai";
import { aiSettings, applyRuntimeSettingsUpdate, FACTORY_DEFAULT_SETTINGS } from "@/settings";

describe("Native Google Gemini Interactions API & Mock Fallback", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    applyRuntimeSettingsUpdate(FACTORY_DEFAULT_SETTINGS);
  });

  afterEach(() => {
    process.env = originalEnv;
    applyRuntimeSettingsUpdate(FACTORY_DEFAULT_SETTINGS);
  });

  it("identifies mock provider by default and ignores non-gemini provider strings", () => {
    delete process.env.AI_PROVIDER;
    expect(getAiProviderName()).toBe("mock");

    process.env.AI_PROVIDER = "openai";
    expect(getAiProviderName()).toBe("mock");
  });

  it("identifies gemini provider when set via env or aiSettings", () => {
    process.env.AI_PROVIDER = "gemini";
    expect(getAiProviderName()).toBe("gemini");
    const mw = getAiMiddleware({ apiKey: "test-gemini-key" });
    expect(mw).toBeInstanceOf(LlmAiMiddleware);
  });

  it("upgrades deprecated or non-Gemini model strings to current Gemini models", () => {
    expect(resolveGeminiModel()).toBe(GEMINI_DEFAULT_MODEL);
    expect(resolveGeminiModel("gemini-3.8-flash")).toBe("gemini-3.8-flash");
    expect(resolveGeminiModel("gemini-4-argon")).toBe("gemini-4-argon");
    expect(resolveGeminiModel("gemini-3.5-flash-lite")).toBe("gemini-3.5-flash-lite");
    expect(resolveGeminiModel("gemini-3.1-flash-lite")).toBe("gemini-3.1-flash-lite");
    expect(resolveGeminiModel("gemma-4-31b-it")).toBe("gemma-4-31b-it");

    // Deprecated upgrades per gemini-api-dev
    expect(resolveGeminiModel("gemini-1.5-flash")).toBe("gemini-3.8-flash");
    expect(resolveGeminiModel("gemini-2.0-flash")).toBe("gemini-3.8-flash");
    expect(resolveGeminiModel("gemini-2.5-flash")).toBe("gemini-3.8-flash");
    expect(resolveGeminiModel("gemini-2.5-pro")).toBe("gemini-4-argon");
    expect(resolveGeminiModel("gemini-1.5-pro")).toBe("gemini-4-argon");
    expect(resolveGeminiModel("gemini-2.5-flash-lite")).toBe("gemini-3.5-flash-lite");
    expect(resolveGeminiModel("gpt-4o-mini")).toBe("gemini-3.8-flash");
  });

  it("normalizes Gemini base URL and strips legacy /openai or /interactions suffixes", () => {
    expect(normalizeGeminiBaseUrl("")).toBe(GEMINI_DEFAULT_BASE_URL);
    expect(normalizeGeminiBaseUrl("https://generativelanguage.googleapis.com")).toBe(
      GEMINI_DEFAULT_BASE_URL
    );
    expect(
      normalizeGeminiBaseUrl("https://generativelanguage.googleapis.com/v1beta/openai/")
    ).toBe(GEMINI_DEFAULT_BASE_URL);
    expect(
      normalizeGeminiBaseUrl("https://generativelanguage.googleapis.com/v1beta/interactions")
    ).toBe(GEMINI_DEFAULT_BASE_URL);
  });

  it("enforces gemini-4-argon generation_config rules (thinking_level >= low, max_output_tokens >= 32768)", () => {
    const argonCfg = resolveGeminiGenerationConfig("gemini-4-argon", "minimal", 4096);
    expect(argonCfg.thinking_level).toBe("low");
    expect(argonCfg.max_output_tokens).toBe(32768);

    const flashCfg = resolveGeminiGenerationConfig("gemini-3.8-flash", "minimal", 2048);
    expect(flashCfg.thinking_level).toBe("minimal");
    expect(flashCfg.max_output_tokens).toBe(2048);
  });

  it("falls back to MockAiMiddleware when Gemini has no API key configured", async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_API_KEY;

    const middleware = new LlmAiMiddleware({
      provider: "gemini",
      apiKey: ""
    });

    expect(middleware.isConfigured).toBe(false);

    const result = await middleware.processLetter({
      text: "I am feeling lonely at work today. My phone is 555-123-4567.",
      language: "en_US",
      preferredReplyType: "COMFORT"
    });

    expect(result.emotionTags).toContain("lonely");
    expect(result.situationTags).toContain("work");
    expect(result.anonymization.text).toContain("[phone removed]");
  });

  it("calls Native Gemini Interactions API (POST /v1beta/interactions) with x-goog-api-key, Api-Revision, system_instruction, generation_config, and response_format schema", async () => {
    const mockInteractionResponse = {
      id: "inter-123",
      status: "completed",
      steps: [
        {
          type: "thought",
          content: [{ type: "text", text: "Internal reasoning that must be ignored" }]
        },
        {
          type: "model_output",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                processedText: "Anonymized: Feeling anxious about the upcoming exam.",
                emotionTags: ["anxious"],
                situationTags: ["school"],
                desiredReplyType: "COMFORT",
                anonymization: {
                  text: "Anonymized: Feeling anxious about the upcoming exam.",
                  flaggedTerms: []
                },
                risk: {
                  level: "NORMAL",
                  reasons: [],
                  peerSafe: true
                }
              })
            }
          ]
        }
      ]
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockInteractionResponse
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "gemini",
      apiKey: "AIzaSy-test-gemini-key",
      model: "gemini-3.8-flash",
      thinkingLevel: "medium",
      storeInteractions: false,
      promptRiskSafety: "CUSTOM_RISK_PROMPT_MARKER",
      promptAnonymization: "CUSTOM_ANON_PROMPT_MARKER"
    });

    expect(middleware.isConfigured).toBe(true);

    const result = await middleware.processLetter({
      text: "Feeling anxious about the upcoming exam.",
      language: "en_US",
      preferredReplyType: "COMFORT"
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    expect(options.headers).toMatchObject({
      "Content-Type": "application/json",
      "x-goog-api-key": "AIzaSy-test-gemini-key",
      "Api-Revision": GEMINI_API_REVISION
    });

    const parsedBody = JSON.parse(String(options.body));
    expect(parsedBody.model).toBe("gemini-3.8-flash");
    expect(parsedBody.store).toBe(false);
    expect(parsedBody.generation_config).toEqual({
      thinking_level: "medium",
      max_output_tokens: 4096
    });
    expect(parsedBody.generation_config.temperature).toBeUndefined();
    expect(parsedBody.system_instruction).toContain("CUSTOM_RISK_PROMPT_MARKER");
    expect(parsedBody.system_instruction).toContain("CUSTOM_ANON_PROMPT_MARKER");
    expect(parsedBody.response_format).toMatchObject({
      type: "text",
      mime_type: "application/json"
    });

    expect(result.processedText).toContain("Anonymized: Feeling anxious");
    expect(result.emotionTags).toEqual(["anxious"]);
    expect(result.risk.level).toBe("NORMAL");
    expect(result.risk.peerSafe).toBe(true);
  });

  it("extracts output_text or model_output steps while ignoring thought steps", () => {
    expect(
      extractInteractionOutputText({
        output_text: '{"ok":true}'
      })
    ).toBe('{"ok":true}');

    expect(
      extractInteractionOutputText({
        steps: [
          { type: "thought", content: [{ type: "text", text: "secret chain of thought" }] },
          { type: "model_output", content: [{ type: "text", text: '{"status":"ready"}' }] }
        ]
      })
    ).toBe('{"status":"ready"}');
  });

  it("generates writing sparks with Gemini and falls back to mock on failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("API Timeout"));

    const middleware = new LlmAiMiddleware({
      provider: "gemini",
      apiKey: "AIzaSy-test-key"
    });

    const result = await middleware.generateWritingSparks({
      mood: "burnout",
      language: "ko_KR"
    });

    expect(result.sparks.length).toBeGreaterThanOrEqual(3);
    expect(result.suggestedEmotionTags).toContain("overwhelmed");
  });

  it("matches resonant letters with Gemini and falls back gracefully when unconfigured", async () => {
    delete process.env.GEMINI_API_KEY;
    const middleware = new LlmAiMiddleware({
      provider: "gemini",
      apiKey: ""
    });

    const result = await middleware.matchResonantLetters({
      responderPreference: "COMFORT",
      availableLetters: [
        {
          id: "letter-1",
          emotionTags: ["lonely"],
          situationTags: ["work"],
          desiredReplyType: "COMFORT"
        }
      ]
    });

    expect(result.recommendedLetterIds).toContain("letter-1");
  });

  it("parses structured JSON from output_text in coachReply and injects custom promptReplyCoach", async () => {
    const mockJson = {
      coachedText: "I hear how hard this semester has been for you.",
      flags: [],
      suggestions: ["Gentle tone maintained."],
      reframings: [
        { label: "Gentle Empathy", text: "Warm empathy text", tone: "warm" },
        { label: "Deep Listening", text: "Listening text", tone: "listening" },
        { label: "Calm Grounding", text: "Grounding text", tone: "grounding" }
      ],
      metrics: {
        empathy: 95,
        gentleness: 92,
        nonJudgmental: 98
      }
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        output_text: JSON.stringify(mockJson)
      })
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "gemini",
      apiKey: "AIzaSy-test-key",
      promptReplyCoach: "CUSTOM_COACH_GUIDELINE_123"
    });

    const coached = await middleware.coachReply({
      letterText: "Hard semester",
      replyText: "You will survive this easily.",
      desiredReplyType: "COMFORT",
      language: "en_US"
    });

    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(options.body));
    expect(body.system_instruction).toContain("CUSTOM_COACH_GUIDELINE_123");
    expect(coached.coachedText).toBe("I hear how hard this semester has been for you.");
    expect(coached.reframings).toHaveLength(3);
    expect(coached.metrics?.empathy).toBe(95);
  });

  it("runs testConnection() diagnostic against Native Gemini Interactions API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        output_text: JSON.stringify({
          status: "ok",
          message: "46Hz Gemini Interactions API ready"
        })
      })
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "gemini",
      apiKey: "AIzaSy-live-check",
      model: "gemini-3.8-flash",
      thinkingLevel: "low"
    });

    const diag = await middleware.testConnection();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(diag.ok).toBe(true);
    expect(diag.provider).toBe("gemini");
    expect(diag.model).toBe("gemini-3.8-flash");
    expect(diag.message).toContain("46Hz Gemini Interactions API ready");
  });

  it("honors enableAnonymization and enableRiskSafety toggles inside LlmAiMiddleware.processLetter", async () => {
    aiSettings.enableAnonymization = false;
    aiSettings.enableRiskSafety = false;

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        output_text: JSON.stringify({
          processedText: "Redacted text",
          emotionTags: ["lonely"],
          situationTags: ["work"],
          desiredReplyType: "COMFORT",
          anonymization: {
            text: "Redacted text",
            flaggedTerms: ["phone number"]
          },
          risk: {
            level: "HIGH",
            reasons: ["flagged"],
            peerSafe: false
          }
        })
      })
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "gemini",
      apiKey: "AIzaSy-toggle-test"
    });

    const result = await middleware.processLetter({
      text: "Original text 010-1234-5678",
      language: "ko_KR",
      preferredReplyType: "COMFORT"
    });

    expect(result.processedText).toBe("Original text 010-1234-5678");
    expect(result.anonymization.flaggedTerms).toEqual([]);
    expect(result.risk.level).toBe("NORMAL");
    expect(result.risk.peerSafe).toBe(true);
  });
});
