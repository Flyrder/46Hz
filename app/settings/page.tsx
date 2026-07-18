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
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold">{t("settings.title")}</h1>
      <div className="mt-6 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold">{t("settings.anonymousHandle")}</dt>
            <dd className="mt-1 text-muted-foreground">{user.anonymousHandle}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t("language.label")}</dt>
            <dd className="mt-1 text-muted-foreground">{locale}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t("settings.replyPreference")}</dt>
            <dd className="mt-1 text-muted-foreground">
              {t(`replyType.${user.preferredReplyType}`)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{t("settings.trustScore")}</dt>
            <dd className="mt-1 text-muted-foreground">{user.trustScore}</dd>
          </div>
          
          <div className="border-t border-border/60 pt-4 mt-2">
            <dt className="font-semibold">{t("settings.migrationCode")}</dt>
            <dd className="mt-1.5 flex items-center justify-between gap-3">
              <span className="font-mono bg-muted/50 px-2.5 py-1 rounded text-xs select-all text-foreground border border-border/40">
                {user.migrationCode}
              </span>
              {user.migrationCode && <CopyButton text={user.migrationCode} />}
            </dd>
            <dd className="mt-1.5 text-xs text-muted-foreground leading-normal">
              ⚠️ {t("settings.migrationCodeHelp")}
            </dd>
          </div>
        </dl>
      </div>
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
      <form action={leaveAnonymousSessionAction} className="mt-5">
        <SubmitButton variant="secondary">{t("settings.leave")}</SubmitButton>
      </form>
    </section>
  );
}
