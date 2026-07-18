import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "eko_admin";

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    redirect("/admin");
  }
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
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
}

export function getAdminPasscode(): string {
  return process.env.ADMIN_PASSCODE ?? "local-admin";
}
