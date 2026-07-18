import { describe, expect, it } from "vitest";
import { createMigrationCode } from "@/lib/session";

describe("session migration codes", () => {
  it("generates a migration code matching the format EKO-XXXX-XXXX", () => {
    const code = createMigrationCode();
    expect(code).toMatch(/^EKO-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("does not contain confusing characters (I, O, 0, 1) in the random part", () => {
    const code = createMigrationCode();
    const randomPart = code.slice(4);
    expect(randomPart).not.toContain("I");
    expect(randomPart).not.toContain("O");
    expect(randomPart).not.toContain("0");
    expect(randomPart).not.toContain("1");
  });

  it("generates unique codes sequentially", () => {
    const codes = Array.from({ length: 50 }, () => createMigrationCode());
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(50);
  });
});
