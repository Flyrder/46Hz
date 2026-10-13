import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference, getThemePreference } from "@/lib/preferences";

import { brandSettings } from "@/settings";

export const metadata: Metadata = {
  title: brandSettings.title,
  description: brandSettings.tagline
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, theme] = await Promise.all([getLocalePreference(), getThemePreference()]);
  const t = createTranslator(locale);

  return (
    <html lang={locale.replace("_", "-")} className={`theme-${theme}`} suppressHydrationWarning>
      <body>
        <AppShell locale={locale} theme={theme} t={t}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
