import { ShieldAlert, HeartHandshake } from "lucide-react";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { DEFAULT_CRISIS_HOTLINES } from "@/lib/resources";
import { SupportResourcesClient } from "@/components/support-resources-client";

export const dynamic = "force-dynamic";

export default async function SupportResourcesPage({
  searchParams
}: {
  searchParams: Promise<{ routed?: string; suspended?: string }>;
}) {
  const [locale, params] = await Promise.all([getLocalePreference(), searchParams]);
  const t = createTranslator(locale);
  const resources = await prisma.supportResource.findMany({
    where: { active: true },
    orderBy: [{ region: "asc" }, { language: "asc" }, { title: "asc" }]
  });

  const isRouted = Boolean(params.routed || params.suspended);

  return (
    <section className="mx-auto max-w-4xl py-4 sm:py-6">
      {/* Header Banner */}
      <header className="mb-8 rounded-3xl border border-border/80 bg-surface/80 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 select-none">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("resources.helplineBadge")}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent select-none">
            <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
            <span>온기 안심 보호 네트워크</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("resources.title")}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base max-w-3xl">
          {isRouted ? t("resources.highRiskNotice") : t("resources.intro")}
        </p>

        {isRouted ? (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-800 dark:text-rose-200">
            손을 뻗으면 닿을 수 있는 전문 상담사들이 24시간 언제나 당신의 이야기를 들을 준비가 되어 있습니다.
          </div>
        ) : null}
      </header>

      {/* Main Support Resources Workbench */}
      <SupportResourcesClient
        resources={resources}
        hotlines={DEFAULT_CRISIS_HOTLINES}
        t={t}
        isRoutedNotice={isRouted}
      />
    </section>
  );
}
