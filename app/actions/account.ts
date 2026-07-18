"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { defaultLocale, normalizeLocale } from "@/lib/i18n";
import { setLocalePreference, setThemePreference } from "@/lib/preferences";
import { createAnonymousHandle, getCurrentUser, setCurrentUserId } from "@/lib/session";
import { defaultThemePreference, normalizeThemePreference } from "@/lib/theme";
import { accountSchema, formValue } from "@/lib/validators";

/**
 * @deprecated Email and password registration is deprecated. Use Migration Code instead.
 */
export async function createAccountAction(formData: FormData): Promise<void> {
  const input = accountSchema.parse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    displayName: formValue(formData, "displayName")
  });
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { accountEmail: email } });

  if (existing) {
    redirect("/account?mode=create&error=exists");
  }

  const currentUser = await getCurrentUser();
  const passwordHash = await hashPassword(input.password);
  const displayName = input.displayName || currentUser?.anonymousHandle || createAnonymousHandle();

  const user = currentUser
    ? await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          accountEmail: email,
          passwordHash,
          displayName,
          anonymousHandle: displayName
        }
      })
    : await prisma.user.create({
        data: {
          accountEmail: email,
          passwordHash,
          displayName,
          anonymousHandle: displayName,
          language: defaultLocale,
          themePreference: defaultThemePreference,
          ageRange: "ADULT",
          preferredReplyType: "COMFORT"
        }
      });

  await setCurrentUserId(user.id);
  await setLocalePreference(normalizeLocale(user.language));
  await setThemePreference(normalizeThemePreference(user.themePreference));
  redirect("/settings");
}

/**
 * @deprecated Email and password sign-in is deprecated. Use Migration Code instead.
 */
export async function signInAction(formData: FormData): Promise<void> {
  const input = accountSchema.pick({ email: true, password: true }).parse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password")
  });

  const user = await prisma.user.findUnique({
    where: { accountEmail: input.email.toLowerCase() }
  });

  if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
    redirect("/account?mode=signin&error=invalid");
  }

  await setCurrentUserId(user.id);
  await setLocalePreference(normalizeLocale(user.language));
  await setThemePreference(normalizeThemePreference(user.themePreference));
  redirect("/write");
}
