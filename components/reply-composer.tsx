"use client";

import { useActionState, useState } from "react";
import { Sparkles, HeartHandshake, CheckCircle2, RotateCcw } from "lucide-react";
import {
  coachReplyAction,
  submitReplyAction,
  type CoachReplyState
} from "@/app/actions/replies";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";

import { createTranslator, type Locale } from "@/lib/i18n";

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

      {/* Step 2: AI Coach Suggestions & Final Submission */}
      {state.ok ? (
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

          <div className="mt-3 rounded-xl bg-accent/5 border border-accent/15 p-4">
            <ul className="space-y-2 text-xs leading-relaxed text-foreground/90" aria-live="polite">
              {state.suggestions.map((suggestion) => (
                <li key={suggestion} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>

            {state.flags.length > 0 ? (
              <p className="mt-3 border-t border-accent/15 pt-2 text-[11px] text-muted-foreground">
                {labels.flags.replace("{flags}", state.flags.join(", "))}
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
            defaultValue={state.coachedText}
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
      ) : null}
    </div>
  );
}
