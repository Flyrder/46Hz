import { notFound } from "next/navigation";
import { ReplyComposer } from "@/components/reply-composer";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { isPeerMatchable } from "@/lib/safety/routing";
import { requireUser } from "@/lib/session";

import Link from "next/link";
import { releaseReplyClaimAction } from "@/app/actions/replies";
import { claimLetterForReply, CLAIM_LEASE_MINUTES } from "@/lib/reply/claiming";

import { PenLine, Inbox, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReplyLetterPage({
  params
}: {
  params: Promise<{ letterId: string }>;
}) {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { letterId } = await params;
  const letter = await prisma.letter.findUnique({
    where: { id: letterId }
  });

  if (
    !letter ||
    letter.authorId === user.id ||
    !isPeerMatchable({ status: letter.status, riskLevel: letter.riskLevel })
  ) {
    notFound();
  }

  const claimResult = await claimLetterForReply(letter.id, user.id);

  if (!claimResult.ok) {
    if (claimResult.reason === "LOCKED_BY_ANOTHER") {
      return (
        <section className="mx-auto max-w-xl py-12">
          <div className="rounded-2xl border border-border/80 bg-surface p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent">
              <PenLine className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {t("reply.reservedByOtherTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-md mx-auto">
              {t("reply.reservedByOtherDesc", { minutes: String(CLAIM_LEASE_MINUTES) })}
            </p>
            <div className="mt-6">
              <Link
                href="/reply"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                {t("reply.browseOtherLetters")}
              </Link>
            </div>
          </div>
        </section>
      );
    }

    if (claimResult.reason === "ALREADY_REPLIED") {
      return (
        <section className="mx-auto max-w-xl py-12">
          <div className="rounded-2xl border border-border/80 bg-surface p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent">
              <Inbox className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {t("reply.alreadyRepliedTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-md mx-auto">
              {t("reply.alreadyRepliedDesc")}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/inbox"
                className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                {t("reply.inboxLink")}
              </Link>
              <Link
                href="/reply"
                className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
              >
                {t("reply.browseOtherLetters")}
              </Link>
            </div>
          </div>
        </section>
      );
    }

    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">{t("reply.title")}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge tone="good">
            {t("reply.reservedForYou", { minutes: String(CLAIM_LEASE_MINUTES) })}
          </StatusBadge>
          <form action={releaseReplyClaimAction}>
            <input type="hidden" name="letterId" value={letter.id} />
            <button
              type="submit"
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {t("reply.skipClaim")}
            </button>
          </form>
        </div>
      </div>
      <article className="mt-5 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <StatusBadge>{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
          {letter.emotionTags.map((tag) => (
            <StatusBadge key={tag}>{tag}</StatusBadge>
          ))}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{letter.processedText}</p>
      </article>

      <div className="mt-5 rounded-lg border border-border bg-surface p-5 text-sm leading-6 text-muted-foreground shadow-soft">
        {t("reply.guidance")}
      </div>

      <div className="mt-6">
        <ReplyComposer
          letterId={letter.id}
          labels={{
            coach: t("reply.coach"),
            coachSuggestions: t("reply.coachSuggestions"),
            finalReply: t("reply.final"),
            flags: t("reply.flags"),
            placeholder: t("reply.placeholder"),
            send: t("reply.send"),
            startOver: t("reply.startOver"),
            yourReply: t("reply.yourReply")
          }}
        />
      </div>
    </section>
  );
}
