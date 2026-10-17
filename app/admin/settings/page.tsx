import { redirect } from "next/navigation";
import { Sliders, Shield, CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";
import { saveSystemSettingsAction, resetSystemSettingsAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { AdminSettingsForm } from "@/components/admin-settings-form";
import { StatusBadge } from "@/components/status-badge";
import { getAdminRole, canManageSettings } from "@/lib/admin";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { ensureSettingsLoadedFromDisk } from "@/lib/settings-store";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ saved?: string; reset?: string; error?: string }>;
}) {
  const [role, locale, params] = await Promise.all([
    getAdminRole(),
    getLocalePreference(),
    searchParams
      ? searchParams
      : Promise.resolve<{ saved?: string; reset?: string; error?: string }>({})
  ]);

  if (!role) {
    redirect("/admin");
  }

  const t = createTranslator(locale);
  const currentSettings = ensureSettingsLoadedFromDisk();
  const canEdit = canManageSettings(role);

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Sliders className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t("admin.settingsTitle")}
              </h1>
              <StatusBadge tone="good">settings.ts</StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.settingsSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} />

      {!canEdit ? (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-start gap-3 shadow-soft">
          <Shield className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-foreground">{t("admin.adminRequiredTitle")}</h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t("admin.adminRequiredDesc")}
            </p>
          </div>
        </div>
      ) : null}

      {params?.saved === "1" ? (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-3.5 text-xs font-semibold text-accent animate-entry"
        >
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span>{t("admin.settingsSavedBanner")}</span>
        </div>
      ) : null}

      {params?.reset === "1" ? (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-3.5 text-xs font-semibold text-accent animate-entry"
        >
          <RotateCcw className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span>{t("admin.settingsResetBanner")}</span>
        </div>
      ) : null}

      {params?.error === "validation" ? (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-danger/35 bg-danger/10 px-4 py-3.5 text-xs font-semibold text-danger animate-entry"
        >
          <AlertCircle className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span>{t("admin.settingsValidationError")}</span>
        </div>
      ) : null}

      <AdminSettingsForm
        initialSettings={currentSettings}
        saveAction={saveSystemSettingsAction}
        resetAction={resetSystemSettingsAction}
        canEdit={canEdit}
      />
    </section>
  );
}
