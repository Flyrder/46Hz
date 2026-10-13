import Link from "next/link";
import { ShieldCheck, HeartHandshake, AlertCircle, ArrowLeft } from "lucide-react";
import { cancelDraftLetterAction, confirmLetterAction } from "@/app/actions/letters";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { shouldShowSupportResources } from "@/lib/safety/routing";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReviewLetterPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { id } = await searchParams;
  const letter = id
    ? await prisma.letter.findFirst({
        where: {
          id,
          authorId: user.id,
          status: "DRAFT"
        }
      })
    : null;

  if (!letter) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-border/80 bg-surface p-8 shadow-soft text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("review.noDraftTitle")}</h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          {t("review.noDraftBody")}
        </p>
        <div className="mt-6">
          <Link href="/write" className={buttonVariants("secondary")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("nav.write")}
          </Link>
        </div>
      </section>
    );
  }

  const safetyRouted = shouldShowSupportResources(letter.riskLevel);

  return (
    <section className="mx-auto max-w-2xl py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("review.title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("review.aiDraftNotice")}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
            {t(`status.${letter.riskLevel}`)}
          </StatusBadge>
          <StatusBadge>{t(`status.${letter.status}`)}</StatusBadge>
          <StatusBadge tone="neutral">{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
          {letter.emotionTags.map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground/80 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {safetyRouted ? (
        <div className="mb-6 rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm leading-relaxed text-foreground shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-warning mb-1">
            <AlertCircle className="h-4.5 w-4.5" />
            <span>{t("review.supportNoticeTitle")}</span>
          </div>
          <p className="text-muted-foreground">{t("review.safetyRouted")}</p>
        </div>
      ) : null}

      <div className="stationery-paper p-6 sm:p-8">
        <form action={confirmLetterAction}>
          <input type="hidden" name="letterId" value={letter.id} />
          
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <label className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2" htmlFor="processedText">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>{t("review.editable")}</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {t("review.directlyEditable")}
            </span>
          </div>

          <textarea
            id="processedText"
            name="processedText"
            rows={12}
            required
            defaultValue={letter.processedText}
            className="mt-4 w-full resize-y rounded-xl border border-border/70 bg-background/50 p-4 sm:p-5 text-base leading-relaxed text-foreground outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25 break-words"
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
            <span className="text-xs text-muted-foreground">
              {safetyRouted ? t("review.supportConnected") : t("review.moderationNotice")}
            </span>
            <SubmitButton>
              {safetyRouted ? t("review.routeSupport") : t("review.submit")}
            </SubmitButton>
          </div>
        </form>

        <form action={cancelDraftLetterAction} className="mt-3">
          <input type="hidden" name="letterId" value={letter.id} />
          <button type="submit" className={buttonVariants("ghost")}>
            {t("common.cancel")}
          </button>
        </form>
      </div>
    </section>
  );
}
