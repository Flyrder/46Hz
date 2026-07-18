"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { normalizeLocale } from "@/lib/i18n";
import { setLocalePreference, setThemePreference } from "@/lib/preferences";
import { getCurrentUserId, clearCurrentUser } from "@/lib/session";
import { normalizeThemePreference } from "@/lib/theme";
import { formValue } from "@/lib/validators";

export async function updatePreferencesAction(formData: FormData): Promise<void> {
  const locale = normalizeLocale(formValue(formData, "locale"));
  const theme = normalizeThemePreference(formValue(formData, "theme"));

  await setLocalePreference(locale);
  await setThemePreference(theme);

  const userId = await getCurrentUserId();
  if (userId) {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (userExists) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          language: locale,
          themePreference: theme
        }
      });
    } else {
      await clearCurrentUser();
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
}
