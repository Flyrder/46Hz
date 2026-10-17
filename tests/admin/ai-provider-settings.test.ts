import { describe, expect, it, beforeEach } from "vitest";
import {
  aiSettings,
  DEFAULT_AI_SYSTEM_PROMPT,
  FACTORY_DEFAULT_SETTINGS,
  applyRuntimeSettingsUpdate
} from "@/settings";
import { getAiMiddleware, getAiProviderName, LlmAiMiddleware } from "@/lib/ai";
import { systemSettingsSchema } from "@/lib/validators";

describe("AI External Provider Configuration & System Prompt Customization", () => {
  beforeEach(() => {
    applyRuntimeSettingsUpdate(FACTORY_DEFAULT_SETTINGS);
    delete process.env.AI_PROVIDER;
    delete process.env.AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
  });

  it("supports gemini as a first-class AI provider option in schema and settings", () => {
    aiSettings.defaultProvider = "gemini";
    expect(getAiProviderName()).toBe("gemini");

    const validData = {
      ...FACTORY_DEFAULT_SETTINGS,
      aiDefaultProvider: "gemini" as const,
      aiApiKey: "test-gemini-key",
      aiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      aiModel: "gemini-1.5-flash",
      aiSystemPrompt: "Custom warmth prompt"
    };

    const parsed = systemSettingsSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.aiDefaultProvider).toBe("gemini");
      expect(parsed.data.aiApiKey).toBe("test-gemini-key");
      expect(parsed.data.aiBaseUrl).toBe("https://generativelanguage.googleapis.com/v1beta/openai");
      expect(parsed.data.aiModel).toBe("gemini-1.5-flash");
      expect(parsed.data.aiSystemPrompt).toBe("Custom warmth prompt");
    }
  });

  it("initializes LlmAiMiddleware with customized system prompt, API key, and base URL", () => {
    applyRuntimeSettingsUpdate({
      aiDefaultProvider: "openai",
      aiApiKey: "sk-admin-configured-key",
      aiBaseUrl: "https://my-proxy.company.com/v1",
      aiModel: "gpt-4o",
      aiSystemPrompt: "Always respond with deep empathetic listening."
    });

    const mw = getAiMiddleware({ provider: "openai" }) as LlmAiMiddleware;
    expect(mw).toBeInstanceOf(LlmAiMiddleware);

    const config = mw.getConfig();
    expect(config.provider).toBe("openai");
    expect(config.apiKey).toBe("sk-admin-configured-key");
    expect(config.baseURL).toBe("https://my-proxy.company.com/v1");
    expect(config.model).toBe("gpt-4o");
    expect(config.systemPrompt).toBe("Always respond with deep empathetic listening.");
    expect(mw.isConfigured).toBe(true);
  });

  it("falls back to DEFAULT_AI_SYSTEM_PROMPT when system prompt is not customized", () => {
    expect(FACTORY_DEFAULT_SETTINGS.aiSystemPrompt).toBe(DEFAULT_AI_SYSTEM_PROMPT);
    expect(aiSettings.systemPrompt).toContain("empathetic");
    expect(aiSettings.systemPrompt).toContain("Zero PII");
  });

  it("supports DeepSeek provider and sets correct model defaults", () => {
    applyRuntimeSettingsUpdate({
      aiDefaultProvider: "deepseek",
      aiApiKey: "sk-deepseek-test-key",
      aiBaseUrl: "https://api.deepseek.com",
      aiModel: "deepseek-chat"
    });

    const mw = getAiMiddleware({ provider: "deepseek" }) as LlmAiMiddleware;
    expect(mw.getConfig().provider).toBe("deepseek");
    expect(mw.getConfig().model).toBe("deepseek-chat");
    expect(mw.getConfig().baseURL).toBe("https://api.deepseek.com");
    expect(mw.isConfigured).toBe(true);
  });
});
