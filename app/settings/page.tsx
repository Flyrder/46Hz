import { Shield, KeyRound, UserRound, Award, HeartHandshake } from "lucide-react";
import { leaveAnonymousSessionAction } from "@/app/actions/settings";
import { PreferenceForm } from "@/components/preference-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { CopyButton } from "@/components/copy-button";
import { createTranslator, localeOptions } from "@/lib/i18n";
import { getLocalePreference, getThemePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";
import { normalizeThemePreference, themeOptions } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [user, locale, themeCookie] = await Promise.all([
    requireUser(),
    getLocalePreference(),
    getThemePreference()
  ]);
  const t = createTranslator(locale);
  const theme = normalizeThemePreference(user.themePreference ?? themeCookie);

  return (
    <section className="mx-auto max-w-xl py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border/85 bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <UserRound className="h-4.5 w-4.5 text-accent" />
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t("settings.profileTitle")}
          </h2>
        </div>

        <dl className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{t("settings.anonymousHandle")}</dt>
            <dd className="font-semibold text-foreground">{user.anonymousHandle}</dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{t("settings.replyPreference")}</dt>
            <dd className="font-medium text-foreground">
              {t(`replyType.${user.preferredReplyType}`)}
            </dd>
          </div>

          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-accent" />
              <span>{t("settings.trustScore")}</span>
            </dt>
            <dd className="font-bold text-accent">{user.trustScore}</dd>
          </div>

          {/* Migration Code Block */}
          <div className="border-t border-border/60 pt-4 mt-2">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-accent" />
              <span>{t("settings.migrationCode")}</span>
            </dt>
            <dd className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 p-3">
              <span className="font-mono text-sm font-bold tracking-wider select-all text-foreground">
                {user.migrationCode}
              </span>
              {user.migrationCode && (
                <CopyButton
                  text={user.migrationCode}
                  copyLabel={t("common.copy")}
                  copiedLabel={t("common.copied")}
                />
              )}
            </dd>
            <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">
              ⚠️ {t("settings.migrationCodeHelp")}
            </dd>
          </div>
        </dl>
      </div>

      {/* Full Preference Form */}
      <PreferenceForm
        locale={locale}
        theme={theme}
        localeLabel={t("language.label")}
        themeLabel={t("theme.label")}
        localeOptions={localeOptions}
        themeOptions={themeOptions.map((option) => ({
          value: option.value,
          label: t(option.labelKey)
        }))}
        title={t("settings.preferences")}
        variant="full"
      />

      {/* Leave Session Action */}
      <form action={leaveAnonymousSessionAction} className="mt-6 pt-2">
        <SubmitButton variant="secondary">{t("settings.leave")}</SubmitButton>
      </form>
    </section>
  );
}
