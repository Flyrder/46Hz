import { ShieldAlert, Phone, Globe } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";

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
    orderBy: [{ language: "asc" }, { region: "asc" }, { title: "asc" }]
  });

  return (
    <section className="mx-auto max-w-3xl py-2">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3 select-none">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>{t("resources.helplineBadge")}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("resources.title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {params.routed || params.suspended ? t("resources.highRiskNotice") : t("resources.intro")}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {resources.map((resource) => (
          <article
            key={resource.id}
            className="rounded-2xl border border-border/85 bg-surface p-6 shadow-soft transition-all hover:border-accent/40 hover:shadow-tactile"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <h2 className="text-base font-bold tracking-tight text-foreground">{resource.title}</h2>
              <div className="flex items-center gap-1.5">
                <StatusBadge tone="neutral">{resource.region}</StatusBadge>
                <StatusBadge tone="neutral">{resource.language}</StatusBadge>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-border/50">
              {resource.phone ? (
                <a
                  href={`tel:${resource.phone.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex min-h-[44px] items-center gap-1.5 font-bold text-accent hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{resource.phone}</span>
                </a>
              ) : null}

              {resource.url ? (
                <a
                  href={resource.url}
                  rel="noreferrer"
                  target="_blank"
                  className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{t("resources.website")}</span>
                </a>
              ) : null}
            </div>
          </article>
        ))}

        {resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/60 p-8 text-center text-sm text-muted-foreground">
            {t("resources.empty")}
          </div>
        ) : null}
      </div>
    </section>
  );
}
