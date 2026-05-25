import { leaveAnonymousSessionAction } from "@/app/actions/settings";
import { updatePreferencesAction } from "@/app/actions/preferences";
import { SubmitButton } from "@/components/ui/submit-button";
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
        </dl>
      </div>
      <form action={updatePreferencesAction} className="mt-5 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <h2 className="text-lg font-semibold">{t("settings.preferences")}</h2>
        <label className="mt-4 block text-sm font-semibold" htmlFor="settings-locale">
          {t("language.label")}
        </label>
        <select
          id="settings-locale"
          name="locale"
          defaultValue={locale}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {localeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-sm font-semibold" htmlFor="settings-theme">
          {t("theme.label")}
        </label>
        <select
          id="settings-theme"
          name="theme"
          defaultValue={theme}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
        <div className="mt-5">
          <SubmitButton>{t("settings.save")}</SubmitButton>
        </div>
      </form>
      <form action={leaveAnonymousSessionAction} className="mt-5">
        <SubmitButton variant="secondary">{t("settings.leave")}</SubmitButton>
      </form>
    </section>
  );
}
