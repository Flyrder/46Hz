import { HeartHandshake, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LetterCard } from "@/components/letter-card";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";
import { findAvailableReplyLetters } from "@/lib/reply/claiming";
import { getAiMiddleware } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function ReplyOpportunitiesPage() {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const letters = await findAvailableReplyLetters(user.id, 8);

  const ai = getAiMiddleware();
  let recommendedIds = new Set<string>();
  let matchReasons: Record<string, string> = {};

  if (letters.length > 0) {
    try {
      const matchResult = await ai.matchResonantLetters({
        responderPreference: user.preferredReplyType,
        language: locale,
        availableLetters: letters.map((l) => ({
          id: l.id,
          emotionTags: [...(l.emotionTags ?? [])],
          situationTags: [...(l.situationTags ?? [])],
          desiredReplyType: l.desiredReplyType
        }))
      });
      recommendedIds = new Set(matchResult.recommendedLetterIds);
      matchReasons = matchResult.matchReasons;
    } catch {
      // In case of error, continue without badges
    }
  }

  // Sort letters so that recommended resonance matches appear prominently first
  const sortedLetters = [...letters].sort((a, b) => {
    const aRec = recommendedIds.has(a.id) ? 1 : 0;
    const bRec = recommendedIds.has(b.id) ? 1 : 0;
    return bRec - aRec;
  });

  return (
    <section className="mx-auto max-w-3xl py-2">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent select-none">
            <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("reply.poolTitle")}</span>
          </div>
          {recommendedIds.size > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400 select-none">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              <span>{t("reply.aiResonanceRecommended")}</span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("reply.opportunitiesTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("reply.opportunitiesSubtitle")}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {sortedLetters.length === 0 ? (
          <EmptyState
            title={t("reply.noLettersTitle")}
            body={t("reply.noLettersBody")}
          />
        ) : (
          sortedLetters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              href={`/reply/${letter.id}`}
              mode="responder"
              isResonanceRecommended={recommendedIds.has(letter.id)}
              resonanceReason={matchReasons[letter.id]}
              t={t}
            />
          ))
        )}
      </div>
    </section>
  );
}
