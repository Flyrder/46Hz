import { EmptyState } from "@/components/empty-state";
import { LetterCard } from "@/components/letter-card";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const letters = await prisma.letter.findMany({
    where: { authorId: user.id },
    include: {
      replies: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const ownReplies = await prisma.reply.findMany({
    where: { responderId: user.id },
    include: { letter: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return (
    <section className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_0.85fr]">
      <div>
        <h1 className="text-3xl font-semibold">{t("inbox.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("inbox.subtitle")}
        </p>
        <div className="mt-6 space-y-4">
          {letters.length === 0 ? (
            <EmptyState
              title={t("inbox.emptyLettersTitle")}
              body={t("inbox.emptyLettersBody")}
              href="/write"
              action={t("home.write")}
            />
          ) : (
            letters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} href={`/letters/${letter.id}`} t={t} />
            ))
          )}
        </div>
      </div>
      <aside>
        <h2 className="text-lg font-semibold">{t("inbox.sentReplies")}</h2>
        <div className="mt-4 space-y-3">
          {ownReplies.length === 0 ? (
            <EmptyState
              title={t("inbox.emptyRepliesTitle")}
              body={t("inbox.emptyRepliesBody")}
              href="/reply"
              action={t("inbox.findLetter")}
            />
          ) : (
            ownReplies.map((reply) => (
              <div key={reply.id} className="rounded-lg border border-border bg-surface p-4 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge tone={reply.status === "APPROVED" ? "good" : "neutral"}>
                    {t(`status.${reply.status}`)}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {t("inbox.replyContext", {
                    type: t(`replyType.${reply.letter.desiredReplyType}`).toLowerCase()
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </section>
  );
}
