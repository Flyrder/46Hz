import { notFound } from "next/navigation";
import { moderateReplyAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { Sparkles, FileText, Mail, User, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReplyDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { id } = await params;
  const reply = await prisma.reply.findUnique({
    where: { id },
    include: {
      letter: true,
      responder: true
    }
  });

  if (!reply) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.replyReviewTitle")}</h1>
          <p className="mt-1 text-xs text-muted-foreground font-mono">ID: {reply.id}</p>
        </div>
      </div>

      <AdminNav role={role} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Reply Content Article */}
        <article className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <StatusBadge>{t(`status.${reply.status}` as const)}</StatusBadge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(reply.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5 text-accent" />
              <span className="font-medium text-foreground">{reply.responder.anonymousHandle}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                {t("admin.trustScorePrefix")} {reply.responder.trustScore}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              {t("admin.coachedReplySection")}
            </h2>
            <div className="mt-2.5 font-letter rounded-xl border border-border/80 bg-background/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {reply.coachedText}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t("admin.rawReplySection")}
            </h2>
            <div className="mt-2.5 font-letter rounded-xl border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {reply.rawText}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-accent" />
              {t("admin.letterContextSection")}
            </h2>
            <div className="mt-2.5 font-letter rounded-xl border border-border/60 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {reply.letter.processedText}
            </div>
          </div>
        </article>

        {/* Moderation Actions Form */}
        <div>
          <form action={moderateReplyAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
            <h2 className="text-base font-bold text-foreground">{t("admin.replyModerationTitle")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.replyModerationDesc")}
            </p>

            <input type="hidden" name="replyId" value={reply.id} />

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-foreground" htmlFor="status">
                  {t("admin.statusSelectLabel")}
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={reply.status}
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="PENDING">{t("admin.statusPending")}</option>
                  <option value="APPROVED">{t("admin.replyStatusApproved")}</option>
                  <option value="REJECTED">{t("admin.statusRejected")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground" htmlFor="reason">
                  {t("admin.reasonLabel")}
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  placeholder={t("admin.replyReasonPlaceholder")}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="mt-5">
              <SubmitButton>{t("admin.saveModeration")}</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
