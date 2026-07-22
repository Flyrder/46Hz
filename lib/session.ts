import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const USER_COOKIE = "eko_user_id";

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
    maxAge: 60 * 60 * 24 * 180
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

  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (user && !user.migrationCode) {
    const code = createMigrationCode();
    user = await prisma.user.update({
      where: { id: userId },
      data: { migrationCode: code }
    });
  }

  if (user) {
    await recordUserIp(user.id);
  }

  return user;
}

export function createMigrationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EKO-";
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
