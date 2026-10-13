import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";

import { adminSettings } from "@/settings";

export type AdminRole = "ADMIN" | "MODERATOR";

export const ADMIN_COOKIE = adminSettings.roleCookie;
export const LEGACY_ADMIN_COOKIE = adminSettings.legacyRoleCookie;

/**
 * Constant-time string comparison using SHA-256 digests to prevent timing attacks.
 * Hashing normalizes input lengths to 32 bytes, satisfying timingSafeEqual length equality requirements.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function getAdminPasscode(): string {
  return process.env.ADMIN_PASSCODE ?? adminSettings.defaultAdminPasscode;
}

export function getModeratorPasscode(): string {
  return process.env.MODERATOR_PASSCODE ?? adminSettings.defaultModeratorPasscode;
}

export function authenticatePasscode(passcode: string): AdminRole | null {
  if (!passcode) {
    return null;
  }
  if (timingSafeStringEqual(passcode, getAdminPasscode())) {
    return "ADMIN";
  }
  if (timingSafeStringEqual(passcode, getModeratorPasscode())) {
    return "MODERATOR";
  }
  return null;
}

export async function getAdminRole(): Promise<AdminRole | null> {
  const cookieStore = await cookies();
  const roleVal = cookieStore.get(ADMIN_COOKIE)?.value;
  if (roleVal === "ADMIN" || roleVal === "MODERATOR") {
    return roleVal;
  }
  // Check fallback cookies
  if (
    cookieStore.get("46hz_admin")?.value === "1" ||
    cookieStore.get(LEGACY_ADMIN_COOKIE)?.value === "1"
  ) {
    return "ADMIN";
  }
  return null;
}

export async function isAdminSession(): Promise<boolean> {
  const role = await getAdminRole();
  return role !== null;
}

export async function requireStaff(): Promise<AdminRole> {
  const role = await getAdminRole();
  if (!role) {
    redirect("/admin");
  }
  return role;
}

export async function requireAdmin(): Promise<void> {
  const role = await getAdminRole();
  if (!role) {
    redirect("/admin");
  }
  if (role !== "ADMIN") {
    throw new Error("Permission Denied: System Administrator privileges required.");
  }
}

export async function setAdminSession(role: AdminRole = "ADMIN"): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  cookieStore.set("46hz_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  cookieStore.delete("46hz_admin");
  cookieStore.delete(LEGACY_ADMIN_COOKIE);
}

export function canManageUsers(role: AdminRole | null): boolean {
  return role === "ADMIN";
}

export function canManageResources(role: AdminRole | null): boolean {
  return role === "ADMIN";
}

export function canModerateContent(role: AdminRole | null): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}
