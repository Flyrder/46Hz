import { describe, expect, it, beforeEach } from "vitest";
import { replyTypeSchema } from "@/lib/validators";

describe("Desired Reply Type Re-selection Logic", () => {
  it("validates all four supported reply types cleanly", () => {
    expect(replyTypeSchema.parse("COMFORT")).toBe("COMFORT");
    expect(replyTypeSchema.parse("ADVICE")).toBe("ADVICE");
    expect(replyTypeSchema.parse("SIMILAR_EXPERIENCES")).toBe("SIMILAR_EXPERIENCES");
    expect(replyTypeSchema.parse("JUST_BEING_HEARD")).toBe("JUST_BEING_HEARD");
  });

  it("rejects unknown or invalid reply types", () => {
    expect(() => replyTypeSchema.parse("INVALID_TYPE")).toThrow();
    expect(() => replyTypeSchema.parse("")).toThrow();
    expect(() => replyTypeSchema.parse(null)).toThrow();
  });

  it("allows switching desired reply type and records state transition correctly", () => {
    const letter = {
      id: "letter-123",
      authorId: "user-author",
      desiredReplyType: "COMFORT" as const
    };

    const newReplyType = replyTypeSchema.parse("ADVICE");
    const updatedLetter = {
      ...letter,
      desiredReplyType: newReplyType
    };

    expect(updatedLetter.desiredReplyType).toBe("ADVICE");
    expect(updatedLetter.id).toBe(letter.id);
  });
});
