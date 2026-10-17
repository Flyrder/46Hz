import { describe, expect, it, beforeEach } from "vitest";
import { getAiMiddleware, getAiProviderName, MockAiMiddleware } from "@/lib/ai";
import { aiSettings, FACTORY_DEFAULT_SETTINGS, applyRuntimeSettingsUpdate } from "@/settings";
import { translate } from "@/lib/i18n";

describe("AI Settings Toggles & Runtime Heuristics", () => {
  beforeEach(() => {
    applyRuntimeSettingsUpdate(FACTORY_DEFAULT_SETTINGS);
    delete process.env.AI_PROVIDER;
  });

  it("respects aiSettings.defaultProvider when AI_PROVIDER environment variable is unset", () => {
    aiSettings.defaultProvider = "gemini";
    expect(getAiProviderName()).toBe("gemini");

    aiSettings.defaultProvider = "mock";
    expect(getAiProviderName()).toBe("mock");
  });

  it("bypasses all AI processing when master toggle enableAi is false", async () => {
    aiSettings.enabled = false;
    const ai = new MockAiMiddleware();

    // 1. Process Letter: Returns raw text with no PII masking, no risk flagging, no AI tags
    const processed = await ai.processLetter({
      text: "제 이름은 홍길동이고 전화번호는 010-1234-5678입니다. 죽고 싶어요.",
      language: "ko",
      preferredReplyType: "COMFORT"
    });
    expect(processed.processedText).toContain("010-1234-5678");
    expect(processed.anonymization.flaggedTerms).toHaveLength(0);
    expect(processed.risk.level).toBe("NORMAL");
    expect(processed.risk.peerSafe).toBe(true);

    // 2. Classify Risk: Bypasses risk inspection
    const risk = await ai.classifyRisk({
      text: "죽고 싶어요 자살",
      language: "ko"
    });
    expect(risk.level).toBe("NORMAL");
    expect(risk.peerSafe).toBe(true);

    // 3. Anonymize: Bypasses PII masking
    const anon = await ai.anonymize({
      text: "010-9999-8888",
      language: "ko"
    });
    expect(anon.text).toBe("010-9999-8888");
    expect(anon.flaggedTerms).toHaveLength(0);

    // 4. Coach Reply: Returns uncoached text with no flags
    const coached = await ai.coachReply({
      letterText: "힘들어요",
      replyText: "너는 당연히 이렇게 해야 해!",
      desiredReplyType: "COMFORT",
      language: "ko"
    });
    expect(coached.flags).toHaveLength(0);
    expect(coached.coachedText).toBe("너는 당연히 이렇게 해야 해!");

    // 5. Writing Sparks: Returns empty sparks
    const sparks = await ai.generateWritingSparks({
      mood: "burnout",
      language: "ko"
    });
    expect(sparks.sparks).toHaveLength(0);

    // 6. Resonance Match: Returns letters directly without AI filtering
    const match = await ai.matchResonantLetters({
      responderPreference: "COMFORT",
      availableLetters: [
        { id: "let-1", emotionTags: [], situationTags: [], desiredReplyType: "COMFORT" }
      ]
    });
    expect(match.recommendedLetterIds).toEqual(["let-1"]);
  });

  it("respects individual AI capability toggles independently", async () => {
    aiSettings.enabled = true;
    const ai = new MockAiMiddleware();

    // Toggle 1: enableAnonymization = false
    aiSettings.enableAnonymization = false;
    const anon = await ai.anonymize({
      text: "내 번호는 010-1111-2222",
      language: "ko"
    });
    expect(anon.text).toBe("내 번호는 010-1111-2222");

    // Toggle 2: enableRiskSafety = false
    aiSettings.enableRiskSafety = false;
    const risk = await ai.classifyRisk({
      text: "죽고 싶어요 자살",
      language: "ko"
    });
    expect(risk.level).toBe("NORMAL");

    // Toggle 3: enableReplyCoach = false
    aiSettings.enableReplyCoach = false;
    const coached = await ai.coachReply({
      letterText: "힘들어요",
      replyText: "당연히 해야지",
      desiredReplyType: "COMFORT",
      language: "ko"
    });
    expect(coached.flags).toHaveLength(0);

    // Toggle 4: enableWritingSparks = false
    aiSettings.enableWritingSparks = false;
    const sparks = await ai.generateWritingSparks({
      mood: "burnout",
      language: "ko"
    });
    expect(sparks.sparks).toHaveLength(0);

    // Toggle 5: enableResonanceMatch = false
    aiSettings.enableResonanceMatch = false;
    const match = await ai.matchResonantLetters({
      responderPreference: "COMFORT",
      availableLetters: [
        { id: "let-2", emotionTags: [], situationTags: [], desiredReplyType: "COMFORT" }
      ]
    });
    expect(match.recommendedLetterIds).toEqual(["let-2"]);
  });

  it("verifies pic2 exit breathing prompt across all 3 locales", () => {
    expect(translate("ko_KR", "resources.exitBreathPrompt")).toBe("힘들거나 지칠 때, 호흡을 안정시켜봅시다");
    expect(translate("en_US", "resources.exitBreathPrompt")).toContain("steady our breathing");
    expect(translate("zh_CN", "resources.exitBreathPrompt")).toContain("平复一下呼吸");
  });
});
