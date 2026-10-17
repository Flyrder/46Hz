"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { updateDesiredReplyTypeAction } from "@/app/actions/letters";

const REPLY_TYPES = [
  "COMFORT",
  "ADVICE",
  "SIMILAR_EXPERIENCES",
  "JUST_BEING_HEARD"
] as const;

type ReplyType = (typeof REPLY_TYPES)[number];

interface DesiredReplyTypeEditorProps {
  letterId: string;
  currentType: ReplyType;
  isAuthor: boolean;
  t: (key: string, replacements?: Record<string, string>) => string;
}

export function DesiredReplyTypeEditor({
  letterId,
  currentType,
  isAuthor,
  t
}: DesiredReplyTypeEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ReplyType>(currentType);
  const [isPending, startTransition] = useTransition();

  if (!isAuthor) {
    return (
      <StatusBadge tone="neutral">
        {t(`replyType.${currentType}`)}
      </StatusBadge>
    );
  }

  const handleSelect = (type: ReplyType) => {
    if (type === selectedType) {
      setIsOpen(false);
      return;
    }

    setSelectedType(type);
    setIsOpen(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("letterId", letterId);
      formData.set("desiredReplyType", type);
      await updateDesiredReplyTypeAction(formData);
    });
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isPending}
        className="group inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-2.5 py-1 text-xs font-semibold text-foreground shadow-xs transition-all hover:border-accent hover:bg-muted/50 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title={t("letter.changeDesiredReplyType")}
        aria-label={`${t("letter.changeDesiredReplyType")}: ${t(`replyType.${selectedType}`)}`}
        aria-expanded={isOpen}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin text-accent" />
        ) : (
          <Sparkles className="h-3 w-3 text-accent" />
        )}
        <span>{t(`replyType.${selectedType}`)}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label={t("letter.changeDesiredReplyType")}
            className="absolute left-0 mt-2 z-50 w-64 rounded-2xl border border-border/90 bg-surface p-2 shadow-tactile animate-in fade-in zoom-in-95"
          >
            <div className="px-2 py-1.5 border-b border-border/50 mb-1">
              <span className="text-[11px] font-bold text-foreground block">
                {t("letter.changeDesiredReplyType")}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5 leading-relaxed">
                {t("letter.desiredReplyTypeHelp")}
              </span>
            </div>

            <div className="space-y-1">
              {REPLY_TYPES.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelect(type)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-accent/15 text-accent font-bold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{t(`replyType.${type}`)}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
