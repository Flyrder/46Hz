import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference, getThemePreference } from "@/lib/preferences";

export const metadata: Metadata = {
  title: "46Hz Letterbox",
  description: "A quiet anonymous emotional support letterbox."
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
