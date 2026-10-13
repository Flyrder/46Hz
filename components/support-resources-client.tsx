"use client";

import { useMemo, useState } from "react";
import {
  Phone,
  PhoneCall,
  Globe,
  ExternalLink,
  Clock,
  Heart,
  Search,
  Filter
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { SupportResource } from "@prisma/client";
import type { CrisisHotline } from "@/lib/resources";

type SupportResourcesClientProps = {
  resources: SupportResource[];
  hotlines: CrisisHotline[];
  t: (key: string, replacements?: Record<string, string>) => string;
  isRoutedNotice?: boolean;
};

export function SupportResourcesClient({
  resources,
  hotlines,
  t,
  isRoutedNotice
}: SupportResourcesClientProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedLang, setSelectedLang] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Region filter: Strictly Korea and Mainland China
      if (selectedRegion === "KR") {
        if (!res.region.toUpperCase().includes("KR") && !res.region.includes("대한민국")) return false;
      } else if (selectedRegion === "CN") {
        if (!res.region.toUpperCase().includes("CN") && !res.region.includes("중국") && !res.region.includes("中国")) return false;
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
  }, [resources, selectedRegion, selectedLang, searchQuery]);

  return (
    <div className="space-y-8">
      {/* 24/7 Immediate Emergency Hotlines Section */}
      <section
        aria-labelledby="emergency-hotlines-title"
        className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 shadow-tactile"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="emergency-hotlines-title" className="text-xl font-bold tracking-tight text-foreground">
                {t("resources.emergencyBannerTitle")}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>{t("resources.emergency247Badge")}</span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>비밀 보장 · 통화료 무료 / 免费隐私保障</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {t("resources.emergencyBannerSubtitle")}
        </p>

        {/* Rapid Call Hotlines Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hotlines.map((hotline) => (
            <article
              key={hotline.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all ${
                hotline.isPrimary
                  ? "border-rose-500/50 bg-surface/90 shadow-soft ring-1 ring-rose-500/20"
                  : "border-border/80 bg-surface/80 hover:border-accent/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-accent tracking-wide">{hotline.regionLabel}</span>
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {hotline.hours}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-foreground">{hotline.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
                  {hotline.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50">
                <a
                  href={`tel:${hotline.tel}`}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-soft transition-transform active:scale-[0.98] hover:opacity-95"
                  aria-label={`${hotline.title} ${hotline.number} ${t("resources.callDirectly")}`}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>{hotline.number}</span>
                  <span className="text-xs font-normal opacity-90">({t("resources.callDirectly")})</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section aria-labelledby="all-resources-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="all-resources-title" className="text-xl font-bold tracking-tight text-foreground">
              {t("resources.title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5" aria-live="polite">
              {t("resources.showingCount", { count: String(filteredResources.length) })}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("resources.searchPlaceholder")}
              className="w-full min-h-[44px] rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              aria-label={t("resources.searchPlaceholder")}
            />
          </div>
        </div>

        {/* Region & Language Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" />
            지역:
          </span>
          <button
            type="button"
            onClick={() => setSelectedRegion("ALL")}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedRegion === "ALL"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("resources.filterAll")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedRegion("KR")}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedRegion === "KR"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("resources.filterKR")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedRegion("CN")}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedRegion === "CN"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("resources.filterCN")}
          </button>

          <span className="text-xs font-semibold text-muted-foreground ml-3 mr-1">언어:</span>
          <button
            type="button"
            onClick={() => setSelectedLang("ALL")}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedLang === "ALL"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("resources.filterLangAll")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("ko")}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedLang === "ko"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            한국어
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("zh")}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedLang === "zh"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang("en")}
            className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedLang === "en"
                ? "bg-accent text-accent-foreground shadow-soft"
                : "border border-border bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            English
          </button>
        </div>

        {/* Resources Cards Stream */}
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-5 shadow-soft transition-all hover:border-accent/40 hover:shadow-tactile"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                  <h3 className="text-base font-bold tracking-tight text-foreground">{resource.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge tone="neutral">{resource.region}</StatusBadge>
                    <StatusBadge tone="neutral">{resource.language.toUpperCase()}</StatusBadge>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {resource.description}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/50 pt-3 text-xs">
                {resource.phone ? (
                  <a
                    href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent/10 px-3.5 py-2 font-bold text-accent transition-colors hover:bg-accent/20"
                    aria-label={`${resource.title} 전화 걸기 ${resource.phone}`}
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{resource.phone}</span>
                  </a>
                ) : null}

                {resource.url ? (
                  <a
                    href={resource.url}
                    rel="noreferrer"
                    target="_blank"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 font-semibold text-muted-foreground transition-colors hover:border-accent/30 hover:text-foreground"
                    aria-label={`${resource.title} 웹사이트 방문`}
                  >
                    <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t("resources.website")}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </article>
          ))}

          {filteredResources.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border/80 bg-surface/50 p-10 text-center text-sm text-muted-foreground">
              <p>{t("resources.empty")}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedRegion("ALL");
                  setSelectedLang("ALL");
                  setSearchQuery("");
                }}
                className="mt-3 inline-flex min-h-[36px] items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                필터 초기화
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
