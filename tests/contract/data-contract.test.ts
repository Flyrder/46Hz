import { describe, expect, it } from "vitest";
import { verifyDataContract } from "@/lib/data-contract";
import { prisma } from "@/lib/db";
import { findAvailableReplyLetters } from "@/lib/reply/claiming";

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

  it("executes Prisma 8 relation filters (none/some), range filters, and array has filters without throwing", async () => {
    const available = await findAvailableReplyLetters("test_responder_id", 4);
    expect(Array.isArray(available)).toBe(true);

    const tagged = await prisma.letter.findMany({
      where: {
        emotionTags: { has: "lonely" },
        createdAt: {
          gte: new Date("2020-01-01T00:00:00Z"),
          lte: new Date("2030-01-01T00:00:00Z")
        },
        OR: [
          { status: "APPROVED" },
          { replies: { some: { status: "APPROVED" } } }
        ]
      },
      include: {
        replies: { where: { status: "APPROVED" } },
        _count: { select: { replies: { where: { status: "APPROVED" } } } }
      },
      take: 5
    });
    expect(Array.isArray(tagged)).toBe(true);

    const reports = await prisma.feedback.findMany({
      where: { reportReason: { not: null } },
      include: {
        fromUser: true,
        reply: { include: { letter: true, responder: true } }
      },
      take: 5
    });
    expect(Array.isArray(reports)).toBe(true);
  });
});
