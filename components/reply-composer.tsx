"use client";

import { useActionState, useState } from "react";
import {
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  RotateCcw,
  Activity,
  Heart
} from "lucide-react";
import {
  coachReplyAction,
  submitReplyAction,
  type CoachReplyState
} from "@/app/actions/replies";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { createTranslator, formatToneFlag, type Locale } from "@/lib/i18n";

const initialState: CoachReplyState = {
  ok: false,
  error: ""
};

export function ReplyComposer({
  letterId,
  locale = "ko_KR",
  labels
}: {
  letterId: string;
  locale?: Locale;
  labels: {
    coach: string;
    coachSuggestions: string;
    finalReply: string;
    flags: string;
    placeholder: string;
    send: string;
    startOver: string;
    yourReply: string;
    draftEncouragement?: string;
    aiHint?: string;
    coachEditableNote?: string;
  };
}) {
  const [state, formAction] = useActionState(coachReplyAction, initialState);
  const [charCount, setCharCount] = useState(0);
  const t = createTranslator(locale);

  return (
    <div className="space-y-6">
      {/* Step 1: Draft Reply */}
      <form action={formAction} className="rounded-2xl border border-border/85 bg-surface p-6 shadow-soft transition-all">
        <input type="hidden" name="letterId" value={letterId} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2" htmlFor="replyText">
            <HeartHandshake className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{labels.yourReply}</span>
          </label>

          <span
            className={`text-xs font-mono transition-colors ${
              charCount >= 20 ? "text-accent font-medium" : "text-muted-foreground"
            }`}
            aria-live="polite"
          >
            {t("reply.counter", { current: String(charCount), min: "20" })}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {labels.draftEncouragement || t("reply.draftEncouragement")}
        </p>

        <textarea
          id="replyText"
          name="replyText"
          rows={7}
          required
          defaultValue={state.ok ? state.rawText : ""}
          onChange={(e) => setCharCount([...e.target.value.trim()].length)}
          aria-invalid={state.ok === false && !!state.error}
          aria-describedby={state.ok === false && state.error ? "reply-error" : undefined}
          className="mt-3.5 w-full resize-y rounded-xl border border-border bg-background/60 p-4 text-base leading-relaxed outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25 break-words"
          placeholder={labels.placeholder}
        />

        {state.ok === false && state.error ? (
          <p id="reply-error" role="alert" aria-live="assertive" className="mt-3 text-sm text-danger animate-in fade-in">
            {state.error}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground/80 hidden sm:inline">
            {labels.aiHint || t("reply.aiHint")}
          </span>
          <SubmitButton>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {labels.coach}
          </SubmitButton>
        </div>
      </form>

      {/* Step 2: AI Coach Suggestions, Tone Radar & Perspective Reframings */}
      {state.ok ? (
        <CoachedReplyWorkbench
          state={state}
          locale={locale}
          labels={labels}
        />
      ) : null}
    </div>
  );
}

function CoachedReplyWorkbench({
  state,
  locale,
  labels
}: {
  state: Extract<CoachReplyState, { ok: true }>;
  locale: Locale;
  labels: {
    coachSuggestions: string;
    finalReply: string;
    flags: string;
    send: string;
    startOver: string;
    coachEditableNote?: string;
  };
}) {
  const [currentText, setCurrentText] = useState(state.coachedText);
  const [appliedTone, setAppliedTone] = useState<string | null>(null);
  const t = createTranslator(locale);

  function handleApplyReframing(tone: string, text: string) {
    setCurrentText(text);
    setAppliedTone(tone);
  }

  return (
    <form
      action={submitReplyAction}
      role="region"
      aria-label={labels.coachSuggestions}
      className="rounded-2xl border border-accent/30 bg-surface p-6 shadow-soft animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <input type="hidden" name="letterId" value={state.letterId} />
      <input type="hidden" name="rawText" value={state.rawText} />

      <div className="flex items-center gap-2 text-sm font-semibold text-accent" role="status" aria-live="polite">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <span>{labels.coachSuggestions}</span>
      </div>

      {/* Tone Radar Metrics */}
      {state.metrics && (
        <div className="mt-4 rounded-xl border border-border/80 bg-background/70 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Activity className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{t("reply.toneRadar")}</span>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("reply.empathyScore")}</span>
                <span className="font-mono font-medium text-foreground">{state.metrics.empathy}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${state.metrics.empathy}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("reply.gentlenessScore")}</span>
                <span className="font-mono font-medium text-foreground">{state.metrics.gentleness}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${state.metrics.gentleness}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("reply.nonJudgmentalScore")}</span>
                <span className="font-mono font-medium text-foreground">{state.metrics.nonJudgmental}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${state.metrics.nonJudgmental}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reframings in 3 Healing Tones */}
      {state.reframings && state.reframings.length > 0 && (
        <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t("reply.reframingTitle")}
              </span>
              <p className="text-[11px] text-muted-foreground">
                {t("reply.reframingDesc")}
              </p>
            </div>
            {appliedTone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                <CheckCircle2 className="h-3 w-3" />
                {t("reply.appliedNotice")}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {state.reframings.map((reframe) => {
              const isApplied = appliedTone === reframe.tone;
              return (
                <button
                  key={reframe.tone}
                  type="button"
                  onClick={() => handleApplyReframing(reframe.tone, reframe.text)}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs transition-all ${
                    isApplied
                      ? "border border-accent bg-accent text-accent-foreground shadow-xs font-medium"
                      : "border border-border/80 bg-background/90 text-foreground hover:border-accent/40 hover:bg-surface active:scale-95"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isApplied ? "text-accent-foreground" : "text-accent"}`} />
                  <span>{reframe.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions List */}
      <div className="mt-4 rounded-xl bg-muted/40 border border-border/60 p-4">
        <ul className="space-y-2 text-xs leading-relaxed text-foreground/90" aria-live="polite">
          {state.suggestions.map((suggestion) => (
            <li key={suggestion} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>

        {state.flags.length > 0 ? (
          <p className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
            {labels.flags.replace(
              "{flags}",
              state.flags.map((flag) => formatToneFlag(flag, t)).join(", ")
            )}
          </p>
        ) : null}
      </div>

      <label className="mt-5 block text-sm font-semibold tracking-tight text-foreground" htmlFor="coachedText">
        {labels.finalReply}
      </label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {labels.coachEditableNote || t("reply.coachEditableNote")}
      </p>

      <textarea
        id="coachedText"
        name="coachedText"
        rows={7}
        required
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        className="mt-3 w-full resize-y rounded-xl border border-border bg-background p-4 text-base leading-relaxed outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/25 break-words"
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SubmitButton>{labels.send}</SubmitButton>
        <button
          type="button"
          className={buttonVariants("ghost")}
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1 text-muted-foreground" aria-hidden="true" />
          {labels.startOver}
        </button>
      </div>
    </form>
  );
}
