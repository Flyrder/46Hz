import Link from "next/link";
import { Inbox, PenLine, Settings, ShieldCheck, UserRound } from "lucide-react";
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
  const skipLabel =
    locale === "ko_KR"
      ? "본문으로 건너뛰기"
      : locale === "zh_CN"
      ? "跳至主要内容"
      : "Skip to main content";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      {/* Skip to Main Content Link for Screen Readers (TalkBack / VoiceOver / Narrator) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-accent-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {skipLabel}
      </a>

      <header
        role="banner"
        className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/92 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        <nav
          aria-label="Main Navigation"
          className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3"
        >
          <Link
            href="/"
            aria-label="46Hz Home"
            className="flex min-h-[44px] items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-lg pr-2"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
              46
            </span>
            <span>46Hz</span>
          </Link>
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
            <div className="flex items-center gap-1" role="toolbar" aria-label="Navigation actions">
              <NavIcon href="/write" label={t("nav.write")}>
                <PenLine className="h-4 w-4" aria-hidden="true" />
              </NavIcon>
              <NavIcon href="/inbox" label={t("nav.inbox")}>
                <Inbox className="h-4 w-4" aria-hidden="true" />
              </NavIcon>
              <NavIcon href="/settings" label={t("nav.settings")}>
                <Settings className="h-4 w-4" aria-hidden="true" />
              </NavIcon>
              <NavIcon href="/admin" label={t("nav.admin")}>
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </NavIcon>
            </div>
          </div>
        </nav>
      </header>
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 py-8 outline-none">
        {children}
      </main>
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
      className="grid min-h-[44px] min-w-[44px] place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      {children}
    </Link>
  );
}
