import { describe, expect, it } from "vitest";
import {
  isClaimExpired,
  isMatchActiveClaim,
  calculateRemainingLeaseSeconds,
  CLAIM_LEASE_MINUTES,
  CLAIM_LEASE_MS
} from "@/lib/reply/claiming";

describe("Reply Concurrency Claiming Control", () => {
  const baseTime = new Date("2026-10-11T12:00:00Z");

  it("calculates lease constants correctly (15 minutes)", () => {
    expect(CLAIM_LEASE_MINUTES).toBe(15);
    expect(CLAIM_LEASE_MS).toBe(15 * 60 * 1000);
  });

  describe("isClaimExpired", () => {
    it("returns false when within the 15-minute lease window", () => {
      const claimCreatedAt = new Date(baseTime.getTime() - 5 * 60 * 1000); // 5 mins ago
      expect(isClaimExpired(claimCreatedAt, baseTime)).toBe(false);
    });

    it("returns false at 14 minutes 59 seconds", () => {
      const claimCreatedAt = new Date(baseTime.getTime() - (15 * 60 * 1000 - 1000));
      expect(isClaimExpired(claimCreatedAt, baseTime)).toBe(false);
    });

    it("returns true at exactly 15 minutes", () => {
      const claimCreatedAt = new Date(baseTime.getTime() - 15 * 60 * 1000);
      expect(isClaimExpired(claimCreatedAt, baseTime)).toBe(true);
    });

    it("returns true past 15 minutes (e.g., 20 mins ago)", () => {
      const claimCreatedAt = new Date(baseTime.getTime() - 20 * 60 * 1000);
      expect(isClaimExpired(claimCreatedAt, baseTime)).toBe(true);
    });

    it("supports ISO string timestamps", () => {
      const claimStr = new Date(baseTime.getTime() - 2 * 60 * 1000).toISOString();
      expect(isClaimExpired(claimStr, baseTime)).toBe(false);
    });
  });

  describe("isMatchActiveClaim", () => {
    it("recognizes active OFFERED matches within lease duration", () => {
      const match = {
        status: "OFFERED" as const,
        createdAt: new Date(baseTime.getTime() - 3 * 60 * 1000)
      };
      expect(isMatchActiveClaim(match, baseTime)).toBe(true);
    });

    it("rejects expired OFFERED matches", () => {
      const match = {
        status: "OFFERED" as const,
        createdAt: new Date(baseTime.getTime() - 16 * 60 * 1000)
      };
      expect(isMatchActiveClaim(match, baseTime)).toBe(false);
    });

    it("rejects RESPONDED matches even if recent", () => {
      const match = {
        status: "RESPONDED" as const,
        createdAt: new Date(baseTime.getTime() - 1 * 60 * 1000)
      };
      expect(isMatchActiveClaim(match, baseTime)).toBe(false);
    });

    it("rejects SKIPPED or EXPIRED matches even if recent", () => {
      expect(
        isMatchActiveClaim(
          { status: "SKIPPED", createdAt: new Date(baseTime.getTime() - 1000) },
          baseTime
        )
      ).toBe(false);
      expect(
        isMatchActiveClaim(
          { status: "EXPIRED", createdAt: new Date(baseTime.getTime() - 1000) },
          baseTime
        )
      ).toBe(false);
    });
  });

  describe("calculateRemainingLeaseSeconds", () => {
    it("returns remaining seconds accurately", () => {
      const claimCreatedAt = new Date(baseTime.getTime() - 5 * 60 * 1000); // 5 mins ago
      // Remaining: 10 minutes = 600 seconds
      expect(calculateRemainingLeaseSeconds(claimCreatedAt, baseTime)).toBe(600);
    });

    it("clamps to 0 when expired", () => {
      const claimCreatedAt = new Date(baseTime.getTime() - 20 * 60 * 1000);
      expect(calculateRemainingLeaseSeconds(claimCreatedAt, baseTime)).toBe(0);
    });

    it("handles fresh claim (0 seconds elapsed)", () => {
      expect(calculateRemainingLeaseSeconds(baseTime, baseTime)).toBe(15 * 60);
    });
  });

  describe("Claim Release and Lifecycle", () => {
    it("SKIPPED match immediately unblocks letter even if within 15 minutes", () => {
      const match = {
        status: "SKIPPED" as const,
        createdAt: new Date(baseTime.getTime() - 2 * 60 * 1000) // 2 mins ago
      };
      // Once released/skipped, it must not count as an active claim
      expect(isMatchActiveClaim(match, baseTime)).toBe(false);
    });
  });
});
