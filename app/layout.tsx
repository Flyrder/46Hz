import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { createTranslator, I18nProvider } from "@/lib/i18n";
import { getLocalePreference, getThemePreference } from "@/lib/preferences";
import { ensureSettingsLoadedFromDisk } from "@/lib/settings-store";
import { brandSettings } from "@/settings";

const nanumSquareRound = localFont({
  src: [
    { path: "../fonts/NanumSquareRoundOTFL.otf", weight: "300", style: "normal" },
    { path: "../fonts/NanumSquareRoundOTFR.otf", weight: "400", style: "normal" },
    { path: "../fonts/NanumSquareRoundOTFB.otf", weight: "700", style: "normal" },
    { path: "../fonts/NanumSquareRoundOTFEB.otf", weight: "800", style: "normal" }
  ],
  variable: "--font-ui",
  display: "swap"
});

const maruBuri = localFont({
  src: [
    { path: "../fonts/MaruBuri-ExtraLight.otf", weight: "200", style: "normal" },
    { path: "../fonts/MaruBuri-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/MaruBuri-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/MaruBuri-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../fonts/MaruBuri-Bold.otf", weight: "700", style: "normal" }
  ],
  variable: "--font-letter",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#161b22" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover"
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
  ensureSettingsLoadedFromDisk();
  const [locale, theme] = await Promise.all([getLocalePreference(), getThemePreference()]);
  const t = createTranslator(locale);

  return (
    <html
      lang={locale.replace("_", "-")}
      className={`theme-${theme} ${nanumSquareRound.variable} ${maruBuri.variable}`}
      suppressHydrationWarning
    >
      <body>
        <I18nProvider locale={locale}>
          <AppShell locale={locale} theme={theme} t={t}>
            {children}
          </AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
