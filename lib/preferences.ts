import { cookies } from "next/headers";
import { defaultLocale, normalizeLocale, type Locale } from "@/lib/i18n";
import {
  defaultThemePreference,
  normalizeThemePreference,
  type ThemePreference
} from "@/lib/theme";

export const LOCALE_COOKIE = "46hz_locale";
export const THEME_COOKIE = "46hz_theme";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365
};

export async function getLocalePreference(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? cookieStore.get("eko_locale")?.value;
  return normalizeLocale(raw ?? defaultLocale);
}

export async function getThemePreference(): Promise<ThemePreference> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(THEME_COOKIE)?.value ?? cookieStore.get("eko_theme")?.value;
  return normalizeThemePreference(raw ?? defaultThemePreference);
}

export async function setLocalePreference(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, cookieOptions);
}

export async function setThemePreference(theme: ThemePreference): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, theme, cookieOptions);
}
