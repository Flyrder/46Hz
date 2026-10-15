"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteLetterAction } from "@/app/actions/letters";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface DeleteLetterButtonProps {
  letterId: string;
  t?: (key: string, values?: Record<string, string>) => string;
  className?: string;
  variant?: "danger" | "ghost" | "secondary";
}

export function DeleteLetterButton({
  letterId,
  t: customT,
  className = "",
  variant = "ghost"
}: DeleteLetterButtonProps) {
  const { t: contextT } = useI18n();
  const t = customT ?? contextT;
  const [isOpen, setIsOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus cancel button on open to prevent accidental deletion
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${buttonVariants(variant)} text-danger hover:bg-danger/10 hover:text-danger min-h-[44px] ${className}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span>{t("letter.delete")}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-letter-dialog-title"
            aria-describedby="delete-letter-dialog-desc"
            className="w-full max-w-md rounded-2xl border border-border/90 bg-surface p-6 shadow-xl relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              aria-label={t("common.cancel")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Warning Icon & Title */}
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="delete-letter-dialog-title"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  {t("letter.deleteConfirmTitle")}
                </h2>
                <p
                  id="delete-letter-dialog-desc"
                  className="mt-2 text-xs leading-relaxed text-muted-foreground"
                >
                  {t("letter.deleteConfirmDesc")}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className={buttonVariants("secondary")}
              >
                {t("common.cancel")}
              </button>

              <form action={deleteLetterAction}>
                <input type="hidden" name="letterId" value={letterId} />
                <SubmitButton variant="danger">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>{t("letter.deleteConfirmButton")}</span>
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
