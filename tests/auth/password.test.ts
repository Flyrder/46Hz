import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("account passwords", () => {
  it("hashes passwords with a random salt and verifies the original secret", async () => {
    const firstHash = await hashPassword("correct horse battery staple");
    const secondHash = await hashPassword("correct horse battery staple");

    expect(firstHash).not.toBe(secondHash);
    expect(await verifyPassword("correct horse battery staple", firstHash)).toBe(true);
    expect(await verifyPassword("wrong secret", firstHash)).toBe(false);
  });
});
