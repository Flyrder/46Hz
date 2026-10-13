import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  authenticatePasscode,
  canManageResources,
  canManageUsers,
  canModerateContent,
  getAdminPasscode,
  getModeratorPasscode,
  ADMIN_COOKIE
} from "@/lib/admin";

describe("Admin RBAC & Moderation Roles", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("cookie name follows 46Hz naming convention", () => {
    expect(ADMIN_COOKIE).toBe("46hz_admin_role");
  });

  it("authenticates admin passcode correctly", () => {
    process.env.ADMIN_PASSCODE = "secret-super-admin";
    expect(authenticatePasscode("secret-super-admin")).toBe("ADMIN");
  });

  it("authenticates moderator passcode correctly", () => {
    process.env.MODERATOR_PASSCODE = "secret-moderator";
    expect(authenticatePasscode("secret-moderator")).toBe("MODERATOR");
  });

  it("rejects invalid passcodes", () => {
    expect(authenticatePasscode("random-wrong-password")).toBeNull();
    expect(authenticatePasscode("")).toBeNull();
  });

  it("enforces default passcodes when env variables are not set", () => {
    delete process.env.ADMIN_PASSCODE;
    delete process.env.MODERATOR_PASSCODE;
    expect(getAdminPasscode()).toBe("local-admin");
    expect(getModeratorPasscode()).toBe("local-moderator");
    expect(authenticatePasscode("local-admin")).toBe("ADMIN");
    expect(authenticatePasscode("local-moderator")).toBe("MODERATOR");
  });

  describe("Role Capabilities", () => {
    it("restricts user management exclusively to ADMIN", () => {
      expect(canManageUsers("ADMIN")).toBe(true);
      expect(canManageUsers("MODERATOR")).toBe(false);
      expect(canManageUsers(null)).toBe(false);
    });

    it("restricts support resource management exclusively to ADMIN", () => {
      expect(canManageResources("ADMIN")).toBe(true);
      expect(canManageResources("MODERATOR")).toBe(false);
      expect(canManageResources(null)).toBe(false);
    });

    it("allows both ADMIN and MODERATOR to moderate content (letters and replies)", () => {
      expect(canModerateContent("ADMIN")).toBe(true);
      expect(canModerateContent("MODERATOR")).toBe(true);
      expect(canModerateContent(null)).toBe(false);
    });
  });
});
