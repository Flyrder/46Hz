import { describe, it, expect } from "vitest";
import { computeContentHash } from "@/lib/compliance/incident-packet";
import { maskIp, pruneExpiredIps, updateIpQueue, IpRecord } from "@/lib/ip";

describe("Law Enforcement Compliance & Data Minimization Tests", () => {
  describe("Cryptographic Evidentiary Hashing", () => {
    it("generates deterministic SHA-256 content hashes", () => {
      const text = "This is a quiet message on 46Hz.";
      const hash1 = computeContentHash(text);
      const hash2 = computeContentHash(text);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // 256 bits = 64 hex characters
    });

    it("produces different hashes for even single character alterations", () => {
      const hash1 = computeContentHash("Hello world");
      const hash2 = computeContentHash("Hello world!");

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("IP Address Privacy Masking", () => {
    it("masks IPv4 addresses to first two octets", () => {
      expect(maskIp("192.168.1.100")).toBe("192.168.***.***");
      expect(maskIp("10.0.0.1")).toBe("10.0.***.***");
    });

    it("masks IPv6 addresses to first two segments", () => {
      const masked = maskIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
      expect(masked).toBe("2001:0db8:****:****");
    });

    it("handles empty or invalid IP strings gracefully", () => {
      expect(maskIp("")).toBe("***");
    });
  });

  describe("Data Minimization Retention & Auto-Pruning", () => {
    it("prunes IP entries older than retention window (default 14 days)", () => {
      const now = new Date("2026-10-12T12:00:00Z");
      const queue: IpRecord[] = [
        { ip: "1.1.1.1", at: "2026-09-20T12:00:00Z" }, // 22 days old -> expired
        { ip: "2.2.2.2", at: "2026-10-01T12:00:00Z" }, // 11 days old -> kept
        { ip: "3.3.3.3", at: "2026-10-11T12:00:00Z" }  // 1 day old -> kept
      ];

      const pruned = pruneExpiredIps(queue, 14, now);
      expect(pruned).toHaveLength(2);
      expect(pruned.map((r) => r.ip)).toEqual(["2.2.2.2", "3.3.3.3"]);
    });

    it("auto-prunes expired IPs during updateIpQueue execution", () => {
      const nowIso = "2026-10-12T12:00:00Z";
      const queue: IpRecord[] = [
        { ip: "1.1.1.1", at: "2026-09-01T12:00:00Z" } // > 14 days old
      ];

      const updated = updateIpQueue(queue, "4.4.4.4", nowIso);
      expect(updated).toEqual([{ ip: "4.4.4.4", at: nowIso }]);
      expect(updated.find((r) => r.ip === "1.1.1.1")).toBeUndefined();
    });
  });
});
