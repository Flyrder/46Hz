import { describe, expect, it } from "vitest";
import { verifyDataContract } from "@/lib/data-contract";

describe("Prisma 8 Data Contract & Agent Type Guards", () => {
  it("verifies contract.json and contract.d.ts match schema.prisma and domain models", () => {
    const result = verifyDataContract();
    expect(result.ok, result.errors.join("; ")).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("ensures all 8 core entities are registered in contract roots", () => {
    const result = verifyDataContract();
    const expected = [
      "User",
      "Letter",
      "Reply",
      "Match",
      "Feedback",
      "ModerationEvent",
      "SupportResource",
      "LetterComment"
    ];
    for (const model of expected) {
      expect(result.models).toContain(model);
    }
  });

  it("verifies enums parity between Zod schemas and Prisma 8 contract", () => {
    const result = verifyDataContract();
    expect(Object.keys(result.enums)).toEqual([
      "AgeRange",
      "ReplyType",
      "RiskLevel",
      "LetterStatus",
      "ReplyStatus"
    ]);
    expect(result.enums.RiskLevel).toEqual(["NORMAL", "SENSITIVE", "HIGH", "BLOCKED"]);
    expect(result.enums.ReplyType).toEqual([
      "COMFORT",
      "ADVICE",
      "SIMILAR_EXPERIENCES",
      "JUST_BEING_HEARD"
    ]);
  });
});
