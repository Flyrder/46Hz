import Link from "next/link";
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
      <section className="mx-auto max-w-xl rounded-lg border border-border bg-surface p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">{t("review.noDraftTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("review.noDraftBody")}
        </p>
        <Link href="/write" className={buttonVariants("secondary") + " mt-5"}>
          {t("nav.write")}
        </Link>
      </section>
    );
  }

  const safetyRouted = shouldShowSupportResources(letter.riskLevel);

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold">{t("review.title")}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
          {t(`status.${letter.riskLevel}`)}
        </StatusBadge>
        <StatusBadge>{t(`status.${letter.status}`)}</StatusBadge>
        <StatusBadge>{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
      </div>
      {safetyRouted ? (
        <div className="mt-5 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-foreground">
          {t("review.safetyRouted")}
        </div>
      ) : null}
      <form action={confirmLetterAction} className="mt-6 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <input type="hidden" name="letterId" value={letter.id} />
        <label className="text-sm font-semibold" htmlFor="processedText">
          {t("review.editable")}
        </label>
        <textarea
          id="processedText"
          name="processedText"
          rows={14}
          required
          defaultValue={letter.processedText}
          className="mt-3 w-full resize-y rounded-lg border border-border bg-background p-4 text-base leading-7 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <SubmitButton>{safetyRouted ? t("review.routeSupport") : t("review.submit")}</SubmitButton>
        </div>
      </form>
      <form action={cancelDraftLetterAction} className="mt-3">
        <input type="hidden" name="letterId" value={letter.id} />
        <SubmitButton variant="ghost">{t("common.cancel")}</SubmitButton>
      </form>
    </section>
  );
}
