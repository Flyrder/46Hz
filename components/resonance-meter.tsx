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

// Empirical Earth-Ionosphere Schumann Resonance Modes (accounting for ionospheric conductivity & damping).
// Resonant peaks are not a linear arithmetic multiple (7.83 * n), but non-linear standing wave peaks
// where Mode 7 naturally settles at ~45.9Hz (approx 46Hz).
export const SCHUMANN_HARMONICS = [
  "7.8Hz",
  "14.3Hz",
  "20.8Hz",
  "27.3Hz",
  "33.8Hz",
  "39.0Hz",
  "45.9Hz",
  "52.4Hz",
  "58.9Hz",
  "65.4Hz",
  "71.9Hz",
  "78.4Hz",
  "84.9Hz",
  "91.4Hz",
  "97.9Hz"
] as const;

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
      className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft transition-all"
    >
      {/* Header with Title and Harmonics Count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-foreground font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
            <Waves className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base tracking-tight">{t("resonance.title")}</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground hidden sm:inline">
              {t("resonance.frequencySubtitle")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFulfilled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t("resonance.fulfilledBadge")}
            </span>
          ) : isExpanded ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t("resonance.expandedBadge")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {t("resonance.capBadge")}
            </span>
          )}

          <span className="rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-semibold text-foreground">
            {t("resonance.meterLabel", { current: String(clampedCurrent), max: String(max) })}
          </span>
        </div>
      </div>

      {/* Schumann Harmonic Frequency Nodes with Accessible Progressbar */}
      <div
        className="mt-5"
        role="progressbar"
        aria-label={`${t("resonance.title")}: ${clampedCurrent}/${max}`}
        aria-valuenow={clampedCurrent}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={t("resonance.progressAria", { current: String(clampedCurrent), max: String(max) })}
      >
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {Array.from({ length: max }).map((_, index) => {
            const isFilled = index < current;
            const isCurrentNode = index === current && !isFulfilled;
            const freqLabel = SCHUMANN_HARMONICS[index] || `${index + 1}H`;

            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-1.5 group select-none"
                title={`Resonance Harmonic ${index + 1} (${freqLabel})`}
                aria-hidden="true"
              >
                <div
                  className={`h-3 w-full rounded-full transition-all duration-300 ${
                    isFilled
                      ? "bg-accent shadow-xs"
                      : isCurrentNode
                      ? "bg-accent/40 ring-2 ring-accent/40 schumann-pulse"
                      : "bg-muted/70 border border-border/40"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground/60 hidden sm:inline tracking-tighter">
                  {freqLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story & Philosophy Note */}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {t("resonance.schumannNote")}
      </p>

      {/* Status Description with Live Region */}
      <div
        className="mt-2 text-xs leading-relaxed text-foreground/85"
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
        <form action={expandLetterResonanceAction} className="mt-4 pt-4 border-t border-border/60">
          <input type="hidden" name="letterId" value={letterId} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {t("resonance.expandNote")}
            </span>
            <SubmitButton variant="secondary">
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {t("resonance.expandButton")}
            </SubmitButton>
          </div>
        </form>
      )}
    </section>
  );
}
