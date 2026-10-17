import { dictionaries, koKR, enUS, zhCN } from "@/locales";
import { defaultLocale, locales } from "./config";
import type { Locale, TranslationKey, Translations } from "./types";

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

export function formatTag(
  tag: string,
  t: (key: string, replacements?: Record<string, string>) => string
): string {
  const clean = tag.replace(/^#+/, "").trim();
  if (!clean) return tag;
  const slug = clean.toLowerCase().replace(/[\s-]+/g, "_");
  const key = `tag.${slug}`;
  const translated = t(key);
  return translated !== key ? translated : clean;
}

export function formatToneFlag(
  flag: string,
  t: (key: string, replacements?: Record<string, string>) => string
): string {
  const clean = flag.trim();
  if (!clean) return flag;
  const slug = clean.toLowerCase().replace(/[\s-]+/g, "_");
  const key = `flag.${slug}`;
  const translated = t(key);
  return translated !== key ? translated : clean;
}

