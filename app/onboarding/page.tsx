import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createAnonymousSessionAction, restoreSessionAction } from "@/app/actions/onboarding";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTranslator, localeOptions } from "@/lib/i18n";
import { getLocalePreference, LOCALE_COOKIE } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [user, storedLocale, params] = await Promise.all([
    getCurrentUser(),
    getLocalePreference(),
    searchParams
  ]);
  
  if (user) {
    redirect("/write");
  }

  const cookieStore = await cookies();
  const hasLocaleCookie = cookieStore.has(LOCALE_COOKIE);
  let locale = storedLocale;

  if (!hasLocaleCookie) {
    const headersList = await headers();
    const acceptLang = headersList.get("accept-language") || "";
    if (acceptLang.toLowerCase().includes("ko")) {
      locale = "ko_KR";
    }
  }

  const t = createTranslator(locale);
  const showError = params.error === "invalid_code";

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold">{t("onboarding.title")}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("onboarding.subtitle")}
      </p>

      {showError && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger animate-in fade-in slide-in-from-top-1 duration-200">
          {t("onboarding.errorInvalidCode")}
        </p>
      )}

      {/* Form 1: Create Session */}
      <form action={createAnonymousSessionAction} className="mt-6 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <label className="text-sm font-semibold" htmlFor="language">
          {t("language.label")}
        </label>
        <select
          id="language"
          name="language"
          defaultValue={locale}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {localeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">{t("onboarding.ageRange")}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="rounded-lg border border-border p-3 text-sm cursor-pointer hover:bg-muted/10 transition-colors">
              <input className="mr-2" type="radio" name="ageRange" value="UNDER_18" required />
              {locale === "ko_KR" ? "19세 미만" : t("age.under18")}
            </label>
            <label className="rounded-lg border border-border p-3 text-sm cursor-pointer hover:bg-muted/10 transition-colors">
              <input className="mr-2" type="radio" name="ageRange" value="ADULT" defaultChecked />
              {locale === "ko_KR" ? "19세 이상" : t("age.adult")}
            </label>
          </div>
        </fieldset>

        <label className="mt-5 block text-sm font-semibold" htmlFor="preferredReplyType">
          {t("onboarding.replyPreference")}
        </label>
        <select
          id="preferredReplyType"
          name="preferredReplyType"
          defaultValue="COMFORT"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          <option value="COMFORT">{t("replyType.COMFORT")}</option>
          <option value="ADVICE">{t("replyType.ADVICE")}</option>
          <option value="SIMILAR_EXPERIENCES">{t("replyType.SIMILAR_EXPERIENCES")}</option>
          <option value="JUST_BEING_HEARD">{t("replyType.JUST_BEING_HEARD")}</option>
        </select>

        <div className="mt-6">
          <SubmitButton>{t("onboarding.create")}</SubmitButton>
        </div>
      </form>

      {/* Form 2: Restore Session via Migration Code */}
      <form action={restoreSessionAction} className="mt-5 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <h2 className="text-lg font-semibold">{t("onboarding.restoreTitle")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("onboarding.restoreHelp")}
        </p>
        <div className="mt-4 flex gap-2">
          <input
            id="migrationCode"
            name="migrationCode"
            type="text"
            required
            placeholder={t("onboarding.restorePlaceholder")}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 uppercase"
          />
          <SubmitButton variant="secondary">{t("onboarding.restoreButton")}</SubmitButton>
        </div>
      </form>
    </section>
  );
}
