"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function SubmitButton({
  children,
  variant = "primary"
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const { pending } = useFormStatus();
  const { t } = useI18n();

  return (
    <button
      className={buttonVariants(variant)}
      disabled={pending}
      type="submit"
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">{t("common.processingSrOnly")}</span>
        </>
      ) : null}
      {children}
    </button>
  );
}

