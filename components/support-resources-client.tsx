"use client";

import { useMemo, useState } from "react";
import {
  Phone,
  Globe,
  ExternalLink,
  Clock,
  Heart,
  Search,
  Filter,
  Wind,
  Radio,
  Sparkles
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { ExitIsoIcon } from "@/components/exit-sign-emblem";
import type { SupportResource } from "@prisma/client";
import type { CrisisHotline } from "@/lib/resources";
import { useI18n, createTranslator, type Locale } from "@/lib/i18n";

type SupportResourcesClientProps = {
  resources: SupportResource[];
  hotlines: CrisisHotline[];
  locale?: Locale;
  t?: (key: string, replacements?: Record<string, string>) => string;
  isRoutedNotice?: boolean;
  enableChinaSupportInfo?: boolean;
};

export function SupportResourcesClient({
  resources,
  hotlines,
  locale: propLocale,
  t: customT,
  enableChinaSupportInfo = false
}: SupportResourcesClientProps) {
  const { t: contextT } = useI18n();
  const t = customT || (propLocale ? createTranslator(propLocale) : contextT);

  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedLang, setSelectedLang] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [breathingOpen, setBreathingOpen] = useState<boolean>(false);

  const filteredHotlines = useMemo(() => {
    const base = enableChinaSupportInfo
      ? hotlines
      : hotlines.filter((h) => h.region !== "CN");

    if (selectedRegion === "ALL") return base;
    return base.filter((h) => h.region === selectedRegion);
  }, [hotlines, selectedRegion, enableChinaSupportInfo]);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const isChinaResource =
        res.region.toUpperCase().includes("CN") ||
        res.region.includes("중국") ||
        res.region.includes("中国");

      // Respect Admin Settings toggle for China Mainland support info
      if (!enableChinaSupportInfo && isChinaResource) {
        return false;
      }

      // Region filter: Strictly Korea and Mainland China
      if (selectedRegion === "KR") {
        if (!res.region.toUpperCase().includes("KR") && !res.region.includes("대한민국")) return false;
      } else if (selectedRegion === "CN") {
        if (!isChinaResource) return false;
      }

      // Language filter
      if (selectedLang !== "ALL") {
        if (!res.language.toLowerCase().startsWith(selectedLang.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = res.title.toLowerCase().includes(query);
        const matchDesc = res.description.toLowerCase().includes(query);
        const matchPhone = res.phone?.toLowerCase().includes(query);
        const matchRegion = res.region.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchPhone && !matchRegion) return false;
      }

      return true;
    });
  }, [resources, selectedRegion, selectedLang, searchQuery, enableChinaSupportInfo]);

  const exitSteps = [
    {
      step: "EXIT 01",
      title: t("resources.exitStep1Title"),
      desc: t("resources.exitStep1Desc"),
      icon: Wind
    },
    {
      step: "EXIT 02",
      title: t("resources.exitStep2Title"),
      desc: t("resources.exitStep2Desc"),
      icon: Radio
    },
    {
      step: "EXIT 03",
      title: t("resources.exitStep3Title"),
      desc: t("resources.exitStep3Desc"),
      icon: Sparkles
    }
  ];

  return (
    <div className="space-y-7 sm:space-y-9">
      {/* 3-Step <EXIT> Action Guide & Calming 4-7-8 Breathing Grounding Box */}
      <section
        aria-label={t("resources.exitGuideAria")}
        className="stationery-paper animate-entry p-5 sm:p-7"
      >
        <div className="grid gap-3.5 sm:grid-cols-3">
          {exitSteps.map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              className="stationery-card flex flex-col justify-between bg-background/60 p-4 sm:p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#16794B]/12 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-[#16794B] dark:bg-emerald-500/15 dark:text-emerald-300">
                    <span className="text-box-trim">{step}</span>
                  </span>
                  <Icon className="h-4 w-4 text-[#16794B] dark:text-emerald-400" aria-hidden="true" />
                </div>
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                  {title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive 4-7-8 Breathing Stabilizer Toggle */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-600/25 bg-emerald-500/6 px-4 py-3 dark:border-emerald-400/25 dark:bg-emerald-500/10">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground">
            <ExitIsoIcon className="h-5 w-5 shrink-0" />
            <span>{t("resources.exitBreathPrompt")}</span>
          </div>
          <button
            type="button"
            onClick={() => setBreathingOpen((prev) => !prev)}
            aria-expanded={breathingOpen}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-[#16794B]/35 bg-surface px-4 py-2 text-xs font-bold text-[#16794B] dark:text-emerald-300 transition-all hover:bg-[#16794B]/10 active:scale-[0.98]"
          >
            <Wind className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-box-trim">
              {breathingOpen ? t("resources.exitBreathStop") : t("resources.exitBreathStart")}
            </span>
          </button>
        </div>

        {breathingOpen ? (
          <div
            role="region"
            aria-live="polite"
            className="animate-entry mt-4 flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-6 text-center"
          >
            <div className="exit-beacon-pulse grid h-20 w-20 place-items-center rounded-2xl bg-[#16794B] text-white shadow-md">
              <ExitIsoIcon className="h-12 w-12" />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground">
              {t("resources.exitBreathPattern")}
            </p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
              {t("resources.exitBreathPrompt")}
            </p>
          </div>
        ) : null}
      </section>

      {/* 24/7 Immediate Emergency EXIT Hotlines Section */}
      <section
        aria-labelledby="emergency-hotlines-title"
        className="animate-entry rounded-3xl border border-emerald-600/30 bg-gradient-to-b from-emerald-500/10 via-surface to-surface p-5 sm:p-8 shadow-tactile dark:border-emerald-500/30"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#16794B]/15 p-1.5 shadow-2xs">
              <ExitIsoIcon className="h-8 w-8" />
            </span>
            <div>
              <h2 id="emergency-hotlines-title" className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
                {t("resources.emergencyBannerTitle")}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3.5 w-3.5 text-[#16794B] dark:text-emerald-400" aria-hidden="true" />
                <span>{t("resources.emergency247Badge")}</span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/12 px-3.5 py-1.5 text-xs font-bold text-[#146C43] dark:border-emerald-400/30 dark:text-emerald-300">
            <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            <span className="text-box-trim">{t("resources.privacyFreeBadge")}</span>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {t("resources.emergencyBannerSubtitle")}
        </p>

        {/* Rapid Call Hotlines Grid */}
        <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHotlines.map((hotline) => {
            const hotlineTitle = hotline.titleKey ? t(hotline.titleKey) : hotline.title;
            const hotlineRegionLabel = hotline.regionLabelKey ? t(hotline.regionLabelKey) : hotline.regionLabel;
            const hotlineHours = hotline.hoursKey ? t(hotline.hoursKey) : hotline.hours;
            const hotlineDesc = hotline.descriptionKey ? t(hotline.descriptionKey) : hotline.description;

            return (
              <article
                key={hotline.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all ${
                  hotline.isPrimary
                    ? "border-[#16794B]/60 bg-surface shadow-soft ring-2 ring-[#16794B]/20 dark:border-emerald-400/50 dark:ring-emerald-400/20"
                    : "border-border/85 bg-surface/90 hover:border-[#16794B]/45 hover:shadow-tactile"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16794B]/10 px-2.5 py-0.5 text-xs font-bold text-[#16794B] dark:bg-emerald-500/15 dark:text-emerald-300">
                      <span className="text-box-trim">{hotlineRegionLabel}</span>
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {hotlineHours}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground">{hotlineTitle}</h3>
                    {hotline.isPrimary ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#16794B] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                        {t("resources.exitPrimaryBadge")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
                    {hotlineDesc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <a
                    href={`tel:${hotline.tel}`}
                    className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold shadow-soft transition-all active:scale-[0.98] ${
                      hotline.isPrimary
                        ? "bg-[#16794B] text-white hover:bg-[#12633D]"
                        : "bg-accent text-accent-foreground hover:opacity-95"
                    }`}
                    aria-label={`${hotlineTitle} ${hotline.number} ${t("resources.callDirectly")}`}
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="text-box-trim">{hotline.number}</span>
                    <span className="text-xs font-medium opacity-90 text-box-trim">
                      ({t("resources.callDirectly")})
                    </span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section aria-labelledby="all-resources-title" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="all-resources-title" className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {t("resources.directoryTitle")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5" aria-live="polite">
              {t("resources.showingCount", { count: String(filteredResources.length) })}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("resources.searchPlaceholder")}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-base sm:text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              aria-label={t("resources.searchPlaceholder")}
            />
          </div>
        </div>

        {/* Region & Language Filter Chips - Mobile Smooth Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap">
          {enableChinaSupportInfo ? (
            <>
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                {t("resources.filterRegionLabel")}
              </span>
              <button
                type="button"
                onClick={() => setSelectedRegion("ALL")}
                className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  selectedRegion === "ALL"
                    ? "bg-[#16794B] text-white shadow-soft"
                    : "border border-border bg-surface text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-box-trim">{t("resources.filterAll")}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion("KR")}
                className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  selectedRegion === "KR"
                    ? "bg-[#16794B] text-white shadow-soft"
                    : "border border-border bg-surface text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-box-trim">{t("resources.filterKR")}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion("CN")}
                className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  selectedRegion === "CN"
                    ? "bg-[#16794B] text-white shadow-soft"
                    : "border border-border bg-surface text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-box-trim">{t("resources.filterCN")}</span>
              </button>
            </>
          ) : null}

          <span className={`text-xs font-semibold text-muted-foreground shrink-0 mr-1 ${enableChinaSupportInfo ? "ml-3" : ""}`}>
            {t("resources.filterLangLabel")}
          </span>
          <button
            type="button"
            onClick={() => setSelectedLang("ALL")}
            className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              selectedLang === "ALL"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-box-trim">{t("resources.filterLangAll")}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("ko")}
            className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              selectedLang === "ko"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-box-trim">{t("common.langKo")}</span>
          </button>
          {enableChinaSupportInfo ? (
            <button
              type="button"
              onClick={() => setSelectedLang("zh")}
              className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedLang === "zh"
                  ? "bg-accent text-accent-foreground shadow-soft"
                  : "border border-border bg-surface text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="text-box-trim">{t("common.langZh")}</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setSelectedLang("en")}
            className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              selectedLang === "en"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-box-trim">{t("common.langEn")}</span>
          </button>
        </div>

        {/* Resources Cards Stream */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 shadow-soft transition-all hover:border-[#16794B]/45 hover:shadow-tactile"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground">{resource.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge tone="neutral">{resource.region}</StatusBadge>
                    <StatusBadge tone="neutral">{resource.language.toUpperCase()}</StatusBadge>
                  </div>
                </div>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {resource.description}
                </p>
              </div>

              <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 sm:gap-3 border-t border-border/50 text-xs">
                {resource.phone ? (
                  <a
                    href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#16794B]/12 px-3.5 py-2 font-bold text-[#16794B] dark:bg-emerald-500/15 dark:text-emerald-300 transition-colors hover:bg-[#16794B]/20 active:scale-98"
                    aria-label={`${resource.title} ${t("resources.callAction")} ${resource.phone}`}
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-box-trim">{resource.phone}</span>
                  </a>
                ) : null}

                {resource.url ? (
                  <a
                    href={resource.url}
                    rel="noreferrer"
                    target="_blank"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 font-semibold text-muted-foreground transition-colors hover:border-accent/30 hover:text-foreground active:scale-98"
                    aria-label={`${resource.title} ${t("resources.visitWebsiteAction")}`}
                  >
                    <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="text-box-trim">{t("resources.website")}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </article>
          ))}

          {filteredResources.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-surface/50 p-8 sm:p-10 text-center text-sm text-muted-foreground">
              <p>{t("resources.empty")}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion("ALL");
                  setSelectedLang("ALL");
                  setSearchQuery("");
                }}
                className="mt-3 inline-flex min-h-[44px] items-center rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                <span className="text-box-trim">{t("resources.resetFilter")}</span>
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
