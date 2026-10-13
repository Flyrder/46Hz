import { expandLetterResonanceAction } from "@/app/actions/letters";
import { SubmitButton } from "@/components/ui/submit-button";
import { Waves, Sparkles, CheckCircle2 } from "lucide-react";

interface ResonanceMeterProps {
  current: number;
  max: number;
  letterId?: string;
  isAuthor?: boolean;
  t: (key: string, values?: Record<string, string>) => string;
}

export function ResonanceMeter({
  current,
  max,
  letterId,
  isAuthor = false,
  t
}: ResonanceMeterProps) {
  const isFulfilled = current >= max;
  const isExpanded = max >= 15;
  const clampedCurrent = Math.min(current, max);

  return (
    <section
      role="region"
      aria-label={t("resonance.title")}
      className="rounded-xl border border-border/80 bg-surface p-5 shadow-soft"
    >
      {/* Header with Title and Harmonics Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Waves className="h-5 w-5 text-accent animate-pulse" aria-hidden="true" />
          <span>{t("resonance.title")}</span>
        </div>

        <div className="flex items-center gap-2">
          {isFulfilled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t("resonance.fulfilledBadge")}
            </span>
          ) : isExpanded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("resonance.expandedBadge")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              7th Harmonic
            </span>
          )}

          <span className="text-xs font-semibold text-foreground">
            {t("resonance.meterLabel", { current: String(clampedCurrent), max: String(max) })}
          </span>
        </div>
      </div>

      {/* Schumann Harmonic Frequency Nodes (7 or 15) with accessible progressbar */}
      <div
        className="mt-4"
        role="progressbar"
        aria-label={`${t("resonance.title")}: ${clampedCurrent}/${max}`}
        aria-valuenow={clampedCurrent}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${clampedCurrent} of ${max} harmonic replies received`}
      >
        <div className="flex items-center justify-between gap-1 sm:gap-1.5">
          {Array.from({ length: max }).map((_, index) => {
            const isFilled = index < current;
            const isCurrentNode = index === current;

            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-1 group"
                title={`Resonance Harmonic ${index + 1}`}
                aria-hidden="true"
              >
                <div
                  className={`h-2.5 w-full rounded-full transition-all duration-300 ${
                    isFilled
                      ? "bg-accent shadow-xs"
                      : isCurrentNode
                      ? "bg-accent/40 ring-2 ring-accent/30 animate-pulse"
                      : "bg-muted/80 border border-border/50"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground/70 hidden sm:inline select-none">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story & Philosophy Note */}
      <p className="mt-3.5 text-xs leading-5 text-muted-foreground">
        {t("resonance.schumannNote")}
      </p>

      {/* Status Description with Live Region */}
      <div
        className="mt-2 text-xs text-foreground/80 leading-5"
        role="status"
        aria-live="polite"
      >
        {isFulfilled
          ? t("resonance.fulfilledDesc")
          : isExpanded
          ? t("resonance.expandedDesc")
          : t("resonance.defaultDesc")}
      </div>

      {/* Author Explicit Opt-in Expansion Button */}
      {isAuthor && !isExpanded && letterId && (
        <form action={expandLetterResonanceAction} className="mt-4 pt-3 border-t border-border/70">
          <input type="hidden" name="letterId" value={letterId} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              46Hz (7차) → 15차 심층 공명
            </span>
            <SubmitButton variant="secondary">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {t("resonance.expandButton")}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}
