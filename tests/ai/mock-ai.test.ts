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

  it("does not mistake ordinary lowercase phrases for names", async () => {
    const result = await ai.anonymize({
      text: "I am writing this because I need a safer next step.",
      language: "en"
    });

    expect(result.text).toBe("I am writing this because I need a safer next step.");
    expect(result.flaggedTerms).toEqual([]);
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
});
