import Link from "next/link";
import { Inbox, PenLine, Settings, ShieldCheck, Waves, HeartHandshake, ShieldAlert } from "lucide-react";
import { PreferenceForm } from "@/components/preference-form";
import { localeOptions, type Locale } from "@/lib/i18n";
import { themeOptions, type ThemePreference } from "@/lib/theme";

export function AppShell({
  children,
  locale,
  theme,
  t
}: {
  children: React.ReactNode;
  locale: Locale;
  theme: ThemePreference;
  t: (key: string) => string;
}) {
  const skipLabel = t("shell.skipToContent");
  const brandTagline = t("shell.tagline");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-16 pt-3 sm:px-6 lg:px-8">
      {/* Skip to Main Content Link for Screen Readers (TalkBack / VoiceOver / Narrator) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-accent-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        {skipLabel}
      </a>

      {/* Sticky Header with Frosted Glass */}
      <header
        role="banner"
        className="sticky top-0 z-30 -mx-4 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-md transition-colors sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        <nav
          aria-label="Main Navigation"
          className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3"
        >
          {/* Logo & Brand Identity */}
          <Link
            href="/"
            aria-label="46Hz Home"
            className="group flex min-h-[44px] items-center gap-2.5 text-sm font-semibold rounded-xl pr-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="grid h-8.5 w-8.5 place-items-center rounded-xl bg-accent text-accent-foreground shadow-xs transition-transform group-hover:scale-105 active:scale-95">
              <Waves className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">46Hz</span>
              <span className="text-[10px] font-normal text-muted-foreground/80 leading-none hidden sm:inline">
                {brandTagline}
              </span>
            </div>
          </Link>

          {/* Controls & Nav Icons */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PreferenceForm
              locale={locale}
              theme={theme}
              localeLabel={t("language.label")}
              themeLabel={t("theme.label")}
              localeOptions={localeOptions}
              themeOptions={themeOptions.map((option) => ({
                value: option.value,
                label: t(option.labelKey)
              }))}
            />

            <div
              className="flex items-center gap-1 border-l border-border/60 pl-2"
              role="toolbar"
              aria-label="Navigation actions"
            >
              <NavIcon href="/write" label={t("nav.write")}>
                <PenLine className="h-4.5 w-4.5" aria-hidden="true" />
              </NavIcon>
              <NavIcon href="/inbox" label={t("nav.inbox")}>
                <Inbox className="h-4.5 w-4.5" aria-hidden="true" />
              </NavIcon>
              <NavIcon href="/settings" label={t("nav.settings")}>
                <Settings className="h-4.5 w-4.5" aria-hidden="true" />
              </NavIcon>
              <NavIcon href="/admin" label={t("nav.admin")}>
                <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
              </NavIcon>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 py-8 outline-none">
        {children}
      </main>

      {/* Barrier-Free Quiet Footer */}
      <footer
        role="contentinfo"
        className="mt-16 border-t border-border/70 pt-8 text-xs text-muted-foreground"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Waves className="h-3.5 w-3.5 text-accent" />
              <span>46Hz · Schumann Resonance Slow Letterbox</span>
            </div>
            <p className="max-w-md text-muted-foreground/80 leading-relaxed text-[11px]">
              {t("shell.footerDesc")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link
              href="/support-resources"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500/80" />
              <span>{t("shell.crisisLink")}</span>
            </Link>
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              {t("nav.settings")}
            </Link>
            <span className="text-border" aria-hidden="true">·</span>
            <span className="text-[11px] text-muted-foreground/70">
              Barrier-Free A11y · Zero PII
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavIcon({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="grid min-h-[44px] min-w-[44px] place-items-center rounded-xl text-muted-foreground transition-all duration-150 hover:bg-muted/70 hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {children}
    </Link>
  );
}
