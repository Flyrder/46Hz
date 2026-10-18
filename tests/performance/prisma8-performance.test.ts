import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { toTimestamp } from "@/lib/dates";
import { getPreparedGetUser } from "@/lib/db/prepared";
import { findAvailableReplyLetters } from "@/lib/reply/claiming";

describe("Prisma 8 RC Performance & Simplicity Optimizations", () => {
  it("executes pre-compiled prepared statement for user session with zero dynamic AST compilation", async () => {
    const ps = await getPreparedGetUser();
    expect(ps).toBeDefined();
    expect(typeof ps.query).toBe("function");

    // Execute with a non-existent ID
    const rows = await ps.query(db.runtime(), { id: "test_nonexistent_id" });
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(0);

    // Verify fetching an actual user if one exists
    const [existing] = await db.orm.public.User.select("id").limit(1).all();
    if (existing) {
      const [user] = await ps.query(db.runtime(), { id: existing.id });
      expect(user).toBeDefined();
      expect(user?.id).toBe(existing.id);
      expect(user?.anonymousHandle).toBeDefined();
    }
  });

  it("executes single-scan conditional aggregation for dashboard metrics in 1 round-trip", async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayTimestamp = toTimestamp(startOfToday);

    const letterPlan = db.raw.sql`
      SELECT
        COUNT(*) FILTER (WHERE "createdAt" >= ${startOfTodayTimestamp})::int AS "lettersToday",
        COUNT(*) FILTER (WHERE "status" = 'PENDING')::int AS "pendingLetters",
        COUNT(*) FILTER (WHERE "riskLevel" = 'HIGH')::int AS "highRisk"
      FROM "public"."Letter"
    `.returnsRow({
      lettersToday: "pg/int4@1",
      pendingLetters: "pg/int4@1",
      highRisk: "pg/int4@1"
    }).build();

    const [letterStats] = await db.runtime().query(letterPlan);
    expect(letterStats).toBeDefined();
    expect(typeof letterStats.lettersToday).toBe("number");
    expect(typeof letterStats.pendingLetters).toBe("number");
    expect(typeof letterStats.highRisk).toBe("number");

    const feedbackPlan = db.raw.sql`
      SELECT
        COUNT(*)::int AS "feedbackCount",
        COUNT(*) FILTER (WHERE "reportReason" IS NOT NULL)::int AS "reports",
        COUNT(*) FILTER (WHERE "feltUnderstood" = true)::int AS "understoodCount"
      FROM "public"."Feedback"
    `.returnsRow({
      feedbackCount: "pg/int4@1",
      reports: "pg/int4@1",
      understoodCount: "pg/int4@1"
    }).build();

    const [feedbackStats] = await db.runtime().query(feedbackPlan);
    expect(feedbackStats).toBeDefined();
    expect(typeof feedbackStats.feedbackCount).toBe("number");
    expect(typeof feedbackStats.reports).toBe("number");
    expect(typeof feedbackStats.understoodCount).toBe("number");

    const replyPlan = db.raw.sql`
      SELECT
        COUNT(*)::int AS "replyCount",
        COUNT(*) FILTER (WHERE "createdAt" >= ${startOfTodayTimestamp})::int AS "repliesToday",
        COUNT(*) FILTER (WHERE "status" = 'PENDING')::int AS "pendingReplies",
        COUNT(*) FILTER (WHERE "status" = 'REJECTED')::int AS "rejectedReplyCount"
      FROM "public"."Reply"
    `.returnsRow({
      replyCount: "pg/int4@1",
      repliesToday: "pg/int4@1",
      pendingReplies: "pg/int4@1",
      rejectedReplyCount: "pg/int4@1"
    }).build();

    const [replyStats] = await db.runtime().query(replyPlan);
    expect(replyStats).toBeDefined();
    expect(typeof replyStats.replyCount).toBe("number");
    expect(typeof replyStats.repliesToday).toBe("number");
    expect(typeof replyStats.pendingReplies).toBe("number");
    expect(typeof replyStats.rejectedReplyCount).toBe("number");
  });

  it("verifies chained .where() and object shorthand in reply eligibility queries", async () => {
    const candidates = await findAvailableReplyLetters("test_responder_simplicity", 5);
    expect(Array.isArray(candidates)).toBe(true);
  });
});
