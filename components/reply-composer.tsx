"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import {
  coachReplyAction,
  submitReplyAction,
  type CoachReplyState
} from "@/app/actions/replies";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";

const initialState: CoachReplyState = {
  ok: false,
  error: ""
};

export function ReplyComposer({
  letterId,
  labels
}: {
  letterId: string;
  labels: {
    coach: string;
    coachSuggestions: string;
    finalReply: string;
    flags: string;
    placeholder: string;
    send: string;
    startOver: string;
    yourReply: string;
  };
}) {
  const [state, formAction] = useActionState(coachReplyAction, initialState);

  return (
    <div className="space-y-5">
      <form action={formAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
        <input type="hidden" name="letterId" value={letterId} />
        <label className="text-sm font-semibold" htmlFor="replyText">
          {labels.yourReply}
        </label>
        <textarea
          id="replyText"
          name="replyText"
          rows={8}
          required
          defaultValue={state.ok ? state.rawText : ""}
          className="mt-3 w-full resize-y rounded-lg border border-border bg-background p-4 text-base leading-7 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder={labels.placeholder}
        />
        {state.ok === false && state.error ? (
          <p className="mt-3 text-sm text-danger">{state.error}</p>
        ) : null}
        <div className="mt-4">
          <SubmitButton>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {labels.coach}
          </SubmitButton>
        </div>
      </form>

      {state.ok ? (
        <form action={submitReplyAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <input type="hidden" name="letterId" value={state.letterId} />
          <input type="hidden" name="rawText" value={state.rawText} />
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            {labels.coachSuggestions}
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {state.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
          {state.flags.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {labels.flags.replace("{flags}", state.flags.join(", "))}
            </p>
          ) : null}
          <label className="mt-5 block text-sm font-semibold" htmlFor="coachedText">
            {labels.finalReply}
          </label>
          <textarea
            id="coachedText"
            name="coachedText"
            rows={8}
            required
            defaultValue={state.coachedText}
            className="mt-3 w-full resize-y rounded-lg border border-border bg-background p-4 text-base leading-7 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <SubmitButton>{labels.send}</SubmitButton>
            <button type="button" className={buttonVariants("ghost")} onClick={() => window.location.reload()}>
              {labels.startOver}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
