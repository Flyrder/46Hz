import { type Locale, type LocaleOption, locales } from "./types";

export { locales, type Locale, type LocaleOption };

/**
 * 默认语言配置为韩语 (ko_KR)
 */
export const defaultLocale: Locale = "ko_KR";

export const localeOptions: LocaleOption[] = [
  { value: "ko_KR", label: "한국어" },
  { value: "en_US", label: "English" },
  { value: "zh_CN", label: "简体中文" }
];
