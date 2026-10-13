"use client";

import { useState } from "react";
import { PenLine, Sparkles, Shield, Heart } from "lucide-react";
import { processLetterAction } from "@/app/actions/letters";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTranslator, type Locale } from "@/lib/i18n";

const PROMPT_INSPIRATIONS: Record<Locale, string[]> = {
  ko_KR: [
    "요즘 혼자 삼켜야 했던 이야기",
    "누구에게도 털어놓지 못했던 속마음",
    "충고 대신 그저 묵묵한 위로가 필요할 때",
    "오늘 하루 지친 내 마음에게"
  ],
  zh_CN: [
    "最近独自承受的那些心绪",
    "从未对人诉说的心里话",
    "不需要说教，只想被静静倾听",
    "给今天疲惫的自己的一封信"
  ],
  en_US: [
    "Words I've kept to myself lately",
    "Feelings that felt too heavy to carry alone",
    "Just wanting to be heard without unsolicited advice",
    "A quiet letter to my tired self today"
  ]
};

export function LetterEditor({
  locale,
  labels
}: {
  locale: Locale;
  labels: {
    title: string;
    subtitle: string;
    label: string;
    placeholder: string;
    review: string;
  };
}) {
  const [text, setText] = useState("");
  const t = createTranslator(locale);
  const minLength = 40;
  // Unicode-safe and whitespace-aware character counting
  const currentLength = [...text.trim()].length;
  const isSatisfied = currentLength >= minLength;

  const prompts = PROMPT_INSPIRATIONS[locale] || PROMPT_INSPIRATIONS.en_US;

  function handleSelectPrompt(prompt: string) {
    if (!text.trim()) {
      setText(`${prompt}...\n\n`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Emotional Reflection Sparks */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-2xs backdrop-blur-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>{t("write.sparks")}</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSelectPrompt(prompt)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-foreground/85 transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-foreground active:scale-95"
            >
              <Heart className="h-3 w-3 text-accent/70" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Stationery Paper Form */}
      <form
        action={processLetterAction}
        className="stationery-paper p-6 sm:p-8 transition-all"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <label
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
            htmlFor="rawText"
          >
            <PenLine className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{labels.label}</span>
          </label>

          <div
            className="flex items-center gap-2 text-xs font-mono"
            aria-live="polite"
          >
            <span
              className={`transition-colors font-medium ${
                isSatisfied ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {t("write.counter", { current: String(currentLength), min: String(minLength) })}
            </span>
            {isSatisfied && (
              <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>
        </div>

        <textarea
          id="rawText"
          name="rawText"
          rows={13}
          required
          aria-required="true"
          minLength={minLength}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-4 w-full resize-y rounded-xl border border-border/70 bg-background/50 p-4 sm:p-5 text-base leading-relaxed text-foreground outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25 break-words"
          placeholder={labels.placeholder}
        />

        {/* Security & Anonymization Assurance */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-muted/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
          <Shield className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t("write.privacyAssurance")}</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
          <span className="text-xs text-muted-foreground">
            {t("write.peacePacing")}
          </span>
          <SubmitButton>{labels.review}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
