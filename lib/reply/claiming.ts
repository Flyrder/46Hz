import { prisma } from "@/lib/db";
import type { MatchStatus } from "@/lib/domain";

export const CLAIM_LEASE_MINUTES = 15;
export const CLAIM_LEASE_MS = CLAIM_LEASE_MINUTES * 60 * 1000;

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
        | "INELIGIBLE_LETTER";
    };

/**
 * Pure check: Is the claim expired based on its createdAt timestamp and lease duration?
 */
export function isClaimExpired(claimCreatedAt: Date | string, now = new Date()): boolean {
  const created = new Date(claimCreatedAt).getTime();
  return now.getTime() - created >= CLAIM_LEASE_MS;
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
  const created = new Date(claimCreatedAt).getTime();
  const elapsed = now.getTime() - created;
  const remaining = Math.max(0, Math.floor((CLAIM_LEASE_MS - elapsed) / 1000));
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
  const letter = await prisma.letter.findUnique({
    where: { id: letterId },
    include: {
      replies: {
        where: { responderId },
        select: { id: true }
      },
      matches: {
        where: {
          status: "OFFERED"
        }
      }
    }
  });

  if (!letter) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (letter.authorId === responderId) {
    return { ok: false, reason: "CANNOT_REPLY_OWN_LETTER" };
  }

  if (letter.status !== "APPROVED" || letter.riskLevel !== "NORMAL") {
    return { ok: false, reason: "INELIGIBLE_LETTER" };
  }

  if (letter.replies.length > 0) {
    return { ok: false, reason: "ALREADY_REPLIED" };
  }

  // Check if another user holds an active, unexpired claim
  const conflictingClaim = letter.matches.find(
    (m) => m.responderId !== responderId && isMatchActiveClaim(m, now)
  );

  if (conflictingClaim) {
    return { ok: false, reason: "LOCKED_BY_ANOTHER" };
  }

  // Clean up any stale expired claims for other users asynchronously or in the same step
  const expiredOtherClaims = letter.matches.filter(
    (m) => m.responderId !== responderId && isClaimExpired(m.createdAt, now)
  );

  if (expiredOtherClaims.length > 0) {
    await prisma.match.updateMany({
      where: {
        id: { in: expiredOtherClaims.map((m) => m.id) }
      },
      data: { status: "EXPIRED" }
    });
  }

  // Reserve or refresh the claim for the current responder
  await prisma.match.upsert({
    where: {
      letterId_responderId: {
        letterId,
        responderId
      }
    },
    create: {
      letterId,
      responderId,
      status: "OFFERED",
      matchReason: `Reserved for reply (${CLAIM_LEASE_MINUTES}m lease)`,
      createdAt: now
    },
    update: {
      status: "OFFERED",
      createdAt: now,
      matchReason: `Refreshed reply lease (${CLAIM_LEASE_MINUTES}m lease)`
    }
  });

  return {
    ok: true,
    leaseExpiresAt: new Date(now.getTime() + CLAIM_LEASE_MS),
    remainingSeconds: CLAIM_LEASE_MINUTES * 60
  };
}

/**
 * Release an active claim (e.g., when the user leaves or clicks Skip).
 */
export async function releaseLetterClaim(letterId: string, responderId: string): Promise<void> {
  await prisma.match.updateMany({
    where: {
      letterId,
      responderId,
      status: "OFFERED"
    },
    data: {
      status: "SKIPPED"
    }
  });
}

/**
 * Query letters available for peer replies, excluding letters locked by other responders.
 */
export async function findAvailableReplyLetters(responderId: string, limit = 6) {
  const leaseCutoff = new Date(Date.now() - CLAIM_LEASE_MS);

  return prisma.letter.findMany({
    where: {
      authorId: { not: responderId },
      status: "APPROVED",
      riskLevel: "NORMAL",
      replies: {
        none: {
          responderId
        }
      },
      matches: {
        none: {
          responderId: { not: responderId },
          status: "OFFERED",
          createdAt: { gte: leaseCutoff }
        }
      }
    },
    orderBy: { createdAt: "asc" },
    take: limit
  });
}
