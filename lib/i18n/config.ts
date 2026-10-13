import { i18nSettings } from "@/settings";
import { type Locale, type LocaleOption, locales } from "./types";

export { locales, type Locale, type LocaleOption };

/**
 * 默认语言配置为韩语 (ko_KR)
 */
export const defaultLocale: Locale = i18nSettings.defaultLocale;

export const localeOptions: LocaleOption[] = [...i18nSettings.localeOptions];
