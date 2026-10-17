"use client";

import { useState } from "react";
import { PenLine, Sparkles, Shield, Heart } from "lucide-react";
import { processLetterAction } from "@/app/actions/letters";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTranslator, type Locale } from "@/lib/i18n";

import { WritingSparksHelper } from "@/components/writing-sparks-helper";

const PROMPT_KEYS = [
  "write.prompt1",
  "write.prompt2",
  "write.prompt3",
  "write.prompt4"
] as const;

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

  const prompts = PROMPT_KEYS.map((key) => t(key));

  function handleSelectPrompt(prompt: string) {
    if (!text.trim()) {
      setText(`${prompt}...\n\n`);
    }
  }

  function handleSelectSpark(sparkText: string) {
    if (!text.trim()) {
      setText(`${sparkText} `);
    } else {
      setText((prev) => `${prev.trim()}\n\n${sparkText} `);
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Writing Sparks Helper */}
      <WritingSparksHelper locale={locale} onSelectSpark={handleSelectSpark} />

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
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-foreground/85 transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-foreground active:scale-95"
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
          className="mt-4 font-letter w-full resize-y rounded-xl border border-border/70 bg-background/50 p-4 sm:p-5 text-base leading-relaxed text-foreground outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25 break-words"
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
