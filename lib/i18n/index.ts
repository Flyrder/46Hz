import { enUS } from "./locales/en_US";
import { koKR } from "./locales/ko_KR";
import { zhCN } from "./locales/zh_CN";
import { defaultLocale, locales } from "./config";
import type { Locale, TranslationKey, Translations } from "./types";

export * from "./types";
export * from "./config";
export { koKR, enUS, zhCN };

const dictionaries: Record<Locale, Translations> = {
  ko_KR: koKR,
  en_US: enUS,
  zh_CN: zhCN
};

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
