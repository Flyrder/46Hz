import { Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { DEFAULT_CRISIS_HOTLINES } from "@/lib/resources";
import { ensureSettingsLoadedFromDisk } from "@/lib/settings-store";
import { SupportResourcesClient } from "@/components/support-resources-client";
import { ExitHeroEmblem } from "@/components/exit-sign-emblem";

export const dynamic = "force-dynamic";

export default async function SupportResourcesPage({
  searchParams
}: {
  searchParams: Promise<{ routed?: string; suspended?: string }>;
}) {
  const [locale, params] = await Promise.all([getLocalePreference(), searchParams]);
  const t = createTranslator(locale);
  const { enableChinaSupportInfo } = ensureSettingsLoadedFromDisk();

  const resources = await prisma.supportResource.findMany({
    where: { active: true },
    orderBy: [{ region: "asc" }, { language: "asc" }, { title: "asc" }]
  });

  const isRouted = Boolean(params.routed || params.suspended);

  return (
    <section className="mx-auto max-w-4xl py-3 sm:py-6">
      {/* EXIT (<엑시트>) Illuminated Emergency Beacon Hero Banner */}
      <header className="animate-entry relative mb-8 overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-[#0A2619] via-[#113C28] to-[#081F15] p-6 sm:p-9 text-emerald-50 shadow-paper">
        {/* Ambient Emergency Exit Lightbox Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl"
        />

        <div className="relative grid gap-7 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
          {/* Left Column: EXIT Copywriting, SOS Signal & Rapid Action */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              {t("resources.title")}
            </h1>

            <p className="mt-1.5 text-xs font-medium tracking-wide text-emerald-300/90">
              {t("resources.exitSlogan")}
            </p>

            <p className="mt-3.5 text-xs leading-relaxed text-emerald-50/85 sm:text-sm">
              {isRouted ? t("resources.highRiskNotice") : t("resources.intro")}
            </p>

            {/* Rapid 1-Tap Emergency Exit Direct Call Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="tel:109"
                className="exit-beacon-pulse inline-flex min-h-[48px] items-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition-all hover:bg-emerald-400 active:scale-[0.98]"
                aria-label={`${t("resources.regionKR")} 109 ${t("resources.callDirectly")}`}
              >
                <Phone className="h-4 w-4 fill-current" aria-hidden="true" />
                <span className="text-box-trim">109 · {t("resources.callDirectly")}</span>
              </a>

              {enableChinaSupportInfo ? (
                <a
                  href="tel:4001619995"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-emerald-400/40 bg-white/10 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
                  aria-label={`${t("resources.regionCN")} 400-161-9995 ${t("resources.callDirectly")}`}
                >
                  <Phone className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  <span className="text-box-trim">{t("resources.quickCallCN")}</span>
                </a>
              ) : (
                <a
                  href="tel:1393"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-emerald-400/40 bg-white/10 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
                  aria-label={`${t("resources.regionKR")} 1393 ${t("resources.callDirectly")}`}
                >
                  <Phone className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  <span className="text-box-trim">{t("resources.quickCall1393")}</span>
                </a>
              )}
            </div>

            {isRouted ? (
              <div
                role="status"
                className="mt-5 rounded-2xl border border-amber-400/40 bg-amber-500/15 p-4 text-xs sm:text-sm font-medium text-amber-100"
              >
                {t("resources.supportCounselorAvailableNotice")}
              </div>
            ) : null}
          </div>

          {/* Right Column: Slanted "EXIT" + International Emergency Exit Pictogram under T */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-400/25 bg-black/20 p-4 sm:p-6 backdrop-blur-xs">
            <ExitHeroEmblem className="w-full max-w-[310px]" />
          </div>
        </div>
      </header>

      {/* Main EXIT Support Resources Interactive Workbench */}
      <SupportResourcesClient
        resources={resources}
        hotlines={DEFAULT_CRISIS_HOTLINES}
        locale={locale}
        isRoutedNotice={isRouted}
        enableChinaSupportInfo={enableChinaSupportInfo}
      />
    </section>
  );
}
