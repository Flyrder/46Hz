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

  it("falls back to MockAiMiddleware when LLM has no API key configured", async () => {
    const middleware = new LlmAiMiddleware({
      provider: "openai",
      apiKey: ""
    });

    expect(middleware.isConfigured).toBe(false);

    // Call processLetter and ensure it safely falls back to MockAiMiddleware
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

  it("gracefully falls back to Mock when fetch fails or times out", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network timeout"));

    const middleware = new LlmAiMiddleware({
      provider: "openai",
      apiKey: "valid-key-but-network-fails"
    });

    const result = await middleware.processLetter({
      text: "I am overwhelmed with work.",
      language: "en_US",
      preferredReplyType: "JUST_BEING_HEARD"
    });

    // Fallback result should still succeed without crashing
    expect(result).toBeDefined();
    expect(result.emotionTags).toContain("overwhelmed");
  });

  it("handles markdown json wrapping from LLMs", async () => {
    const mockJson = {
      coachedText: "I hear how hard this semester has been for you.",
      flags: [],
      suggestions: ["Gentle tone maintained."]
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
  });

  it("identifies custom provider when AI_PROVIDER is set to custom", () => {
    process.env.AI_PROVIDER = "custom";
    expect(getAiProviderName()).toBe("custom");
    const middleware = getAiMiddleware({ apiKey: "test-custom" });
    expect(middleware).toBeInstanceOf(LlmAiMiddleware);
  });

  it("extracts JSON correctly when wrapped with reasoning thinking tags and surrounding text", async () => {
    const rawWithThinking = `
<think>
The user is expressing loneliness. This is normal emotional stress.
Let me produce the JSON object now.
</think>
Here is the structured analysis:
{
  "processedText": "Feeling lonely lately.",
  "emotionTags": ["lonely"],
  "situationTags": ["life"],
  "desiredReplyType": "comfort",
  "anonymization": {
    "text": "Feeling lonely lately.",
    "flaggedTerms": []
  },
  "risk": {
    "level": "normal",
    "reasons": [],
    "peerSafe": true
  }
}
Hope this analysis helps.`;

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: rawWithThinking
            }
          }
        ]
      })
    } as any);

    const middleware = new LlmAiMiddleware({
      provider: "deepseek",
      apiKey: "test-deepseek-key"
    });

    const result = await middleware.processLetter({
      text: "Feeling lonely lately.",
      language: "en_US",
      preferredReplyType: "COMFORT"
    });

    // Lowercase "comfort" and "normal" from LLM should be safely normalized to uppercase Prisma enums
    expect(result.desiredReplyType).toBe("COMFORT");
    expect(result.risk.level).toBe("NORMAL");
    expect(result.emotionTags).toEqual(["lonely"]);
  });
});
