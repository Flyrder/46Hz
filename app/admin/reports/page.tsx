import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, ArrowRight, User, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);

  const reports = await prisma.feedback.findMany({
    where: { reportReason: { not: null } },
    include: {
      reply: {
        include: {
          letter: true,
          responder: true
        }
      },
      fromUser: true
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <section className="mx-auto max-w-4xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.reportsTitle")}</h1>
              <StatusBadge tone={reports.length > 0 ? "warning" : "good"}>
                {t("admin.countUnit", { count: String(reports.length) })}
              </StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.reportsSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      <div className="space-y-3.5">
        {reports.map((report) => (
          <article
            key={report.id}
            className="rounded-2xl border border-border/80 bg-surface p-5 shadow-soft transition-all hover:border-accent/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <StatusBadge tone="warning">{t("admin.reportReceivedBadge")}</StatusBadge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(report.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5 text-accent" />
                <span>{t("admin.reporterPrefix")} {report.fromUser.anonymousHandle}</span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-xs text-danger block mb-1">{t("admin.reportReasonPrefix")}</span>
              {report.reportReason}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">
                {t("admin.replyAuthorPrefix")} {report.reply.responder.anonymousHandle} {t("admin.trustScoreSuffix", { score: String(report.reply.responder.trustScore) })}
              </span>
              <Link
                href={`/admin/replies/${report.replyId}`}
                className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
              >
                {t("admin.reviewReportedReplyAction")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}

        {reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/60 p-10 text-center text-sm text-muted-foreground shadow-soft">
            {t("admin.noReports")}
          </div>
        ) : null}
      </div>
    </section>
  );
}
