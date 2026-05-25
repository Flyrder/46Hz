import { redirect } from "next/navigation";
import { createAnonymousSessionAction } from "@/app/actions/onboarding";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTranslator, localeOptions } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocalePreference()]);
  if (user) {
    redirect("/write");
  }
  const t = createTranslator(locale);

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold">{t("onboarding.title")}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("onboarding.subtitle")}
      </p>
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
            <label className="rounded-lg border border-border p-3 text-sm">
              <input className="mr-2" type="radio" name="ageRange" value="UNDER_18" required />
              {t("age.under18")}
            </label>
            <label className="rounded-lg border border-border p-3 text-sm">
              <input className="mr-2" type="radio" name="ageRange" value="ADULT" defaultChecked />
              {t("age.adult")}
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
    </section>
  );
}
