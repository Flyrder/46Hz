"use client";

import { useState, useRef } from "react";
import { ShieldCheck, FileText, SplitSquareVertical, Copy, RotateCcw, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface ReviewComparisonViewerProps {
  rawText: string;
  initialProcessedText: string;
  t?: (key: string, values?: Record<string, string>) => string;
}

export function ReviewComparisonViewer({
  rawText,
  initialProcessedText,
  t: customT
}: ReviewComparisonViewerProps) {
  const { t: contextT } = useI18n();
  const t = customT ?? contextT;
  const [activeTab, setActiveTab] = useState<"processed" | "raw" | "split">("processed");
  const [currentText, setCurrentText] = useState(initialProcessedText);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [restored, setRestored] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      // Fallback if clipboard API is not available
    }
  };

  const handleRestoreRaw = () => {
    setCurrentText(rawText);
    setRestored(true);
    setTimeout(() => setRestored(false), 2000);
    if (textareaRef.current) {
      textareaRef.current.value = rawText;
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation (KWCAG 2.2 Compliant) */}
      <div
        role="tablist"
        aria-label={t("review.comparisonTitle")}
        className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/80 bg-muted/30 p-1"
      >
        <button
          type="button"
          role="tab"
          id="tab-processed"
          aria-selected={activeTab === "processed"}
          aria-controls="panel-processed"
          onClick={() => setActiveTab("processed")}
          className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            activeTab === "processed"
              ? "bg-surface text-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
          <span>{t("review.tabProcessed")}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-raw"
          aria-selected={activeTab === "raw"}
          aria-controls="panel-raw"
          onClick={() => setActiveTab("raw")}
          className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            activeTab === "raw"
              ? "bg-surface text-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>{t("review.tabRaw")}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-split"
          aria-selected={activeTab === "split"}
          aria-controls="panel-split"
          onClick={() => setActiveTab("split")}
          className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            activeTab === "split"
              ? "bg-surface text-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          <SplitSquareVertical className="h-4 w-4 text-accent" aria-hidden="true" />
          <span>{t("review.tabComparison")}</span>
        </button>
      </div>

      {/* Main Tab Panel: Processed & Editable Text */}
      <div
        id="panel-processed"
        role="tabpanel"
        aria-labelledby="tab-processed"
        className={activeTab === "processed" ? "block" : "hidden"}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <label
            htmlFor="processedText"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>{t("review.editable")}</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreRaw}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              title={t("letter.restoreRaw")}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{restored ? t("letter.restoredNotice") : t("letter.restoreRaw")}</span>
            </button>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {t("review.directlyEditable")}
            </span>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          id="processedText"
          name="processedText"
          rows={12}
          required
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          className="mt-4 w-full resize-y rounded-xl border border-border/70 bg-background/50 p-4 sm:p-5 text-base leading-relaxed text-foreground outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25 break-words"
          placeholder={t("write.placeholder")}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("write.privacyAssuranceBadge")}</span>
          <span>{t("common.characterCount", { count: String(currentText.length) })}</span>
        </div>
      </div>

      {/* Raw Draft Tab Panel */}
      <div
        id="panel-raw"
        role="tabpanel"
        aria-labelledby="tab-raw"
        className={activeTab === "raw" ? "block" : "hidden"}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>{t("letter.rawDraftBadge")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRaw}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              {copiedRaw ? (
                <>
                  <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>{t("common.copied")}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t("common.copy")}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleRestoreRaw}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-md px-2.5 py-1 text-xs text-accent hover:bg-accent/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{restored ? t("letter.restoredNotice") : t("letter.restoreRaw")}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5 text-base leading-relaxed text-foreground whitespace-pre-wrap break-words min-h-[240px]">
          {rawText}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {t("review.rawNotice")}
        </p>
      </div>

      {/* Side-by-Side Split Comparison Tab Panel */}
      <div
        id="panel-split"
        role="tabpanel"
        aria-labelledby="tab-split"
        className={activeTab === "split" ? "block" : "hidden"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left Column: Raw Draft */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {t("letter.viewRaw")} ({t("common.characterCount", { count: String(rawText.length) })})
              </span>
              <button
                type="button"
                onClick={handleCopyRaw}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedRaw ? t("common.copied") : t("common.copy")}
              </button>
            </div>
            <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {rawText}
            </div>
          </div>

          {/* Right Column: AI Processed */}
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("letter.viewProcessed")} ({t("common.characterCount", { count: String(currentText.length) })})
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("processed")}
                className="text-xs text-accent hover:underline transition-colors"
              >
                {t("review.directlyEditable")}
              </button>
            </div>
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {currentText}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            {t("review.comparisonHint")}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("processed")}
            className="text-xs font-semibold text-accent hover:underline"
          >
            → {t("review.editInEditor")}
          </button>
        </div>
      </div>
    </div>
  );
}
