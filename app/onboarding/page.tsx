import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { Sparkles, KeyRound, ShieldCheck } from "lucide-react";
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
    <section className="mx-auto max-w-xl py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("onboarding.title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("onboarding.subtitle")}
        </p>
      </div>

      {showError && (
        <p className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger animate-in fade-in slide-in-from-top-1 duration-200">
          {t("onboarding.errorInvalidCode")}
        </p>
      )}

      {/* Form 1: Create Anonymous Session */}
      <form action={createAnonymousSessionAction} className="rounded-2xl border border-border/85 bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
          <ShieldCheck className="h-4.5 w-4.5 text-accent" />
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t("onboarding.startSession")}
          </h2>
        </div>

        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5" htmlFor="language">
          {t("language.label")}
        </label>
        <select
          id="language"
          name="language"
          defaultValue={locale}
          className="w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-3 text-sm outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25"
        >
          {localeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <fieldset className="mt-5">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t("onboarding.ageRange")}
          </legend>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="rounded-xl border border-border/70 bg-background/40 p-3 text-xs sm:text-sm font-medium cursor-pointer hover:border-accent/40 hover:bg-muted/30 transition-all flex items-center">
              <input className="mr-2.5 accent-accent h-4 w-4" type="radio" name="ageRange" value="UNDER_18" required />
              {t("age.under18")}
            </label>
            <label className="rounded-xl border border-border/70 bg-background/40 p-3 text-xs sm:text-sm font-medium cursor-pointer hover:border-accent/40 hover:bg-muted/30 transition-all flex items-center">
              <input className="mr-2.5 accent-accent h-4 w-4" type="radio" name="ageRange" value="ADULT" defaultChecked />
              {t("age.adult")}
            </label>
          </div>
        </fieldset>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5" htmlFor="preferredReplyType">
          {t("onboarding.replyPreference")}
        </label>
        <select
          id="preferredReplyType"
          name="preferredReplyType"
          defaultValue="COMFORT"
          className="w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-3 text-sm outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25"
        >
          <option value="COMFORT">{t("replyType.COMFORT")}</option>
          <option value="ADVICE">{t("replyType.ADVICE")}</option>
          <option value="SIMILAR_EXPERIENCES">{t("replyType.SIMILAR_EXPERIENCES")}</option>
          <option value="JUST_BEING_HEARD">{t("replyType.JUST_BEING_HEARD")}</option>
        </select>

        <div className="mt-6 pt-2">
          <SubmitButton>{t("onboarding.create")}</SubmitButton>
        </div>
      </form>

      {/* Form 2: Restore Session via Migration Code */}
      <form action={restoreSessionAction} className="mt-6 rounded-2xl border border-border/85 bg-surface p-6 sm:p-8 shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-3">
          <KeyRound className="h-4.5 w-4.5 text-accent" />
          <h2 className="text-base font-semibold tracking-tight text-foreground">{t("onboarding.restoreTitle")}</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("onboarding.restoreHelp")}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <input
            id="migrationCode"
            name="migrationCode"
            type="text"
            required
            placeholder={t("onboarding.restorePlaceholder")}
            className="flex-1 rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-mono tracking-wider outline-none transition-all focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/25 uppercase placeholder:font-sans placeholder:tracking-normal"
          />
          <SubmitButton variant="secondary">{t("onboarding.restoreButton")}</SubmitButton>
        </div>
      </form>
    </section>
  );
}
