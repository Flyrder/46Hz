"use client";

import { useState, useMemo } from "react";
import {
  Waves,
  Globe,
  ShieldCheck,
  Database,
  Bot,
  Save,
  RotateCcw,
  FileCode2,
  CheckCircle2
} from "lucide-react";
import { ExitIsoIcon } from "@/components/exit-sign-emblem";
import type { EditableSystemSettings } from "@/settings";
import { SubmitButton } from "@/components/ui/submit-button";
import { useI18n } from "@/lib/i18n";

function generateLiveSettingsPreview(cfg: EditableSystemSettings): string {
  return `// Auto-synchronized by 46Hz Admin System Settings Studio
export const brandSettings = {
  name: ${JSON.stringify(cfg.brandName)},
  title: ${JSON.stringify(cfg.brandTitle)},
  tagline: ${JSON.stringify(cfg.brandTagline)},
  version: ${JSON.stringify(cfg.brandVersion)}
} as const;

export const i18nSettings = {
  defaultLocale: ${JSON.stringify(cfg.defaultLocale)} as const,
  supportedLocales: ["ko_KR", "en_US", "zh_CN"] as const
} as const;

export const themeSettings = {
  defaultTheme: ${JSON.stringify(cfg.defaultTheme)} as const,
  supportedThemes: ["system", "light", "dark"] as const
} as const;

export const sessionSettings = {
  userCookie: "46hz_user_id",
  cookieMaxAgeSeconds: 60 * 60 * 24 * ${cfg.cookieMaxAgeDays}, // ${cfg.cookieMaxAgeDays} days
  migrationCodePrefix: ${JSON.stringify(cfg.migrationCodePrefix)}
} as const;

export const resonanceSettings = {
  defaultMaxReplies: ${cfg.defaultMaxReplies},
  expandedMaxReplies: ${cfg.expandedMaxReplies}
} as const;

export const claimingSettings = {
  leaseDurationMinutes: ${cfg.leaseDurationMinutes}
} as const;

export const securitySettings = {
  rateLimits: {
    adminLogin: { maxRequests: ${cfg.adminLoginMaxRequests}, windowMs: ${cfg.adminLoginWindowSeconds * 1000} },
    writeLetter: { maxRequests: ${cfg.writeLetterMaxRequests}, windowMs: ${cfg.writeLetterWindowSeconds * 1000} },
    coachReply: { maxRequests: ${cfg.coachReplyMaxRequests}, windowMs: ${cfg.coachReplyWindowSeconds * 1000} }
  }
} as const;

export const complianceSettings = {
  ipRetentionDays: ${cfg.ipRetentionDays},
  maxRecentIps: ${cfg.maxRecentIps},
  protocolVersion: "46HZ-LE-PACKET-V1" as const,
  legalBasis: ${JSON.stringify(cfg.legalBasis)},
  dataMinimizationNotice: ${JSON.stringify(cfg.dataMinimizationNotice)}
} as const;

export const aiSettings = {
  enabled: ${cfg.enableAi},
  enableRiskSafety: ${cfg.enableAiRiskSafety},
  enableAnonymization: ${cfg.enableAiAnonymization},
  enableReplyCoach: ${cfg.enableAiReplyCoach},
  enableWritingSparks: ${cfg.enableAiWritingSparks},
  enableResonanceMatch: ${cfg.enableAiResonanceMatch},
  defaultProvider: ${JSON.stringify(cfg.aiDefaultProvider)} as const,
  timeoutMs: ${cfg.aiTimeoutMs},
  mockDelayMs: ${cfg.aiMockDelayMs},
  temperature: ${cfg.aiTemperature},
  maxTokens: ${cfg.aiMaxTokens},
  model: ${JSON.stringify(cfg.aiModel)}
} as const;

export const supportResourcesSettings = {
  enableChinaSupportInfo: ${cfg.enableChinaSupportInfo}
} as const;`;
}

export function AdminSettingsForm({
  initialSettings,
  saveAction,
  resetAction,
  canEdit
}: {
  initialSettings: EditableSystemSettings;
  saveAction: (formData: FormData) => Promise<void>;
  resetAction: () => Promise<void>;
  canEdit: boolean;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<EditableSystemSettings>(initialSettings);

  const livePreview = useMemo(() => generateLiveSettingsPreview(draft), [draft]);

  // Modern Web Guidance: required-field-feedback JS bridge for aria-invalid synchronization
  const syncFieldAriaInvalid = (
    target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  ) => {
    const isInvalid = !target.validity.valid;
    target.setAttribute("aria-invalid", String(isInvalid));
    target.classList.toggle("user-invalid-fallback", isInvalid);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    syncFieldAriaInvalid(e.currentTarget);
  };

  const handleInput = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.currentTarget;
    if (target.getAttribute("aria-invalid") === "true") {
      syncFieldAriaInvalid(target);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.preventDefault();
      const elements = Array.from(form.elements) as Array<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >;
      let firstInvalid: HTMLElement | null = null;
      for (const el of elements) {
        if ("validity" in el && !el.validity.valid) {
          syncFieldAriaInvalid(el);
          if (!firstInvalid) {
            firstInvalid = el;
          }
        }
      }
      firstInvalid?.focus();
    }
  };

  const inputClassName =
    "mt-1.5 w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-sm text-foreground transition-colors focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60 validated-field";

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Main Form Column */}
      <div className="space-y-6 lg:col-span-7">
        <form
          action={saveAction}
          onSubmit={handleFormSubmit}
          noValidate
          className="space-y-6"
        >
          {/* Section 1: Brand & Identity */}
          <section className="stationery-card p-6 animate-entry">
            <div className="flex items-start gap-3 border-b border-border/60 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Waves className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("admin.settingsSecBrandTitle")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("admin.settingsSecBrandDesc")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="brandName" className="block text-xs font-semibold text-foreground">
                  {t("admin.settingsBrandNameLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="brandName"
                  name="brandName"
                  type="text"
                  required
                  minLength={2}
                  maxLength={32}
                  disabled={!canEdit}
                  value={draft.brandName}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, brandName: e.target.value }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  aria-describedby="brandName-error"
                  className={inputClassName}
                />
                <p id="brandName-error" className="field-error-msg mt-1 text-[11px] text-danger">
                  {t("admin.settingsBrandNameError")}
                </p>
              </div>

              <div>
                <label htmlFor="brandVersion" className="block text-xs font-semibold text-foreground">
                  {t("admin.settingsBrandVersionLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="brandVersion"
                  name="brandVersion"
                  type="text"
                  required
                  minLength={1}
                  maxLength={24}
                  disabled={!canEdit}
                  value={draft.brandVersion}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, brandVersion: e.target.value }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  aria-describedby="brandVersion-error"
                  className={inputClassName}
                />
                <p id="brandVersion-error" className="field-error-msg mt-1 text-[11px] text-danger">
                  {t("admin.settingsBrandVersionError")}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="brandTitle" className="block text-xs font-semibold text-foreground">
                  {t("admin.settingsBrandTitleLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="brandTitle"
                  name="brandTitle"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  disabled={!canEdit}
                  value={draft.brandTitle}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, brandTitle: e.target.value }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  aria-describedby="brandTitle-error"
                  className={inputClassName}
                />
                <p id="brandTitle-error" className="field-error-msg mt-1 text-[11px] text-danger">
                  {t("admin.settingsBrandTitleError")}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="brandTagline" className="block text-xs font-semibold text-foreground">
                  {t("admin.settingsBrandTaglineLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="brandTagline"
                  name="brandTagline"
                  type="text"
                  required
                  minLength={4}
                  maxLength={160}
                  disabled={!canEdit}
                  value={draft.brandTagline}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, brandTagline: e.target.value }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  aria-describedby="brandTagline-error"
                  className={inputClassName}
                />
                <p id="brandTagline-error" className="field-error-msg mt-1 text-[11px] text-danger">
                  {t("admin.settingsBrandTaglineError")}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Schumann Resonance & Slow Letterbox Mechanics */}
          <section className="stationery-card p-6 animate-entry">
            <div className="flex items-start gap-3 border-b border-border/60 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Waves className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("admin.settingsSecResonanceTitle")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("admin.settingsSecResonanceDesc")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="defaultMaxReplies"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsDefaultMaxRepliesLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="defaultMaxReplies"
                  name="defaultMaxReplies"
                  type="number"
                  required
                  min={1}
                  max={30}
                  disabled={!canEdit}
                  value={draft.defaultMaxReplies}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      defaultMaxReplies: Number(e.target.value) || 1
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="expandedMaxReplies"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsExpandedMaxRepliesLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="expandedMaxReplies"
                  name="expandedMaxReplies"
                  type="number"
                  required
                  min={1}
                  max={60}
                  disabled={!canEdit}
                  value={draft.expandedMaxReplies}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      expandedMaxReplies: Number(e.target.value) || 1
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="leaseDurationMinutes"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsLeaseDurationLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="leaseDurationMinutes"
                  name="leaseDurationMinutes"
                  type="number"
                  required
                  min={1}
                  max={120}
                  disabled={!canEdit}
                  value={draft.leaseDurationMinutes}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      leaseDurationMinutes: Number(e.target.value) || 1
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Preferences & Session Defaults */}
          <section className="stationery-card p-6 animate-entry">
            <div className="flex items-start gap-3 border-b border-border/60 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Globe className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("admin.settingsSecI18nTitle")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("admin.settingsSecI18nDesc")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="defaultLocale"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsDefaultLocaleLabel")}
                </label>
                <select
                  id="defaultLocale"
                  name="defaultLocale"
                  disabled={!canEdit}
                  value={draft.defaultLocale}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      defaultLocale: e.target.value as EditableSystemSettings["defaultLocale"]
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="ko_KR">{t("common.langKo")} (ko_KR)</option>
                  <option value="en_US">{t("common.langEn")} (en_US)</option>
                  <option value="zh_CN">{t("common.langZh")} (zh_CN)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="defaultTheme"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsDefaultThemeLabel")}
                </label>
                <select
                  id="defaultTheme"
                  name="defaultTheme"
                  disabled={!canEdit}
                  value={draft.defaultTheme}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      defaultTheme: e.target.value as EditableSystemSettings["defaultTheme"]
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="system">{t("theme.system")}</option>
                  <option value="light">{t("theme.light")}</option>
                  <option value="dark">{t("theme.dark")}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="cookieMaxAgeDays"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsCookieDaysLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="cookieMaxAgeDays"
                  name="cookieMaxAgeDays"
                  type="number"
                  required
                  min={1}
                  max={365}
                  disabled={!canEdit}
                  value={draft.cookieMaxAgeDays}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      cookieMaxAgeDays: Number(e.target.value) || 180
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="migrationCodePrefix"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsMigrationPrefixLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="migrationCodePrefix"
                  name="migrationCodePrefix"
                  type="text"
                  required
                  minLength={2}
                  maxLength={12}
                  disabled={!canEdit}
                  value={draft.migrationCodePrefix}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      migrationCodePrefix: e.target.value
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              {/* EXIT Support Resources: Mainland China (CN) Hotline & Support Info Toggle */}
              <div className="sm:col-span-2 mt-2 rounded-2xl border border-emerald-600/25 bg-emerald-500/6 p-4 dark:border-emerald-400/25 dark:bg-emerald-500/10">
                <label
                  htmlFor="enableChinaSupportInfo"
                  className="brand-checkbox-label flex min-h-[44px] cursor-pointer items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#16794B]/15 p-1.5">
                      <ExitIsoIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="block text-xs sm:text-sm font-bold text-foreground">
                        {t("admin.settingsChinaSupportTitle")}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {t("admin.settingsChinaSupportDesc")}
                      </span>
                    </div>
                  </div>
                  <input
                    id="enableChinaSupportInfo"
                    name="enableChinaSupportInfo"
                    type="checkbox"
                    disabled={!canEdit}
                    checked={draft.enableChinaSupportInfo}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        enableChinaSupportInfo: e.target.checked
                      }))
                    }
                    className="visually-hidden-fallback mt-1 h-5 w-5 shrink-0 cursor-pointer rounded"
                  />
                  <span className="sr-only">{t("admin.settingsChinaSupportSrOnly")}</span>
                </label>
              </div>
            </div>
          </section>

          {/* Section 4: Security & Compliance */}
          <section className="stationery-card p-6 animate-entry">
            <div className="flex items-start gap-3 border-b border-border/60 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("admin.settingsSecSecurityTitle")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("admin.settingsSecSecurityDesc")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="adminLoginMaxRequests"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAdminLoginMaxLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="adminLoginMaxRequests"
                  name="adminLoginMaxRequests"
                  type="number"
                  required
                  min={1}
                  max={50}
                  disabled={!canEdit}
                  value={draft.adminLoginMaxRequests}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      adminLoginMaxRequests: Number(e.target.value) || 5
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="adminLoginWindowSeconds"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAdminLoginWindowLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="adminLoginWindowSeconds"
                  name="adminLoginWindowSeconds"
                  type="number"
                  required
                  min={10}
                  max={3600}
                  disabled={!canEdit}
                  value={draft.adminLoginWindowSeconds}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      adminLoginWindowSeconds: Number(e.target.value) || 300
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="writeLetterMaxRequests"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsWriteLetterMaxLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="writeLetterMaxRequests"
                  name="writeLetterMaxRequests"
                  type="number"
                  required
                  min={1}
                  max={100}
                  disabled={!canEdit}
                  value={draft.writeLetterMaxRequests}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      writeLetterMaxRequests: Number(e.target.value) || 10
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="writeLetterWindowSeconds"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsWriteLetterWindowLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="writeLetterWindowSeconds"
                  name="writeLetterWindowSeconds"
                  type="number"
                  required
                  min={10}
                  max={3600}
                  disabled={!canEdit}
                  value={draft.writeLetterWindowSeconds}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      writeLetterWindowSeconds: Number(e.target.value) || 60
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="coachReplyMaxRequests"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsCoachReplyMaxLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="coachReplyMaxRequests"
                  name="coachReplyMaxRequests"
                  type="number"
                  required
                  min={1}
                  max={100}
                  disabled={!canEdit}
                  value={draft.coachReplyMaxRequests}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      coachReplyMaxRequests: Number(e.target.value) || 10
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="coachReplyWindowSeconds"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsCoachReplyWindowLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="coachReplyWindowSeconds"
                  name="coachReplyWindowSeconds"
                  type="number"
                  required
                  min={10}
                  max={3600}
                  disabled={!canEdit}
                  value={draft.coachReplyWindowSeconds}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      coachReplyWindowSeconds: Number(e.target.value) || 60
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ipRetentionDays"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsIpRetentionDaysLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="ipRetentionDays"
                  name="ipRetentionDays"
                  type="number"
                  required
                  min={1}
                  max={90}
                  disabled={!canEdit}
                  value={draft.ipRetentionDays}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      ipRetentionDays: Number(e.target.value) || 14
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="maxRecentIps"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsMaxRecentIpsLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="maxRecentIps"
                  name="maxRecentIps"
                  type="number"
                  required
                  min={1}
                  max={20}
                  disabled={!canEdit}
                  value={draft.maxRecentIps}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxRecentIps: Number(e.target.value) || 5
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="legalBasis" className="block text-xs font-semibold text-foreground">
                  {t("admin.settingsLegalBasisLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="legalBasis"
                  name="legalBasis"
                  type="text"
                  required
                  minLength={4}
                  maxLength={240}
                  disabled={!canEdit}
                  value={draft.legalBasis}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, legalBasis: e.target.value }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="dataMinimizationNotice"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsDataMinimizationLabel")} <span className="text-danger">*</span>
                </label>
                <textarea
                  id="dataMinimizationNotice"
                  name="dataMinimizationNotice"
                  rows={2}
                  required
                  minLength={10}
                  maxLength={400}
                  disabled={!canEdit}
                  value={draft.dataMinimizationNotice}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      dataMinimizationNotice: e.target.value
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          {/* Section 5: AI Empathetic Middleware */}
          <section className="stationery-card p-6 animate-entry">
            <div className="flex items-start gap-3 border-b border-border/60 pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("admin.settingsSecAiTitle")}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("admin.settingsSecAiDesc")}
                </p>
              </div>
            </div>

            {/* Master AI Toggle */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-border/80 bg-background/60 p-4">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  {t("admin.settingsAiEnabledLabel")}
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                  {t("admin.settingsAiEnabledDesc")}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableAi"
                  id="enableAi"
                  disabled={!canEdit}
                  checked={draft.enableAi}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableAi: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>
            </div>

            {/* AI Function Capability Toggles */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 p-3 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                <span>{t("admin.settingsAiRiskSafetyLabel")}</span>
                <input
                  type="checkbox"
                  name="enableAiRiskSafety"
                  disabled={!canEdit || !draft.enableAi}
                  checked={draft.enableAiRiskSafety}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableAiRiskSafety: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 p-3 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                <span>{t("admin.settingsAiAnonymizationLabel")}</span>
                <input
                  type="checkbox"
                  name="enableAiAnonymization"
                  disabled={!canEdit || !draft.enableAi}
                  checked={draft.enableAiAnonymization}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableAiAnonymization: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 p-3 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                <span>{t("admin.settingsAiReplyCoachLabel")}</span>
                <input
                  type="checkbox"
                  name="enableAiReplyCoach"
                  disabled={!canEdit || !draft.enableAi}
                  checked={draft.enableAiReplyCoach}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableAiReplyCoach: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 p-3 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30">
                <span>{t("admin.settingsAiWritingSparksLabel")}</span>
                <input
                  type="checkbox"
                  name="enableAiWritingSparks"
                  disabled={!canEdit || !draft.enableAi}
                  checked={draft.enableAiWritingSparks}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableAiWritingSparks: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 p-3 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/30 sm:col-span-2">
                <span>{t("admin.settingsAiResonanceMatchLabel")}</span>
                <input
                  type="checkbox"
                  name="enableAiResonanceMatch"
                  disabled={!canEdit || !draft.enableAi}
                  checked={draft.enableAiResonanceMatch}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableAiResonanceMatch: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
              </label>
            </div>

            {/* AI Function Detail Parameters */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="aiDefaultProvider"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAiProviderLabel")}
                </label>
                <select
                  id="aiDefaultProvider"
                  name="aiDefaultProvider"
                  disabled={!canEdit}
                  value={draft.aiDefaultProvider}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      aiDefaultProvider: e.target.value as EditableSystemSettings["aiDefaultProvider"]
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="mock">{t("admin.settingsAiProviderMock")}</option>
                  <option value="openai">{t("admin.settingsAiProviderOpenai")}</option>
                  <option value="deepseek">{t("admin.settingsAiProviderDeepseek")}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="aiModel"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAiModelLabel")}
                </label>
                <input
                  id="aiModel"
                  name="aiModel"
                  type="text"
                  disabled={!canEdit}
                  value={draft.aiModel}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      aiModel: e.target.value
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="aiTemperature"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAiTemperatureLabel")}
                </label>
                <input
                  id="aiTemperature"
                  name="aiTemperature"
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  disabled={!canEdit}
                  value={draft.aiTemperature}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      aiTemperature: Number(e.target.value) || 0.7
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="aiMaxTokens"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAiMaxTokensLabel")}
                </label>
                <input
                  id="aiMaxTokens"
                  name="aiMaxTokens"
                  type="number"
                  min={50}
                  max={8000}
                  step={50}
                  disabled={!canEdit}
                  value={draft.aiMaxTokens}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      aiMaxTokens: Number(e.target.value) || 1500
                    }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="aiTimeoutMs"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAiTimeoutLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="aiTimeoutMs"
                  name="aiTimeoutMs"
                  type="number"
                  required
                  min={1000}
                  max={60000}
                  step={500}
                  disabled={!canEdit}
                  value={draft.aiTimeoutMs}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      aiTimeoutMs: Number(e.target.value) || 10000
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="aiMockDelayMs"
                  className="block text-xs font-semibold text-foreground"
                >
                  {t("admin.settingsAiMockDelayLabel")} <span className="text-danger">*</span>
                </label>
                <input
                  id="aiMockDelayMs"
                  name="aiMockDelayMs"
                  type="number"
                  required
                  min={0}
                  max={5000}
                  step={50}
                  disabled={!canEdit}
                  value={draft.aiMockDelayMs}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      aiMockDelayMs: Number(e.target.value) || 150
                    }))
                  }
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          {canEdit ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <SubmitButton variant="primary">
                <Save className="h-4 w-4" aria-hidden="true" />
                <span>{t("admin.settingsSaveButton")}</span>
              </SubmitButton>
            </div>
          ) : null}
        </form>

        {canEdit ? (
          <form action={resetAction} className="flex justify-end">
            <SubmitButton variant="secondary">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("admin.settingsResetButton")}</span>
            </SubmitButton>
          </form>
        ) : null}
      </div>

      {/* Live settings.ts Code Preview Column */}
      <aside className="lg:col-span-5">
        <div className="sticky top-20 stationery-card overflow-hidden p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
              <h3 className="text-sm font-bold text-foreground">
                {t("admin.settingsCodePreviewTitle")}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              <span>settings.ts</span>
            </span>
          </div>

          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            {t("admin.settingsCodePreviewDesc")}
          </p>

          <pre className="mt-4 max-h-[540px] overflow-auto rounded-xl border border-border/80 bg-background/90 p-4 font-mono text-[11px] leading-relaxed text-foreground">
            <code>{livePreview}</code>
          </pre>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <Database className="h-4 w-4 shrink-0 text-accent mt-0.5" aria-hidden="true" />
            <span>{t("admin.settingsSyncNote")}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
