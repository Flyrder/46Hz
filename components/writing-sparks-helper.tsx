"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight, Heart } from "lucide-react";
import { createTranslator, type Locale } from "@/lib/i18n";

interface WritingSparksHelperProps {
  locale: Locale;
  onSelectSpark: (text: string) => void;
}

export function WritingSparksHelper({
  locale,
  onSelectSpark
}: WritingSparksHelperProps) {
  const t = createTranslator(locale);
  const [selectedMood, setSelectedMood] = useState<string>("burnout");
  const [loading, setLoading] = useState(false);
  const [sparks, setSparks] = useState<Array<{ id: string; text: string; prompt: string }>>([]);
  const [tags, setTags] = useState<string[]>([]);

  const moodOptions = [
    { id: "burnout", label: t("write.aiSparksMoodBurnout") },
    { id: "anxious", label: t("write.aiSparksMoodAnxious") },
    { id: "lonely", label: t("write.aiSparksMoodLonely") },
    { id: "ashamed", label: t("write.aiSparksMoodAshamed") }
  ];

  async function handleFetchSparks() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/writing-sparks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood,
          language: locale
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSparks(data.sparks || []);
        setTags(data.suggestedEmotionTags || []);
      }
    } catch {
      // Gracefully silent; fallback will be handled by UI
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="region"
      aria-label={t("write.aiSparksTitle")}
      className="rounded-2xl border border-accent/25 bg-gradient-to-br from-surface to-accent/5 p-4 sm:p-5 shadow-2xs backdrop-blur-xs transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {t("write.aiSparksTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("write.aiSparksDesc")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFetchSparks}
          disabled={loading}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground shadow-xs transition-all hover:bg-accent/90 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              <span>{t("write.aiSparksLoading")}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("write.aiSparksGet")}</span>
            </>
          )}
        </button>
      </div>

      {/* Mood Selector Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {moodOptions.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMood(mood.id)}
              aria-pressed={isSelected}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all ${
                isSelected
                  ? "border border-accent bg-accent/15 font-medium text-foreground"
                  : "border border-border/80 bg-background/80 text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Heart className={`h-3 w-3 ${isSelected ? "text-accent" : "text-muted-foreground/60"}`} />
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sparks List */}
      {sparks.length > 0 && (
        <div className="mt-4 space-y-2.5 animate-in fade-in duration-200" aria-live="polite">
          {sparks.map((spark) => (
            <div
              key={spark.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/90 p-3.5 transition-all hover:border-accent/40 hover:shadow-2xs"
            >
              <div className="space-y-1">
                <span className="inline-block rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                  {spark.prompt}
                </span>
                <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-serif">
                  &ldquo;{spark.text}&rdquo;
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectSpark(spark.text)}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
              >
                <span>{t("write.aiSparksInsert")}</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ))}

          {tags.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>추천 감정 태그:</span>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
