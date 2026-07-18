import { enUS, type TranslationKey } from "@/lib/i18n/en_US";
import { koKR } from "@/lib/i18n/ko_KR";
import { zhCN } from "@/lib/i18n/zh_CN";

export const locales = ["en_US", "ko_KR", "zh_CN"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en_US";

export const localeOptions: Array<{ value: Locale; label: string }> = [
  { value: "en_US", label: "English" },
  { value: "ko_KR", label: "한국어" },
  { value: "zh_CN", label: "简体中文" }
];

const dictionaries = {
  en_US: enUS,
  ko_KR: koKR,
  zh_CN: zhCN
} satisfies Record<Locale, Record<TranslationKey, string>>;

export type { TranslationKey };

export function normalizeLocale(value: unknown): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export function translate(locale: Locale, key: string, replacements: Record<string, string> = {}): string {
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
