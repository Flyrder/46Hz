"use client";

import { useState } from "react";
import { MessageSquareQuote, Quote, Trash2, Plus, X, CornerDownRight } from "lucide-react";
import { createLetterCommentAction, deleteLetterCommentAction } from "@/app/actions/comments";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export interface CommentItem {
  id: string;
  letterId: string;
  authorId: string;
  selectedText: string;
  content: string;
  createdAt: Date | string;
}

interface LetterPassageCommentsProps {
  letterId: string;
  comments: CommentItem[];
  currentUserId: string;
  letterAuthorId: string;
  prefilledSelectedText?: string;
  onClearPrefill?: () => void;
  t?: (key: string, values?: Record<string, string>) => string;
}

export function LetterPassageComments({
  letterId,
  comments,
  currentUserId,
  letterAuthorId,
  prefilledSelectedText = "",
  onClearPrefill,
  t: customT
}: LetterPassageCommentsProps) {
  const { t: contextT } = useI18n();
  const t = customT ?? contextT;
  const [isAdding, setIsAdding] = useState(Boolean(prefilledSelectedText));
  const [selectedQuote, setSelectedQuote] = useState(prefilledSelectedText);

  // Sync if prefilled text changes from parent selection
  if (prefilledSelectedText && prefilledSelectedText !== selectedQuote) {
    setSelectedQuote(prefilledSelectedText);
    if (!isAdding) setIsAdding(true);
  }

  const handleOpenComposer = (quote = "") => {
    setSelectedQuote(quote);
    setIsAdding(true);
  };

  const handleCloseComposer = () => {
    setIsAdding(false);
    setSelectedQuote("");
    onClearPrefill?.();
  };

  return (
    <section
      aria-label={t("comment.title")}
      className="mt-8 rounded-2xl border border-border/80 bg-surface p-6 shadow-soft transition-all"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
            <MessageSquareQuote className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {t("comment.title")}
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t("comment.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted/70 px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {t("comment.badge", { count: String(comments.length) })}
          </span>

          {!isAdding && (
            <button
              type="button"
              onClick={() => handleOpenComposer()}
              className={`${buttonVariants("secondary")} text-xs min-h-[44px] py-2 px-3.5`}
            >
              <Plus className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>{t("comment.add")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Comment Composer Form */}
      {isAdding && (
        <form
          action={async (formData) => {
            await createLetterCommentAction(formData);
            handleCloseComposer();
          }}
          className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5 transition-all animate-in fade-in"
        >
          <input type="hidden" name="letterId" value={letterId} />

          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/40">
            <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <Quote className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("comment.add")}</span>
            </span>
            <button
              type="button"
              onClick={handleCloseComposer}
              className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              aria-label={t("common.cancel")}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Quoted passage field */}
          <div className="mb-3">
            <label
              htmlFor="comment-selectedText"
              className="block text-xs font-medium text-muted-foreground mb-1"
            >
              {t("comment.selectedQuote")}
            </label>
            <input
              id="comment-selectedText"
              name="selectedText"
              type="text"
              value={selectedQuote}
              onChange={(e) => setSelectedQuote(e.target.value)}
              placeholder={t("comment.quotePlaceholder")}
              className="w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Comment content textarea */}
          <div className="mb-4">
            <label
              htmlFor="comment-content"
              className="block text-xs font-medium text-foreground mb-1"
            >
              {t("comment.contentLabel")}
            </label>
            <textarea
              id="comment-content"
              name="content"
              rows={3}
              required
              placeholder={t("comment.placeholder")}
              className="w-full resize-y rounded-xl border border-border/70 bg-background p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseComposer}
              className={buttonVariants("ghost")}
            >
              {t("common.cancel")}
            </button>
            <SubmitButton variant="primary">
              {t("comment.submit")}
            </SubmitButton>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="mt-5 space-y-3.5">
        {comments.length === 0 && !isAdding && (
          <div className="rounded-xl border border-dashed border-border/80 p-6 text-center">
            <Quote className="mx-auto h-6 w-6 text-muted-foreground/50 mb-2" aria-hidden="true" />
            <p className="text-xs font-semibold text-foreground">
              {t("comment.emptyTitle")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {t("comment.emptyBody")}
            </p>
            <button
              type="button"
              onClick={() => handleOpenComposer()}
              className="mt-3.5 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>{t("comment.add")}</span>
            </button>
          </div>
        )}

        {comments.map((item) => {
          const canDelete =
            item.authorId === currentUserId || letterAuthorId === currentUserId;

          return (
            <article
              key={item.id}
              className="rounded-xl border border-border/70 bg-muted/15 p-4 transition-all hover:border-border"
            >
              {/* Quoted Excerpt if available */}
              {item.selectedText && (
                <div className="mb-2.5 rounded-lg border-l-2 border-accent bg-accent/5 px-3 py-1.5 text-xs italic text-foreground/80 flex items-start gap-1.5">
                  <Quote className="h-3 w-3 shrink-0 text-accent mt-0.5" aria-hidden="true" />
                  <span className="line-clamp-3 break-words">&ldquo;{item.selectedText}&rdquo;</span>
                </div>
              )}

              {/* Comment Content */}
              <div className="flex items-start gap-2">
                <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 mt-1" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words flex-1">
                  {item.content}
                </p>
              </div>

              {/* Footer: Date & Delete */}
              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                <time dateTime={new Date(item.createdAt).toISOString()}>
                  {formatDate(item.createdAt)}
                </time>

                {canDelete && (
                  <form action={deleteLetterCommentAction}>
                    <input type="hidden" name="commentId" value={item.id} />
                    <input type="hidden" name="letterId" value={letterId} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-danger transition-colors p-1"
                      title={t("comment.delete")}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      <span>{t("comment.delete")}</span>
                    </button>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
