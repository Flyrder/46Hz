"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error("[46Hz App Error]:", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-border/80 bg-surface/90 p-8 sm:p-10 shadow-soft text-center animate-in fade-in duration-200">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger mb-5">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {t("common.errorTitle")}
      </h1>
      <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {error.message || t("common.errorFallback")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={buttonVariants("primary")}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>{t("common.retry")}</span>
        </button>
        <Link href="/" className={buttonVariants("secondary")}>
          <Home className="h-4 w-4" aria-hidden="true" />
          <span>{t("common.returnHome")}</span>
        </Link>
      </div>
    </section>
  );
}
