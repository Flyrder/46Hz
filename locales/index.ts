import { koKR } from "./ko_KR";
import { enUS } from "./en_US";
import { zhCN } from "./zh_CN";
import type { Locale, Translations } from "@/lib/i18n/types";

export const dictionaries: Record<Locale, Translations> = {
  ko_KR: koKR,
  en_US: enUS,
  zh_CN: zhCN
};

export { koKR, enUS, zhCN };
