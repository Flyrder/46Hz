import { notFound } from "next/navigation";
import Link from "next/link";
import { PenLine, Inbox, Clock, Waves, Sparkles, HeartHandshake, ArrowLeft } from "lucide-react";
import { ReplyComposer } from "@/components/reply-composer";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { isPeerMatchable } from "@/lib/safety/routing";
import { requireUser } from "@/lib/session";
import { releaseReplyClaimAction } from "@/app/actions/replies";
import { claimLetterForReply, CLAIM_LEASE_MINUTES } from "@/lib/reply/claiming";
import { buttonVariants } from "@/components/ui/button";

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
        <section className="mx-auto max-w-xl py-8">
          <div className="rounded-3xl border border-border/85 bg-surface p-8 sm:p-10 text-center shadow-soft">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent/10 text-accent">
              <PenLine className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("reply.reservedByOtherTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
              {t("reply.reservedByOtherDesc", { minutes: String(CLAIM_LEASE_MINUTES) })}
            </p>
            <div className="mt-8">
              <Link
                href="/reply"
                className={buttonVariants("primary")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("reply.browseOtherLetters")}
              </Link>
            </div>
          </div>
        </section>
      );
    }

    if (claimResult.reason === "ALREADY_REPLIED") {
      return (
        <section className="mx-auto max-w-xl py-8">
          <div className="rounded-3xl border border-border/85 bg-surface p-8 sm:p-10 text-center shadow-soft">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Inbox className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("reply.alreadyRepliedTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
              {t("reply.alreadyRepliedDesc")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/inbox"
                className={buttonVariants("primary")}
              >
                {t("reply.inboxLink")}
              </Link>
              <Link
                href="/reply"
                className={buttonVariants("secondary")}
              >
                {t("reply.browseOtherLetters")}
              </Link>
            </div>
          </div>
        </section>
      );
    }

    if (claimResult.reason === "RESONANCE_LIMIT_REACHED") {
      return (
        <section className="mx-auto max-w-xl py-8">
          <div className="rounded-3xl border border-border/85 bg-surface p-8 sm:p-10 text-center shadow-soft">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Waves className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("reply.resonanceFullTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
              {t("reply.resonanceFullDesc")}
            </p>
            <div className="mt-8">
              <Link
                href="/reply"
                className={buttonVariants("primary")}
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
    <section className="mx-auto max-w-3xl py-2">
      {/* Top Header with 15-Min Holding Lease Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("reply.title")}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "ko_KR"
              ? "서두르지 않고 당신의 속도대로 따뜻한 답장을 적어주세요."
              : locale === "zh_CN"
              ? "按照您的步调，写下一封满怀温情的回信。"
              : "Take your time and write a gentle, heartfelt reply."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge tone="good">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {t("reply.reservedForYou", { minutes: String(CLAIM_LEASE_MINUTES) })}
          </StatusBadge>
          <form action={releaseReplyClaimAction}>
            <input type="hidden" name="letterId" value={letter.id} />
            <button
              type="submit"
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {t("reply.skipClaim")}
            </button>
          </form>
        </div>
      </div>

      {/* The Letter Content (Stationery Paper Card) */}
      <article className="mt-6 stationery-paper p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
          <StatusBadge tone="neutral">{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
          {letter.emotionTags.map((tag) => (
            <span key={tag} className="text-xs font-medium text-muted-foreground/80">
              #{tag}
            </span>
          ))}
          {letter.situationTags.length > 0 && (
            <span className="text-xs text-muted-foreground/60 hidden sm:inline">
              · {letter.situationTags.join(", ")}
            </span>
          )}
        </div>

        <div className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
          {letter.processedText}
        </div>
      </article>

      {/* Reply Guidance Banner */}
      <div className="mt-5 rounded-2xl border border-border/80 bg-surface/70 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-muted-foreground shadow-2xs backdrop-blur-xs flex items-start gap-3">
        <HeartHandshake className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p>{t("reply.guidance")}</p>
      </div>

      {/* Reply Composer with AI Coaching */}
      <div className="mt-6">
        <ReplyComposer
          letterId={letter.id}
          locale={locale}
          labels={{
            coach: t("reply.coach"),
            coachSuggestions: t("reply.coachSuggestions"),
            finalReply: t("reply.final"),
            flags: t("reply.flags"),
            placeholder: t("reply.placeholder"),
            send: t("reply.send"),
            startOver: t("reply.startOver"),
            yourReply: t("reply.yourReply"),
            draftEncouragement: t("reply.draftEncouragement"),
            aiHint: t("reply.aiHint"),
            coachEditableNote: t("reply.coachEditableNote")
          }}
        />
      </div>
    </section>
  );
}
