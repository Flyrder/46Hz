import { describe, expect, it } from "vitest";
import { and, or } from "@prisma/orm-postgres/orm-client";
import { verifyDataContract } from "@/lib/data-contract";
import { toTimestamp } from "@/lib/dates";
import { db } from "@/lib/db";
import { letterPreview, orderedSupportResourcesQuery } from "@/lib/db/queries";
import { findAvailableReplyLetters } from "@/lib/reply/claiming";
import { createAnonymousHandle } from "@/lib/session";

describe("Prisma 8 Data Contract & Native ORM Queries", () => {
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

  it("executes native Prisma 8 relation filters, array predicates, count reducers, and boolean ordering", async () => {
    const available = await findAvailableReplyLetters("test_responder_id", 4);
    expect(Array.isArray(available)).toBe(true);

    const tagged = await db.orm.public.Letter
      .with(letterPreview)
      .where((letter, { fns }) =>
        and(
          fns.raw`${"lonely"} = ANY(${letter.emotionTags})`.returns("pg/bool@1"),
          letter.createdAt.gte(toTimestamp("2020-01-01T00:00:00Z")),
          letter.createdAt.lte(toTimestamp("2030-01-01T00:00:00Z")),
          or(
            letter.status.eq("APPROVED"),
            letter.replies.some((reply) => reply.status.eq("APPROVED"))
          )
        )
      )
      .include("replies", (replies) => replies.where({ status: "APPROVED" }).count())
      .limit(5)
      .all();
    expect(Array.isArray(tagged)).toBe(true);
    for (const row of tagged) {
      expect(Object.hasOwn(row, "rawText")).toBe(false);
      expect(Object.hasOwn(row, "authorId")).toBe(false);
      expect(typeof row.replies).toBe("number");
    }

    const reports = await db.orm.public.Feedback
      .where((feedback) => feedback.reportReason.isNotNull())
      .include("fromUser", (user) => user.select("id", "anonymousHandle"))
      .include("reply", (reply) =>
        reply
          .select("id")
          .include("letter", (letter) => letter.select("id", "processedText"))
          .include("responder", (responder) => responder.select("id", "anonymousHandle"))
      )
      .limit(5)
      .all();
    expect(Array.isArray(reports)).toBe(true);

    const resources = await orderedSupportResourcesQuery().all();
    expect(Array.isArray(resources)).toBe(true);
  });

  it("enforces SQL-level column projection and real transactional rollback", async () => {
    const handle = createAnonymousHandle();

    await expect(
      db.transaction(async (tx) => {
        const created = await tx.orm.public.User.select("id").create({
          anonymousHandle: handle,
          language: "ko_KR",
          ageRange: "ADULT",
          preferredReplyType: "COMFORT"
        });
        expect(Object.hasOwn(created, "migrationCode")).toBe(false);
        throw new Error("Intentional rollback");
      })
    ).rejects.toThrow("Intentional rollback");

    const afterRollback = await db.orm.public.User
      .select("id")
      .where({ anonymousHandle: handle })
      .first();
    expect(afterRollback).toBeNull();
  });
});
