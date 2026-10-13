import { themeSettings } from "@/settings";

export const themePreferences = themeSettings.supportedThemes;

export type ThemePreference = (typeof themePreferences)[number];

export const defaultThemePreference: ThemePreference = themeSettings.defaultTheme;

export const themeOptions: Array<{ value: ThemePreference; labelKey: string }> = [
  ...themeSettings.themeOptions
];

export function normalizeThemePreference(value: unknown): ThemePreference {
  return themePreferences.includes(value as ThemePreference)
    ? (value as ThemePreference)
    : defaultThemePreference;
}
