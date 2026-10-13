import { describe, expect, it } from "vitest";
import { MockAiMiddleware } from "@/lib/ai/mock";

describe("MockAiMiddleware", () => {
  const ai = new MockAiMiddleware();

  it("summarizes and tags a normal letter without diagnosing the writer", async () => {
    const result = await ai.processLetter({
      text: "I feel lonely after moving cities for work. I do not need advice, I mostly want to be heard.",
      language: "en",
      preferredReplyType: "JUST_BEING_HEARD"
    });

    expect(result.processedText).toContain("I feel lonely after moving cities for work");
    expect(result.emotionTags).toContain("lonely");
    expect(result.situationTags).toContain("work");
    expect(result.desiredReplyType).toBe("JUST_BEING_HEARD");
    expect(result.risk.level).toBe("NORMAL");
    expect(result.processedText.toLowerCase()).not.toContain("diagnosis");
    expect(result.processedText.toLowerCase()).not.toContain("therapist");
  });

  it("flags personally identifying details for user review", async () => {
    const result = await ai.anonymize({
      text: "My name is Mina Kim and my phone number is 555-123-4567.",
      language: "en"
    });

    expect(result.text).toContain("[name removed]");
    expect(result.text).toContain("[phone removed]");
    expect(result.flaggedTerms).toEqual(
      expect.arrayContaining(["possible name", "phone number"])
    );
  });

  it("masks Korean resident registration, phone, bank account, and kakao handles", async () => {
    const sample = "제 주민번호는 950101-1234567 이고 번호는 010-9876-5432, 계좌는 110-123-456789, 카톡ID는 flyrder99 입니다.";
    const result = await ai.anonymize({
      text: sample,
      language: "ko_KR"
    });

    expect(result.text).toContain("[식별번호 비공개]");
    expect(result.text).toContain("[연락처 비공개]");
    expect(result.text).toContain("[계좌번호 비공개]");
    expect(result.text).toContain("[메신저 아이디 비공개]");
    expect(result.flaggedTerms).toEqual(
      expect.arrayContaining([
        "resident registration number",
        "phone number",
        "bank account",
        "messaging handle"
      ])
    );
  });

  it("routes explicit self-harm language as high risk", async () => {
    const result = await ai.classifyRisk({
      text: "I might hurt myself tonight and I do not feel safe.",
      language: "en"
    });

    expect(result.level).toBe("HIGH");
    expect(result.peerSafe).toBe(false);
  });

  it("coaches replies toward comfort when the writer asked to be heard", async () => {
    const result = await ai.coachReply({
      letterText: "I feel alone and mostly want someone to listen.",
      replyText: "You should stop feeling sorry for yourself and fix your routine.",
      desiredReplyType: "JUST_BEING_HEARD",
      language: "en"
    });

    expect(result.flags).toEqual(expect.arrayContaining(["judgmental", "too_advice_heavy"]));
    expect(result.coachedText).toContain("It makes sense");
    expect(result.suggestions.join(" ")).toContain("heard");
  });

  it("provides 3 healing tone reframings and tone radar metrics", async () => {
    const result = await ai.coachReply({
      letterText: "요즘 많이 외롭고 지쳐요.",
      replyText: "힘내세요 다 지나갈 거예요.",
      desiredReplyType: "COMFORT",
      language: "ko_KR"
    });

    expect(result.reframings).toBeDefined();
    expect(result.reframings).toHaveLength(3);
    const tones = result.reframings?.map((r) => r.tone);
    expect(tones).toEqual(["warm", "listening", "grounding"]);

    expect(result.metrics).toBeDefined();
    expect(result.metrics?.empathy).toBeGreaterThan(0);
    expect(result.metrics?.gentleness).toBeGreaterThan(0);
    expect(result.metrics?.nonJudgmental).toBeGreaterThan(0);
  });

  it("generates writing sparks based on mood", async () => {
    const result = await ai.generateWritingSparks({
      mood: "burnout",
      language: "ko_KR"
    });

    expect(result.sparks.length).toBeGreaterThanOrEqual(3);
    expect(result.suggestedEmotionTags).toContain("overwhelmed");
    expect(result.sparks[0].text.length).toBeGreaterThan(10);
  });

  it("matches resonant letters based on responder preferences", async () => {
    const letters = [
      {
        id: "letter-1",
        emotionTags: ["lonely"],
        situationTags: ["work"],
        desiredReplyType: "COMFORT" as const
      },
      {
        id: "letter-2",
        emotionTags: ["happy"],
        situationTags: ["school"],
        desiredReplyType: "ADVICE" as const
      }
    ];

    const result = await ai.matchResonantLetters({
      responderPreference: "COMFORT",
      availableLetters: letters
    });

    expect(result.recommendedLetterIds).toContain("letter-1");
    expect(result.matchReasons["letter-1"]).toBeDefined();
  });
});
