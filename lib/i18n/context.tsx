"use client";

import React, { createContext, useContext, useMemo } from "react";
import { createTranslator } from "./translator";
import { defaultLocale } from "./config";
import type { Locale } from "./types";

export interface I18nContextValue {
  locale: Locale;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  t: createTranslator(defaultLocale)
});

export function I18nProvider({
  locale,
  children
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    return {
      locale,
      t: createTranslator(locale)
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
