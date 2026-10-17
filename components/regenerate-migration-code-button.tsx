"use client";

import { useState, useTransition } from "react";
import { RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { regenerateMigrationCodeAction } from "@/app/actions/settings";
import { useI18n } from "@/lib/i18n";

interface RegenerateMigrationCodeButtonProps {
  t?: (key: string, replacements?: Record<string, string>) => string;
}

export function RegenerateMigrationCodeButton({ t: propT }: RegenerateMigrationCodeButtonProps = {}) {
  const { t: contextT } = useI18n();
  const t = propT ?? contextT;
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRegenerate = () => {
    startTransition(async () => {
      try {
        await regenerateMigrationCodeAction();
        setShowConfirm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } catch (err) {
        console.error("Failed to regenerate migration code:", err);
      }
    });
  };

  return (
    <div className="mt-3">
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{t("settings.regenerateMigrationCodeSuccess")}</span>
        </div>
      )}

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-900 dark:text-amber-300 transition-all hover:bg-amber-500/20 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("settings.regenerateMigrationCode")}</span>
        </button>
      ) : (
        <div
          role="alertdialog"
          aria-labelledby="regen-dialog-title"
          aria-describedby="regen-dialog-desc"
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 animate-in fade-in zoom-in-98"
        >
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 id="regen-dialog-title" className="text-xs font-bold text-foreground">
                {t("settings.regenerateMigrationCodeTitle")}
              </h3>
              <p id="regen-dialog-desc" className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t("settings.regenerateMigrationCodeConfirm")}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleRegenerate}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-danger px-3.5 py-1.5 text-xs font-bold text-white shadow-soft transition-all hover:bg-danger/90 active:scale-98 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>{t("settings.regenerating")}</span>
                </>
              ) : (
                <span>{t("common.confirm")}</span>
              )}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowConfirm(false)}
              className="inline-flex min-h-[38px] items-center rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              <span>{t("common.cancel")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
