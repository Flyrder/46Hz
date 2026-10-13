import { dictionaries, koKR, enUS, zhCN } from "@/locales";
import { defaultLocale, locales } from "./config";
import type { Locale, TranslationKey, Translations } from "./types";

export * from "./types";
export * from "./config";
export { dictionaries, koKR, enUS, zhCN };

export function normalizeLocale(value: unknown): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export function translate(
  locale: Locale,
  key: string,
  replacements: Record<string, string> = {}
): string {
  const dictionary = dictionaries[locale] as Record<string, string>;
  const fallback = dictionaries[defaultLocale] as Record<string, string>;
  const template = dictionary[key] ?? fallback[key] ?? key;

  return Object.entries(replacements).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, value),
    template
  );
}

export function createTranslator(locale: Locale) {
  return (key: string, replacements?: Record<string, string>) =>
    translate(locale, key, replacements);
}
