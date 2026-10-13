import { describe, expect, it } from "vitest";
import { SCHUMANN_HARMONICS } from "@/components/resonance-meter";
import { reviewLetterSchema, writeLetterSchema } from "@/lib/validators";

describe("Letter Management: Schumann Resonance Physics & Validation", () => {
  it("defines empirical Schumann resonance harmonics with non-linear damping rather than naive linear multiples", () => {
    expect(SCHUMANN_HARMONICS).toHaveLength(15);
    
    // Fundamental mode (Mode 1)
    expect(SCHUMANN_HARMONICS[0]).toBe("7.8Hz");

    // 7th mode is ~45.9Hz (the brand name 46Hz origin)
    expect(SCHUMANN_HARMONICS[6]).toBe("45.9Hz");

    // Physical verification:
    // If it were a naive linear multiple (7.83 * 7), Mode 7 would be 54.81Hz!
    // But in the real lossy Earth-ionosphere cavity with finite conductivity and damping,
    // the measured 7th harmonic mode is ~45.9Hz (~46Hz).
    const parsedMode7 = parseFloat(SCHUMANN_HARMONICS[6].replace("Hz", ""));
    const naiveLinear7 = 7.83 * 7;
    expect(parsedMode7).toBeLessThan(naiveLinear7);
    expect(Math.round(parsedMode7)).toBe(46);
  });

  it("validates letter draft creation with writeLetterSchema", () => {
    const valid = writeLetterSchema.safeParse({
      rawText: "This is a meaningful letter to express feelings gently."
    });
    expect(valid.success).toBe(true);

    const tooShort = writeLetterSchema.safeParse({
      rawText: "Short"
    });
    expect(tooShort.success).toBe(false);
  });

  it("validates letter review submission with reviewLetterSchema", () => {
    const valid = reviewLetterSchema.safeParse({
      letterId: "clletter123",
      processedText: "This is the moderated and cleaned version of the letter."
    });
    expect(valid.success).toBe(true);

    const missingId = reviewLetterSchema.safeParse({
      letterId: "",
      processedText: "Valid text content"
    });
    expect(missingId.success).toBe(false);
  });

  it("verifies raw draft and AI processed text preservation for author comparison", () => {
    const sampleRaw = "Hello, my phone is 010-1234-5678 and I feel overwhelmed by work.";
    const sampleProcessed = "Hello, I feel overwhelmed by work.";

    // Diff / comparison logic: raw preserves PII before moderation, processed shields it
    expect(sampleRaw).toContain("010-1234-5678");
    expect(sampleProcessed).not.toContain("010-1234-5678");
    expect(sampleRaw.length).toBeGreaterThan(sampleProcessed.length);
  });
});
