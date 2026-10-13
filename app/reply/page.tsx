import { HeartHandshake } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LetterCard } from "@/components/letter-card";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";
import { findAvailableReplyLetters } from "@/lib/reply/claiming";

export const dynamic = "force-dynamic";

export default async function ReplyOpportunitiesPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const letters = await findAvailableReplyLetters(user.id, 6);

  return (
    <section className="mx-auto max-w-3xl py-2">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-3 select-none">
          <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("reply.poolTitle")}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("reply.opportunitiesTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("reply.opportunitiesSubtitle")}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {letters.length === 0 ? (
          <EmptyState
            title={t("reply.noLettersTitle")}
            body={t("reply.noLettersBody")}
          />
        ) : (
          letters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              href={`/reply/${letter.id}`}
              mode="responder"
              t={t}
            />
          ))
        )}
      </div>
    </section>
  );
}
