import { and } from "@prisma/orm-postgres/orm-client";
import { databaseDate, toTimestamp } from "@/lib/dates";
import { db } from "@/lib/db";
import { conflictKey, letterPreview } from "@/lib/db/queries";
import type { MatchStatus } from "@/lib/domain";
import { claimingSettings, resonanceSettings } from "@/settings";

export const CLAIM_LEASE_MINUTES = claimingSettings.leaseDurationMinutes;
export const CLAIM_LEASE_MS = CLAIM_LEASE_MINUTES * 60 * 1000;

/**
 * 46Hz Brand Resonance Caps:
 * 46Hz corresponds to the 7th Schumann harmonic resonance of Earth (~7.83Hz * 7 ≈ 46Hz).
 * By default, each letter receives up to 7 resonant replies to prevent emotional overwhelm.
 * Letter authors can consciously opt-in to expand the resonance space to 15 replies.
 */
export const DEFAULT_RESONANCE_CAP = resonanceSettings.defaultMaxReplies;
export const EXPANDED_RESONANCE_CAP = resonanceSettings.expandedMaxReplies;

export type ClaimResult =
  | {
      ok: true;
      leaseExpiresAt: Date;
      remainingSeconds: number;
    }
  | {
      ok: false;
      reason:
        | "LOCKED_BY_ANOTHER"
        | "NOT_FOUND"
        | "CANNOT_REPLY_OWN_LETTER"
        | "ALREADY_REPLIED"
        | "INELIGIBLE_LETTER"
        | "RESONANCE_LIMIT_REACHED";
    };

/**
 * Pure check: Is resonance capacity full?
 */
export function isResonanceFull(
  currentReplyCount: number,
  maxReplies: number = DEFAULT_RESONANCE_CAP
): boolean {
  return currentReplyCount >= maxReplies;
}

/**
 * Pure check: Can the user expand this letter's resonance?
 */
export function canExpandResonance(
  letter: { maxReplies: number; authorId: string },
  userId: string
): boolean {
  return letter.authorId === userId && letter.maxReplies < EXPANDED_RESONANCE_CAP;
}

/**
 * Pure check: Is the claim expired based on its createdAt timestamp and lease duration?
 */
export function isClaimExpired(claimCreatedAt: Date | string, now = new Date()): boolean {
  const created = databaseDate(claimCreatedAt).getTime();
  const leaseMs = claimingSettings.leaseDurationMinutes * 60 * 1000;
  return now.getTime() - created >= leaseMs;
}

/**
 * Pure check: Is a given match an active, unexpired claim?
 */
export function isMatchActiveClaim(
  match: { status: MatchStatus | string; createdAt: Date | string },
  now = new Date()
): boolean {
  return match.status === "OFFERED" && !isClaimExpired(match.createdAt, now);
}

/**
 * Pure check: Remaining lease seconds.
 */
export function calculateRemainingLeaseSeconds(
  claimCreatedAt: Date | string,
  now = new Date()
): number {
  const created = databaseDate(claimCreatedAt).getTime();
  const elapsed = now.getTime() - created;
  const leaseMs = claimingSettings.leaseDurationMinutes * 60 * 1000;
  const remaining = Math.max(0, Math.floor((leaseMs - elapsed) / 1000));
  return remaining;
}

/**
 * Attempt to claim a letter for a 15-minute exclusive reply reservation.
 */
export async function claimLetterForReply(
  letterId: string,
  responderId: string,
  now = new Date()
): Promise<ClaimResult> {
  const leaseMinutes = claimingSettings.leaseDurationMinutes;
  const leaseMs = leaseMinutes * 60 * 1000;

  return db.transaction(async (tx): Promise<ClaimResult> => {
    const letter = await tx.orm.public.Letter
      .select("id", "authorId", "status", "riskLevel", "maxReplies")
      .where({ id: letterId })
      .forNoKeyUpdate()
      .first();

    if (!letter) {
      return { ok: false, reason: "NOT_FOUND" };
    }

    if (letter.authorId === responderId) {
      return { ok: false, reason: "CANNOT_REPLY_OWN_LETTER" };
    }

    if (letter.status !== "APPROVED" || letter.riskLevel !== "NORMAL") {
      return { ok: false, reason: "INELIGIBLE_LETTER" };
    }

    const [existingReply, activeReplies, offeredMatches] = await Promise.all([
      tx.orm.public.Reply.select("id").where({ letterId, responderId }).first(),
      tx.orm.public.Reply
        .where((reply) => and(reply.letterId.eq(letterId), reply.status.neq("REJECTED")))
        .aggregate((agg) => ({ count: agg.count() })),
      tx.orm.public.Match
        .select("id", "responderId", "status", "createdAt")
        .where({ letterId, status: "OFFERED" })
        .all()
    ]);

    if (existingReply) {
      return { ok: false, reason: "ALREADY_REPLIED" };
    }

    const maxReplies = letter.maxReplies ?? resonanceSettings.defaultMaxReplies;
    if (activeReplies.count >= maxReplies) {
      return { ok: false, reason: "RESONANCE_LIMIT_REACHED" };
    }

    const conflictingClaim = offeredMatches.find(
      (m) => m.responderId !== responderId && isMatchActiveClaim(m, now)
    );
    if (conflictingClaim) {
      return { ok: false, reason: "LOCKED_BY_ANOTHER" };
    }

    const expiredOtherIds = offeredMatches
      .filter((m) => m.responderId !== responderId && isClaimExpired(m.createdAt, now))
      .map((m) => m.id);

    if (expiredOtherIds.length > 0) {
      await tx.orm.public.Match
        .where((match) => match.id.in(expiredOtherIds))
        .updateAndCount({ status: "EXPIRED" });
    }

    const nowTimestamp = toTimestamp(now);
    await tx.orm.public.Match.select("id").upsert({
      conflictOn: conflictKey<"Match">({ letterId, responderId }),
      create: {
        letterId,
        responderId,
        status: "OFFERED",
        matchReason: `Reserved for reply (${leaseMinutes}m lease)`,
        createdAt: nowTimestamp
      },
      update: {
        status: "OFFERED",
        createdAt: nowTimestamp,
        matchReason: `Refreshed reply lease (${leaseMinutes}m lease)`
      }
    });

    return {
      ok: true,
      leaseExpiresAt: new Date(now.getTime() + leaseMs),
      remainingSeconds: leaseMinutes * 60
    };
  });
}

/**
 * Release an active claim (e.g., when the user leaves or clicks Skip).
 */
export async function releaseLetterClaim(letterId: string, responderId: string): Promise<void> {
  await db.orm.public.Match
    .where({ letterId, responderId, status: "OFFERED" })
    .updateAndCount({ status: "SKIPPED" });
}

/**
 * Query letters available for peer replies, excluding letters locked by other responders
 * and letters that have reached their Schumann resonance capacity (7 or 15).
 */
export async function findAvailableReplyLetters(responderId: string, limit = 6) {
  const leaseCutoff = toTimestamp(new Date(Date.now() - claimingSettings.leaseDurationMinutes * 60 * 1000));

  // Opportunistic auto-cleanup of stale OFFERED locks
  await db.orm.public.Match
    .where((match) => and(match.status.eq("OFFERED"), match.createdAt.lt(leaseCutoff)))
    .updateAndCount({ status: "EXPIRED" });

  const candidates = await db.orm.public.Letter
    .with(letterPreview)
    .where((letter, { fns }) =>
      fns.and(
        letter.authorId.neq(responderId),
        letter.status.eq("APPROVED"),
        letter.riskLevel.eq("NORMAL"),
        letter.replies.none((reply) => reply.responderId.eq(responderId)),
        letter.matches.none((match) =>
          and(
            match.responderId.neq(responderId),
            match.status.eq("OFFERED"),
            match.createdAt.gte(leaseCutoff)
          )
        ),
        fns.raw`(SELECT COUNT(*)::int FROM "public"."Reply" r WHERE r."letterId" = ${letter.id} AND r."status" <> 'REJECTED') < ${letter.maxReplies}`.returns("pg/bool@1")
      )
    )
    .include("replies", (replies) => replies.where((reply) => reply.status.neq("REJECTED")).count())
    .orderBy((letter) => letter.createdAt.asc())
    .limit(limit)
    .all();

  return candidates;
}
