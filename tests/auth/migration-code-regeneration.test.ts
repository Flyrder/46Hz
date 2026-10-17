import { describe, expect, it } from "vitest";
import { createMigrationCode } from "@/lib/session";
import { sessionSettings } from "@/settings";

describe("Migration Code Regeneration (Leak Protection)", () => {
  it("generates a new migration code following prefix and alphabet rules", () => {
    const code = createMigrationCode();
    expect(code.startsWith(sessionSettings.migrationCodePrefix)).toBe(true);
    expect(code).toMatch(/^46HZ-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it("produces distinct migration codes upon subsequent regenerations", () => {
    const originalCode = createMigrationCode();
    const regeneratedCode1 = createMigrationCode();
    const regeneratedCode2 = createMigrationCode();

    expect(regeneratedCode1).not.toBe(originalCode);
    expect(regeneratedCode2).not.toBe(regeneratedCode1);
  });

  it("ensures regenerated migration codes contain only unambiguous characters", () => {
    const alphabet = sessionSettings.migrationCodeAlphabet;
    for (let i = 0; i < 20; i++) {
      const code = createMigrationCode();
      const rawBody = code.replace(sessionSettings.migrationCodePrefix, "").replace(/-/g, "");
      for (const char of rawBody) {
        expect(alphabet.includes(char)).toBe(true);
      }
    }
  });
});
