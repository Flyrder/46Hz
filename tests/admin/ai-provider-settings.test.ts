import { describe, expect, it, beforeEach } from "vitest";
import {
  aiSettings,
  DEFAULT_AI_PROMPT_ANONYMIZATION,
  DEFAULT_AI_PROMPT_REPLY_COACH,
  DEFAULT_AI_PROMPT_RESONANCE_MATCH,
  DEFAULT_AI_PROMPT_RISK_SAFETY,
  DEFAULT_AI_PROMPT_WRITING_SPARKS,
  DEFAULT_AI_SYSTEM_PROMPT,
  FACTORY_DEFAULT_SETTINGS,
  applyRuntimeSettingsUpdate
} from "@/settings";
import { getAiMiddleware, getAiProviderName, LlmAiMiddleware } from "@/lib/ai";
import { systemSettingsSchema } from "@/lib/validators";

describe("Native Gemini Provider Configuration & Per-Function Prompt Studio", () => {
  beforeEach(() => {
    applyRuntimeSettingsUpdate(FACTORY_DEFAULT_SETTINGS);
    delete process.env.AI_PROVIDER;
    delete process.env.AI_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it("supports mock and gemini exclusively in systemSettingsSchema and settings", () => {
    aiSettings.defaultProvider = "gemini";
    expect(getAiProviderName()).toBe("gemini");

    const validData = {
      ...FACTORY_DEFAULT_SETTINGS,
      aiDefaultProvider: "gemini" as const,
      aiApiKey: "AIzaSy-test-gemini-key",
      aiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
      aiModel: "gemini-3.8-flash",
      aiThinkingLevel: "medium" as const,
      aiStoreInteractions: false,
      aiSystemPrompt: "Custom warmth prompt",
      aiPromptRiskSafety: "Custom risk safety prompt",
      aiPromptAnonymization: "Custom anonymization prompt",
      aiPromptReplyCoach: "Custom reply coach prompt",
      aiPromptWritingSparks: "Custom writing sparks prompt",
      aiPromptResonanceMatch: "Custom resonance match prompt"
    };

    const parsed = systemSettingsSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.aiDefaultProvider).toBe("gemini");
      expect(parsed.data.aiApiKey).toBe("AIzaSy-test-gemini-key");
      expect(parsed.data.aiBaseUrl).toBe("https://generativelanguage.googleapis.com/v1beta");
      expect(parsed.data.aiModel).toBe("gemini-3.8-flash");
      expect(parsed.data.aiThinkingLevel).toBe("medium");
      expect(parsed.data.aiStoreInteractions).toBe(false);
      expect(parsed.data.aiSystemPrompt).toBe("Custom warmth prompt");
      expect(parsed.data.aiPromptRiskSafety).toBe("Custom risk safety prompt");
      expect(parsed.data.aiPromptAnonymization).toBe("Custom anonymization prompt");
      expect(parsed.data.aiPromptReplyCoach).toBe("Custom reply coach prompt");
      expect(parsed.data.aiPromptWritingSparks).toBe("Custom writing sparks prompt");
      expect(parsed.data.aiPromptResonanceMatch).toBe("Custom resonance match prompt");
    }

    // Legacy non-Gemini providers are rejected by schema
    const invalidLegacy = systemSettingsSchema.safeParse({
      ...FACTORY_DEFAULT_SETTINGS,
      aiDefaultProvider: "openai"
    });
    expect(invalidLegacy.success).toBe(false);
  });

  it("initializes LlmAiMiddleware with customized Gemini settings and per-function prompts", () => {
    applyRuntimeSettingsUpdate({
      aiDefaultProvider: "gemini",
      aiApiKey: "AIzaSy-admin-configured-key",
      aiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
      aiModel: "gemini-4-argon",
      aiThinkingLevel: "high",
      aiStoreInteractions: true,
      aiMaxTokens: 32768,
      aiSystemPrompt: "Always respond with deep empathetic listening.",
      aiPromptReplyCoach: "Encourage slow, non-judgmental reflection."
    });

    const mw = getAiMiddleware() as LlmAiMiddleware;
    expect(mw).toBeInstanceOf(LlmAiMiddleware);

    const config = mw.getConfig();
    expect(config.provider).toBe("gemini");
    expect(config.apiKey).toBe("AIzaSy-admin-configured-key");
    expect(config.baseURL).toBe("https://generativelanguage.googleapis.com/v1beta");
    expect(config.model).toBe("gemini-4-argon");
    expect(config.thinkingLevel).toBe("high");
    expect(config.storeInteractions).toBe(true);
    expect(config.maxTokens).toBe(32768);
    expect(config.systemPrompt).toBe("Always respond with deep empathetic listening.");
    expect(config.promptReplyCoach).toBe("Encourage slow, non-judgmental reflection.");
    expect(mw.isConfigured).toBe(true);
  });

  it("provides comprehensive default prompts for system_instruction and all 5 AI functions", () => {
    expect(FACTORY_DEFAULT_SETTINGS.aiModel).toBe("gemini-3.8-flash");
    expect(FACTORY_DEFAULT_SETTINGS.aiSystemPrompt).toBe(DEFAULT_AI_SYSTEM_PROMPT);
    expect(FACTORY_DEFAULT_SETTINGS.aiPromptRiskSafety).toBe(DEFAULT_AI_PROMPT_RISK_SAFETY);
    expect(FACTORY_DEFAULT_SETTINGS.aiPromptAnonymization).toBe(DEFAULT_AI_PROMPT_ANONYMIZATION);
    expect(FACTORY_DEFAULT_SETTINGS.aiPromptReplyCoach).toBe(DEFAULT_AI_PROMPT_REPLY_COACH);
    expect(FACTORY_DEFAULT_SETTINGS.aiPromptWritingSparks).toBe(DEFAULT_AI_PROMPT_WRITING_SPARKS);
    expect(FACTORY_DEFAULT_SETTINGS.aiPromptResonanceMatch).toBe(DEFAULT_AI_PROMPT_RESONANCE_MATCH);
    expect(aiSettings.systemPrompt).toContain("empathetic");
    expect(aiSettings.systemPrompt).toContain("Zero PII");
  });
});
