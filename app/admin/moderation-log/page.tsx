import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { History, Calendar, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModerationLogPage() {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);

  const events = await prisma.moderationEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <History className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.logTitle")}</h1>
              <StatusBadge tone="neutral">{t("admin.countUnit", { count: String(events.length) })}</StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.logSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} />

      <div className="space-y-3">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-border/80 bg-surface p-4.5 shadow-soft transition-all hover:border-accent/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <StatusBadge tone="neutral">{event.targetType.toUpperCase()}</StatusBadge>
                <StatusBadge tone="neutral">{event.action}</StatusBadge>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3" />
                {formatDate(event.createdAt)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                {event.previousStatus ?? t("admin.logInitialStatus")}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="rounded bg-accent/15 px-2 py-0.5 font-bold text-accent">
                {event.newStatus ?? t("admin.logUnspecifiedStatus")}
              </span>
            </div>

            {event.reason ? (
              <p className="mt-2 text-xs leading-relaxed text-foreground bg-muted/20 rounded-lg p-2.5 border border-border/40">
                <strong className="text-muted-foreground font-semibold">{t("admin.logReasonPrefix")} </strong>
                {event.reason}
              </p>
            ) : null}

            <p className="mt-2 text-[11px] font-mono text-muted-foreground">
              {t("admin.logTargetIdPrefix")} {event.targetId}
            </p>
          </article>
        ))}

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/60 p-10 text-center text-sm text-muted-foreground shadow-soft">
            {t("admin.noLogs")}
          </div>
        ) : null}
      </div>
    </section>
  );
}
