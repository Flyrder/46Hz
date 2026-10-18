"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
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
    const updated = await db.orm.public.User.where((user) => user.id.eq(userId))
      .updateAndCount({ language: locale, themePreference: theme });
    if (!updated) {
      await clearCurrentUser();
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
}
