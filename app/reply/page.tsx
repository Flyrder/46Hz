import { EmptyState } from "@/components/empty-state";
import { LetterCard } from "@/components/letter-card";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReplyOpportunitiesPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const letters = await prisma.letter.findMany({
    where: {
      authorId: { not: user.id },
      status: "APPROVED",
      riskLevel: "NORMAL",
      replies: {
        none: {
          responderId: user.id
        }
      }
    },
    orderBy: { createdAt: "asc" },
    take: 6
  });

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">{t("reply.opportunitiesTitle")}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("reply.opportunitiesSubtitle")}
      </p>
      <div className="mt-6 space-y-4">
        {letters.length === 0 ? (
          <EmptyState
            title={t("reply.noLettersTitle")}
            body={t("reply.noLettersBody")}
          />
        ) : (
          letters.map((letter) => (
            <LetterCard key={letter.id} letter={letter} href={`/reply/${letter.id}`} mode="responder" t={t} />
          ))
        )}
      </div>
    </section>
  );
}
