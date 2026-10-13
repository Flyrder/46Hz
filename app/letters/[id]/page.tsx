import { notFound } from "next/navigation";
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
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">{t("letter.title")}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge tone={letter.status === "APPROVED" ? "good" : "neutral"}>
          {t(`status.${letter.status}`)}
        </StatusBadge>
        <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
          {t(`status.${letter.riskLevel}`)}
        </StatusBadge>
        <StatusBadge>{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
      </div>
      <article className="mt-5 rounded-lg border border-border bg-surface p-5 leading-7 shadow-soft">
        {maskContent
          ? t("letter.masked")
          : letter.processedText}
      </article>

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

      <h2 className="mt-8 text-xl font-semibold">{t("letter.approvedReplies")}</h2>
      <div className="mt-4 space-y-4">
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
        {!maskContent ? (
          letter.replies.map((reply) => (
            <article key={reply.id} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
              <div className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{reply.coachedText}</p>
              {reply.feedback.length > 0 ? (
                <p className="mt-4 text-sm text-accent">{t("feedback.saved")}</p>
              ) : (
                <form action={submitFeedbackAction} className="mt-5 space-y-3 border-t border-border pt-4">
                  <input type="hidden" name="replyId" value={reply.id} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="text-sm">
                      <input className="mr-2" name="feltUnderstood" type="checkbox" />
                      {t("feedback.feltUnderstood")}
                    </label>
                    <label className="text-sm">
                      <input className="mr-2" name="helpful" type="checkbox" />
                      {t("feedback.helpful")}
                    </label>
                    <label className="text-sm">
                      <input className="mr-2" name="tooJudgmental" type="checkbox" />
                      {t("feedback.judgmental")}
                    </label>
                    <label className="text-sm">
                      <input className="mr-2" name="tooMuchAdvice" type="checkbox" />
                      {t("feedback.tooMuchAdvice")}
                    </label>
                  </div>
                  <label className="block text-sm font-semibold" htmlFor={`report-${reply.id}`}>
                    {t("common.report")}
                  </label>
                  <textarea
                    id={`report-${reply.id}`}
                    name="reportReason"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder={t("common.optionalReason")}
                  />
                  <SubmitButton variant="secondary">{t("feedback.save")}</SubmitButton>
                </form>
              )}
            </article>
          ))
        ) : null}
      </div>
    </section>
  );
}
