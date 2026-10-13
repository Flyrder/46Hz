import { Inbox, Send, PenLine } from "lucide-react";
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
      },
      _count: {
        select: { replies: { where: { status: "APPROVED" } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const ownReplies = await prisma.reply.findMany({
    where: { responderId: user.id },
    include: { letter: true },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <section className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1.15fr_0.85fr] py-2">
      {/* Left Column: My Letters */}
      <div>
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
            <Inbox className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t("inbox.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("inbox.subtitle")}</p>
          </div>
          <span className="ml-auto rounded-full bg-muted/70 px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {letters.length}
          </span>
        </div>

        <div className="space-y-4">
          {letters.length === 0 ? (
            <EmptyState
              title={t("inbox.emptyLettersTitle")}
              body={t("inbox.emptyLettersBody")}
              href="/write"
              action={t("home.write")}
            />
          ) : (
            letters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                href={`/letters/${letter.id}`}
                t={t}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Column: Sent Replies */}
      <aside>
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Send className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-foreground">{t("inbox.sentReplies")}</h2>
          <span className="ml-auto rounded-full bg-muted/70 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {ownReplies.length}
          </span>
        </div>

        <div className="space-y-3.5">
          {ownReplies.length === 0 ? (
            <EmptyState
              title={t("inbox.emptyRepliesTitle")}
              body={t("inbox.emptyRepliesBody")}
              href="/reply"
              action={t("inbox.findLetter")}
            />
          ) : (
            ownReplies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-2xl border border-border/85 bg-surface p-5 shadow-xs transition-all hover:border-accent/30 hover:shadow-tactile"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2.5">
                  <StatusBadge tone={reply.status === "APPROVED" ? "good" : "neutral"}>
                    {t(`status.${reply.status}`)}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t("inbox.replyContext", {
                    type: t(`replyType.${reply.letter.desiredReplyType}`).toLowerCase()
                  })}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/80 font-normal line-clamp-2 break-words">
                  {reply.coachedText}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </section>
  );
}
