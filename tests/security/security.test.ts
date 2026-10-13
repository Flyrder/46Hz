import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit, clearAllRateLimits } from "@/lib/safety/rate-limit";
import { timingSafeStringEqual, authenticatePasscode } from "@/lib/admin";

describe("Security Hardening Tests", () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  describe("Timing-safe String Comparison", () => {
    it("returns true for identical strings", () => {
      expect(timingSafeStringEqual("secret-passcode-123", "secret-passcode-123")).toBe(true);
      expect(timingSafeStringEqual("", "")).toBe(true);
    });

    it("returns false for different strings of same length", () => {
      expect(timingSafeStringEqual("secret1", "secret2")).toBe(false);
    });

    it("returns false for different strings of different lengths", () => {
      expect(timingSafeStringEqual("short", "much-longer-string")).toBe(false);
    });

    it("safely handles non-string inputs", () => {
      // @ts-expect-error testing invalid input types
      expect(timingSafeStringEqual(null, "test")).toBe(false);
      // @ts-expect-error testing invalid input types
      expect(timingSafeStringEqual("test", undefined)).toBe(false);
    });

    it("authenticates passcodes correctly in constant time", () => {
      expect(authenticatePasscode("local-admin")).toBe("ADMIN");
      expect(authenticatePasscode("local-moderator")).toBe("MODERATOR");
      expect(authenticatePasscode("wrong-code")).toBe(null);
      expect(authenticatePasscode("")).toBe(null);
    });
  });

  describe("Sliding Window Rate Limiter", () => {
    it("allows requests under the limit", () => {
      const key = "test:user:1";
      const now = 1000;

      const r1 = checkRateLimit(key, 3, 10_000, now);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit(key, 3, 10_000, now + 1000);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit(key, 3, 10_000, now + 2000);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);
    });

    it("blocks requests exceeding the limit", () => {
      const key = "test:user:2";
      const now = 5000;

      checkRateLimit(key, 2, 10_000, now);
      checkRateLimit(key, 2, 10_000, now + 100);

      const blocked = checkRateLimit(key, 2, 10_000, now + 200);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });

    it("resets after window expiration", () => {
      const key = "test:user:3";
      const startTime = 10_000;
      const windowMs = 5_000;

      // Exhaust limit
      checkRateLimit(key, 1, windowMs, startTime);
      expect(checkRateLimit(key, 1, windowMs, startTime + 1000).allowed).toBe(false);

      // Past window
      const afterWindow = checkRateLimit(key, 1, windowMs, startTime + 6000);
      expect(afterWindow.allowed).toBe(true);
      expect(afterWindow.remaining).toBe(0);
    });

    it("allows manual reset for a specific key", () => {
      const key = "test:user:reset";
      checkRateLimit(key, 1, 60_000);
      expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false);

      resetRateLimit(key);
      expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true);
    });
  });
});
