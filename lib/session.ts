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

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId }
  });
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
