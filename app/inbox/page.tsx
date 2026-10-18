import Link from "next/link";
import { Inbox, Send, PenLine, CheckCircle2, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LetterCard } from "@/components/letter-card";
import { StatusBadge } from "@/components/status-badge";
import { db } from "@/lib/db";
import { letterPreview } from "@/lib/db/queries";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InboxPage({
  searchParams
}: {
  searchParams?: Promise<{ deleted?: string; submitted?: string }>;
}) {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { deleted, submitted } = (await searchParams) ?? {};

  const [letters, ownReplies] = await Promise.all([
    db.orm.public.Letter
      .with(letterPreview)
      .where({ authorId: user.id })
      .include("replies", (replies) => replies.where({ status: "APPROVED" }).count())
      .orderBy((letter) => letter.createdAt.desc())
      .all(),
    db.orm.public.Reply
      .select("id", "letterId", "status", "coachedText", "createdAt")
      .where({ responderId: user.id })
      .include("letter", (letter) => letter.select("desiredReplyType"))
      .orderBy((reply) => reply.createdAt.desc())
      .limit(10)
      .all()
  ]);

  return (
    <div className="mx-auto max-w-4xl py-2">
      {/* Toast Notification Banners */}
      {deleted && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-border/80 bg-surface p-4 text-xs font-medium text-foreground shadow-xs animate-in fade-in"
        >
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>{t("letter.deleteSuccess")}</span>
        </div>
      )}

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-border/80 bg-surface p-4 text-xs font-medium text-foreground shadow-xs animate-in fade-in"
        >
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>{t("letter.submitSuccess")}</span>
        </div>
      )}

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
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
              <Link
                key={reply.id}
                href={`/letters/${reply.letterId}`}
                className="group block rounded-2xl border border-border/85 bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-tactile active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge tone="neutral">{t("inbox.othersLetter")}</StatusBadge>
                    <StatusBadge tone={reply.status === "APPROVED" ? "good" : "neutral"}>
                      {t(`status.${reply.status}`)}
                    </StatusBadge>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t("inbox.replyContext", {
                    type: t(`replyType.${reply.letter?.desiredReplyType ?? "COMFORT"}`).toLowerCase()
                  })}
                </p>
                <p className="mt-2 font-letter text-xs leading-relaxed text-foreground/80 font-normal line-clamp-2 break-words">
                  {reply.coachedText}
                </p>
                <div className="mt-3 flex items-center justify-end gap-1 text-[11px] font-semibold text-accent opacity-90 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <span>{t("inbox.viewOthersLetterAndReplies")}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </Link>
            ))
          )}
        </div>
      </aside>
    </section>
  </div>
  );
}
