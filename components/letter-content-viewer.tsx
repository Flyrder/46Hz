"use client";

import { useState } from "react";
import { ShieldCheck, FileText, SplitSquareVertical, Copy, Check, Eye } from "lucide-react";

interface LetterContentViewerProps {
  processedText: string;
  rawText: string;
  isAuthor: boolean;
  maskContent: boolean;
  t: (key: string, values?: Record<string, string>) => string;
}

export function LetterContentViewer({
  processedText,
  rawText,
  isAuthor,
  maskContent,
  t
}: LetterContentViewerProps) {
  const [viewMode, setViewMode] = useState<"processed" | "raw" | "split">("processed");
  const [copiedRaw, setCopiedRaw] = useState(false);

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
      <article className="stationery-paper p-6 sm:p-8">
        <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
          {processedText}
        </div>
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
    <article className="stationery-paper p-6 sm:p-8">
      {/* Author Mode Selection Controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div
          role="tablist"
          aria-label={t("letter.viewModeAria")}
          className="inline-flex rounded-xl border border-border/70 bg-muted/30 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "processed"}
            onClick={() => setViewMode("processed")}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
          {processedText}
        </div>
      )}

      {viewMode === "raw" && (
        <div>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="h-3 w-3" aria-hidden="true" />
            <span>{t("letter.rawDraftBadge")}</span>
          </div>
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-normal break-words">
            {rawText}
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
              <span className="text-xs text-muted-foreground">{rawText.length}자</span>
            </div>
            <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {rawText}
            </div>
          </div>

          {/* Processed Column */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("letter.processedBadge")}
              </span>
              <span className="text-xs text-muted-foreground">{processedText.length}자</span>
            </div>
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {processedText}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
