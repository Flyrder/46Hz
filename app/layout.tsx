import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference, getThemePreference } from "@/lib/preferences";
import { brandSettings } from "@/settings";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#161b22" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: brandSettings.title,
    template: `%s | ${brandSettings.name}`
  },
  description: brandSettings.tagline,
  applicationName: brandSettings.name,
  keywords: [
    "46Hz",
    "slow letterbox",
    "emotional support",
    "anonymous letter",
    "healing",
    "barrier-free",
    "mental health",
    "Schumann resonance"
  ],
  authors: [{ name: "46Hz Project" }],
  creator: "46Hz Project",
  openGraph: {
    title: brandSettings.title,
    description: brandSettings.tagline,
    siteName: brandSettings.name,
    type: "website"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brandSettings.name
  }
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
