import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquareHeart, CheckCircle2, ShieldCheck, Flag } from "lucide-react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { ResonanceMeter } from "@/components/resonance-meter";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { shouldMaskLetterContent } from "@/lib/safety/routing";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function LetterDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { id } = await params;
  const letter = await prisma.letter.findFirst({
    where: {
      id,
      authorId: user.id
    },
    include: {
      replies: {
        where: { status: "APPROVED" },
        include: {
          feedback: {
            where: { fromUserId: user.id }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!letter) {
    notFound();
  }

  const maskContent = shouldMaskLetterContent(letter);

  return (
    <section className="mx-auto max-w-3xl py-2">
      {/* Top Back Link & Header */}
      <div className="mb-6">
        <Link
          href="/inbox"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("letter.backToInbox")}</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("letter.title")}</h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <time dateTime={new Date(letter.createdAt).toISOString()}>{formatDate(letter.createdAt)}</time>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge tone={letter.status === "APPROVED" ? "good" : "neutral"}>
            {t(`status.${letter.status}`)}
          </StatusBadge>
          <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
            {t(`status.${letter.riskLevel}`)}
          </StatusBadge>
          <StatusBadge tone="neutral">{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
          {letter.emotionTags.map((tag) => (
            <span key={tag} className="text-xs font-medium text-muted-foreground/80">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main Letter Card (Stationery Paper) */}
      <article className="stationery-paper p-6 sm:p-8">
        <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
          {maskContent ? t("letter.masked") : letter.processedText}
        </div>
      </article>

      {/* Schumann Resonance Meter */}
      {!maskContent ? (
        <div className="mt-6">
          <ResonanceMeter
            current={letter.replies.length}
            max={letter.maxReplies}
            letterId={letter.id}
            isAuthor={letter.authorId === user.id}
            t={t}
          />
        </div>
      ) : null}

      {/* Received Replies Section */}
      <div className="mt-10">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <MessageSquareHeart className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t("letter.approvedReplies")}
          </h2>
          <span className="ml-auto rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {letter.replies.length}
          </span>
        </div>

        <div className="mt-6 space-y-5">
          {maskContent ? (
            <EmptyState
              title={t("letter.noPeerRepliesTitle")}
              body={t("letter.noPeerRepliesBody")}
            />
          ) : null}

          {!maskContent && letter.replies.length === 0 ? (
            <EmptyState
              title={t("letter.noRepliesTitle")}
              body={t("letter.noRepliesBody")}
            />
          ) : null}

          {!maskContent
            ? letter.replies.map((reply) => (
                <article
                  key={reply.id}
                  className="rounded-2xl border border-border/85 bg-surface p-6 shadow-soft transition-all"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/85">
                      {t("letter.peerReplyTitle")}
                    </span>
                    <time dateTime={new Date(reply.createdAt).toISOString()}>{formatDate(reply.createdAt)}</time>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
                    {reply.coachedText}
                  </p>

                  {/* Feedback Section */}
                  {reply.feedback.length > 0 ? (
                    <div className="mt-5 flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2.5 text-xs font-medium text-accent">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{t("feedback.saved")}</span>
                    </div>
                  ) : (
                    <form action={submitFeedbackAction} className="mt-5 space-y-3.5 border-t border-border/60 pt-4">
                      <input type="hidden" name="replyId" value={reply.id} />
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("letter.replyFeedbackTitle")}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex items-center gap-2 rounded-xl border border-border/70 p-2.5 text-xs text-foreground cursor-pointer hover:bg-muted/30 transition-colors">
                          <input className="accent-accent h-4 w-4 rounded" name="feltUnderstood" type="checkbox" />
                          <span>{t("feedback.feltUnderstood")}</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-border/70 p-2.5 text-xs text-foreground cursor-pointer hover:bg-muted/30 transition-colors">
                          <input className="accent-accent h-4 w-4 rounded" name="helpful" type="checkbox" />
                          <span>{t("feedback.helpful")}</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-border/70 p-2.5 text-xs text-foreground cursor-pointer hover:bg-muted/30 transition-colors">
                          <input className="accent-accent h-4 w-4 rounded" name="tooJudgmental" type="checkbox" />
                          <span>{t("feedback.judgmental")}</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-border/70 p-2.5 text-xs text-foreground cursor-pointer hover:bg-muted/30 transition-colors">
                          <input className="accent-accent h-4 w-4 rounded" name="tooMuchAdvice" type="checkbox" />
                          <span>{t("feedback.tooMuchAdvice")}</span>
                        </label>
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1" htmlFor={`report-${reply.id}`}>
                          <Flag className="h-3 w-3" />
                          <span>{t("common.report")}</span>
                        </label>
                        <textarea
                          id={`report-${reply.id}`}
                          name="reportReason"
                          rows={2}
                          className="w-full rounded-xl border border-border/70 bg-background/50 p-3 text-xs leading-relaxed outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/20"
                          placeholder={t("common.optionalReason")}
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <SubmitButton variant="secondary">{t("feedback.save")}</SubmitButton>
                      </div>
                    </form>
                  )}
                </article>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
