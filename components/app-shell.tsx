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
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/92 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
              E
            </span>
            <span>EKO</span>
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
            <div className="flex items-center gap-1">
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
      <main className="flex-1 py-8">{children}</main>
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
      className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      {children}
    </Link>
  );
}
