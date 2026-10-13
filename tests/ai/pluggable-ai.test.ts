import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getAiMiddleware, getAiProviderName, LlmAiMiddleware } from "@/lib/ai";

describe("Pluggable AI Provider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("identifies mock provider by default", () => {
    delete process.env.AI_PROVIDER;
    expect(getAiProviderName()).toBe("mock");
  });

  it("identifies openai provider when set", () => {
    process.env.AI_PROVIDER = "openai";
    expect(getAiProviderName()).toBe("openai");
  });

  it("identifies deepseek provider when set", () => {
    process.env.AI_PROVIDER = "deepseek";
    expect(getAiProviderName()).toBe("deepseek");
  });

  it("identifies gemini provider when set", () => {
    process.env.AI_PROVIDER = "gemini";
    expect(getAiProviderName()).toBe("gemini");
    const mw = getAiMiddleware({ apiKey: "test-gemini-key" });
    expect(mw).toBeInstanceOf(LlmAiMiddleware);
  });

  it("identifies anthropic provider when set", () => {
    process.env.AI_PROVIDER = "anthropic";
    expect(getAiProviderName()).toBe("anthropic");
    const mw = getAiMiddleware({ apiKey: "test-anthropic-key" });
    expect(mw).toBeInstanceOf(LlmAiMiddleware);
  });

  it("identifies ollama provider when set", () => {
    process.env.AI_PROVIDER = "ollama";
    expect(getAiProviderName()).toBe("ollama");
    const mw = new LlmAiMiddleware({ provider: "ollama" });
    expect(mw.isConfigured).toBe(true);
  });

  it("falls back to MockAiMiddleware when LLM has no API key configured", async () => {
    const middleware = new LlmAiMiddleware({
      provider: "openai",
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

  it("successfully calls OpenAI/DeepSeek API when configured and parses response", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
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
        }
      ]
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "deepseek",
      apiKey: "test-deepseek-key",
      baseURL: "https://api.deepseek.com/v1",
      model: "deepseek-chat"
    });

    expect(middleware.isConfigured).toBe(true);

    const result = await middleware.processLetter({
      text: "Feeling anxious about the upcoming exam.",
      language: "en_US",
      preferredReplyType: "COMFORT"
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.deepseek.com/v1/chat/completions");
    expect(options.headers).toMatchObject({
      Authorization: "Bearer test-deepseek-key"
    });
    expect(result.processedText).toContain("Anonymized: Feeling anxious");
    expect(result.emotionTags).toEqual(["anxious"]);
    expect(result.risk.level).toBe("NORMAL");
    expect(result.risk.peerSafe).toBe(true);
  });

  it("sends Anthropic-specific headers and message payload for anthropic provider", async () => {
    const mockResponse = {
      content: [
        {
          text: JSON.stringify({
            sparks: [
              { id: "spark-1", text: "Today felt overwhelmingly quiet.", prompt: "Quiet loneliness" }
            ],
            suggestedEmotionTags: ["lonely"]
          })
        }
      ]
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "anthropic",
      apiKey: "sk-ant-test-key",
      baseURL: "https://api.anthropic.com/v1",
      model: "claude-3-5-haiku-20241022"
    });

    const sparksResult = await middleware.generateWritingSparks({
      mood: "lonely",
      language: "en_US"
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(options.headers).toMatchObject({
      "x-api-key": "sk-ant-test-key",
      "anthropic-version": "2023-06-01"
    });
    expect(sparksResult.sparks).toHaveLength(1);
    expect(sparksResult.sparks[0].text).toContain("Today felt overwhelmingly quiet.");
  });

  it("generates writing sparks with LLM and falls back to mock on failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("API Timeout"));

    const middleware = new LlmAiMiddleware({
      provider: "openai",
      apiKey: "test-openai-key"
    });

    const result = await middleware.generateWritingSparks({
      mood: "burnout",
      language: "ko_KR"
    });

    expect(result.sparks.length).toBeGreaterThanOrEqual(3);
    expect(result.suggestedEmotionTags).toContain("overwhelmed");
  });

  it("matches resonant letters with LLM and falls back gracefully", async () => {
    const middleware = new LlmAiMiddleware({
      provider: "openai",
      apiKey: "" // Unconfigured -> fallback to Mock
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

  it("handles markdown json wrapping from LLMs", async () => {
    const mockJson = {
      coachedText: "I hear how hard this semester has been for you.",
      flags: [],
      suggestions: ["Gentle tone maintained."],
      reframings: [
        { label: "온화한 공감", text: "따뜻한 공감의 말", tone: "warm" },
        { label: "경청 중심", text: "경청의 말", tone: "listening" },
        { label: "차분한 지지", text: "지지의 말", tone: "grounding" }
      ],
      metrics: {
        empathy: 95,
        gentleness: 92,
        nonJudgmental: 98
      }
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "```json\n" + JSON.stringify(mockJson) + "\n```"
            }
          }
        ]
      })
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "openai",
      apiKey: "test-key"
    });

    const coached = await middleware.coachReply({
      letterText: "Hard semester",
      replyText: "You will survive this easily.",
      desiredReplyType: "COMFORT",
      language: "en_US"
    });

    expect(coached.coachedText).toBe("I hear how hard this semester has been for you.");
    expect(coached.reframings).toHaveLength(3);
    expect(coached.metrics?.empathy).toBe(95);
  });
});
