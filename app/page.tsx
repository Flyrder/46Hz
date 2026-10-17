import Link from "next/link";
import {
  Inbox,
  PenLine,
  Waves,
  Clock,
  ShieldCheck,
  HeartHandshake,
  ArrowRight
} from "lucide-react";
import { ExitIsoIcon } from "@/components/exit-sign-emblem";
import { buttonVariants } from "@/components/ui/button";
import { createTranslator, type TranslationKey } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";
import { resonanceSettings, claimingSettings } from "@/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocalePreference()]);
  const t = createTranslator(locale);

  const steps: Array<{ titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      titleKey: "home.step1",
      descKey: "home.step1Desc"
    },
    {
      titleKey: "home.step2",
      descKey: "home.step2Desc"
    },
    {
      titleKey: "home.step3",
      descKey: "home.step3Desc"
    },
    {
      titleKey: "home.step4",
      descKey: "home.step4Desc"
    }
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="stationery-paper animate-entry relative overflow-hidden p-8 sm:p-12">
        {/* Subtle Ambient Background Gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-accent/6 blur-3xl"
        />

        <div className="relative max-w-2xl">
          {/* Schumann Frequency Ripple Badge */}
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent mb-6 select-none">
            <Waves className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            <span>{t("home.schumannBadge")}</span>
            <span className="text-accent/50" aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">
              {resonanceSettings.defaultMaxReplies}→{resonanceSettings.expandedMaxReplies} {t("home.resonanceCapSuffix")}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-[1.18]">
            {t("home.title")}
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
            {t("home.body")}
          </p>

          {/* Action Button Row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={user ? "/write" : "/onboarding"}
              className={buttonVariants("primary") + " shadow-sm text-base px-5 py-3"}
            >
              <PenLine className="h-4.5 w-4.5" aria-hidden="true" />
              <span>{t("home.write")}</span>
            </Link>

            <Link
              href="/inbox"
              className={buttonVariants("secondary") + " text-base px-5 py-3"}
            >
              <Inbox className="h-4.5 w-4.5" aria-hidden="true" />
              <span>{t("home.openInbox")}</span>
            </Link>

            <Link
              href="/reply"
              className={buttonVariants("ghost") + " text-sm text-muted-foreground hover:text-foreground"}
            >
              <HeartHandshake className="h-4 w-4 mr-1 text-accent" aria-hidden="true" />
              <span>{t("home.browseLetters")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core Philosophy Pillars */}
      <section aria-label={t("home.philosophyAriaLabel")} className="grid gap-5 md:grid-cols-3">
        {/* Pillar 1 */}
        <div className="stationery-card animate-entry p-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent mb-4">
            <Waves className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {t("home.pillar1Title")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("home.pillar1Desc")}
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="stationery-card animate-entry p-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent mb-4">
            <Clock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {t("home.pillar2Title")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("home.pillar2Desc")}
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="stationery-card animate-entry p-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {t("home.pillar3Title")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("home.pillar3Desc")}
          </p>
        </div>
      </section>

      {/* 4-Step Slow Journey */}
      <section className="stationery-paper animate-entry p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t("home.stepsTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("home.stepsSubtitle")}
            </p>
          </div>
          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {t("home.slowLoopBadge", { minutes: String(claimingSettings.leaseDurationMinutes) })}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => (
            <div
              key={item.titleKey}
              className="stationery-card relative bg-background/55 p-5 hover:bg-surface"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-accent text-xs font-bold text-accent-foreground">
                  {index + 1}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                  {t("home.stepBadge", { step: `0${index + 1}` })}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                {t(item.titleKey)}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {t(item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Gentle EXIT Crisis Care Banner */}
      <section className="stationery-card animate-entry border-emerald-600/25 bg-emerald-500/6 dark:border-emerald-400/25 dark:bg-emerald-500/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#16794B]/15 p-1.5 shadow-2xs">
            <ExitIsoIcon className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("home.crisisTitle")}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("home.crisisDesc")}
            </p>
          </div>
        </div>

        <Link
          href="/support-resources"
          className="shrink-0 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#16794B] px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-[#12633D] transition-all active:scale-98"
        >
          <ExitIsoIcon className="h-4 w-4 shrink-0" />
          <span className="text-box-trim">{t("home.crisisButton")}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
