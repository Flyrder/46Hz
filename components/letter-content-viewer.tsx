"use client";

import { useState } from "react";
import { ShieldCheck, FileText, SplitSquareVertical, Copy, Check, Eye, Quote, MessageSquareQuote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface LetterContentViewerProps {
  processedText: string;
  rawText: string;
  isAuthor: boolean;
  maskContent: boolean;
  highlightedQuotes?: string[];
  onSelectPassage?: (quote: string) => void;
  t?: (key: string, values?: Record<string, string>) => string;
}

function renderTextWithHighlights(text: string, quotes: string[], highlightTitle?: string) {
  const validQuotes = quotes.filter((q) => q && q.trim().length > 0 && text.includes(q.trim()));
  if (validQuotes.length === 0) {
    return text;
  }

  const sortedQuotes = [...new Set(validQuotes)].sort((a, b) => b.length - a.length);
  const escapedQuotes = sortedQuotes.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escapedQuotes.join("|")})`, "g");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (sortedQuotes.includes(part)) {
      return (
        <mark
          key={index}
          className="rounded bg-accent/20 px-1 py-0.5 text-foreground border-b-2 border-accent font-medium select-text"
          title={highlightTitle ?? "Highlighted passage"}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function LetterContentViewer({
  processedText,
  rawText,
  isAuthor,
  maskContent,
  highlightedQuotes = [],
  onSelectPassage,
  t: customT
}: LetterContentViewerProps) {
  const { t: contextT } = useI18n();
  const t = customT ?? contextT;
  const [viewMode, setViewMode] = useState<"processed" | "raw" | "split">("processed");
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [selectionSnippet, setSelectionSnippet] = useState("");

  const handleTextSelection = () => {
    if (!onSelectPassage) return;
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length >= 2 && text.length <= 400) {
      setSelectionSnippet(text);
    } else {
      setSelectionSnippet("");
    }
  };

  if (maskContent) {
    return (
      <article className="stationery-paper p-6 sm:p-8">
        <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
          {t("letter.masked")}
        </div>
      </article>
    );
  }

  // Non-authors only see the approved processed text
  if (!isAuthor) {
    return (
      <article
        className="stationery-paper p-6 sm:p-8"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
      >
        <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
          {renderTextWithHighlights(processedText, highlightedQuotes)}
        </div>

        {selectionSnippet && onSelectPassage && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-1.5 text-foreground font-medium truncate max-w-md">
              <Quote className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
              <span className="truncate">&ldquo;{selectionSnippet}&rdquo;</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectPassage(selectionSnippet);
                setSelectionSnippet("");
              }}
              className="inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-xs hover:bg-accent/90"
            >
              <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("comment.commentOnSelection")}</span>
            </button>
          </div>
        )}
      </article>
    );
  }

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <article
      className="stationery-paper p-6 sm:p-8"
      onMouseUp={handleTextSelection}
      onTouchEnd={handleTextSelection}
    >
      {/* Author Mode Selection Controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div
          role="tablist"
          aria-label={t("letter.viewModeAria")}
          className="inline-flex max-w-full overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-1 scrollbar-none"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "processed"}
            onClick={() => setViewMode("processed")}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              viewMode === "processed"
                ? "bg-surface text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{t("letter.viewProcessed")}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "raw"}
            onClick={() => setViewMode("raw")}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              viewMode === "raw"
                ? "bg-surface text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span>{t("letter.viewRaw")}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "split"}
            onClick={() => setViewMode("split")}
            className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              viewMode === "split"
                ? "bg-surface text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SplitSquareVertical className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{t("letter.viewComparison")}</span>
          </button>
        </div>

        {viewMode !== "processed" && (
          <button
            type="button"
            onClick={handleCopyRaw}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-border/60 bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            {copiedRaw ? (
              <>
                <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>{t("common.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("letter.copyRaw")}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content Rendering based on mode */}
      {viewMode === "processed" && (
        <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
          {renderTextWithHighlights(processedText, highlightedQuotes, t("comment.highlightedQuoteTitle"))}
        </div>
      )}

      {viewMode === "raw" && (
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="h-3 w-3" aria-hidden="true" />
            <span>{t("letter.rawDraftBadge")}</span>
          </div>
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
            {renderTextWithHighlights(rawText, highlightedQuotes, t("comment.highlightedQuoteTitle"))}
          </div>
        </div>
      )}

      {viewMode === "split" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Raw Column */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {t("letter.rawDraftBadge")}
              </span>
              <span className="text-xs text-muted-foreground">{t("common.characterCount", { count: String(rawText.length) })}</span>
            </div>
            <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {renderTextWithHighlights(rawText, highlightedQuotes, t("comment.highlightedQuoteTitle"))}
            </div>
          </div>

          {/* Processed Column */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("letter.processedBadge")}
              </span>
              <span className="text-xs text-muted-foreground">{t("common.characterCount", { count: String(processedText.length) })}</span>
            </div>
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {renderTextWithHighlights(processedText, highlightedQuotes, t("comment.highlightedQuoteTitle"))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Selection Tooltip Action */}
      {selectionSnippet && onSelectPassage && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-foreground font-medium truncate max-w-md">
            <Quote className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
            <span className="truncate">&ldquo;{selectionSnippet}&rdquo;</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectPassage(selectionSnippet);
              setSelectionSnippet("");
            }}
            className="inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-xs hover:bg-accent/90"
          >
            <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("comment.commentOnSelection")}</span>
          </button>
        </div>
      )}
    </article>
  );
}
