import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, type User } from "@/lib/db";
import { getPreparedGetUser } from "@/lib/db/prepared";
import { sessionSettings } from "@/settings";

export const USER_COOKIE = sessionSettings.userCookie;

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(USER_COOKIE)?.value ?? null;
}

export async function setCurrentUserId(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionSettings.cookieMaxAgeSeconds
  });
}

export async function clearCurrentUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
}

import crypto from "crypto";
import { recordUserIp } from "@/lib/ip";

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const ps = await getPreparedGetUser();
  const [userRow] = await ps.query(db.runtime(), { id: userId });
  let user: User | null = (userRow as unknown as User) ?? null;

  if (user && !user.migrationCode) {
    const code = createMigrationCode();
    user = await db.orm.public.User.where({ id: userId }).update({ migrationCode: code });
  }

  if (user) {
    await recordUserIp(user.id, user.recentIps);
  }

  return user;
}

export function createMigrationCode(): string {
  const chars = sessionSettings.migrationCodeAlphabet;
  let code = sessionSettings.migrationCodePrefix;
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/onboarding");
  }

  if (user.suspendedAt) {
    redirect("/support-resources?suspended=1");
  }

  return user;
}

export function createAnonymousHandle(): string {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `Letter ${suffix}`;
}
