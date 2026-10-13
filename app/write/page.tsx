import { processLetterAction } from "@/app/actions/letters";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WritePage() {
  const [, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold">{t("write.title")}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("write.subtitle")}
      </p>
      <form action={processLetterAction} className="mt-6 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <label className="text-sm font-semibold" htmlFor="rawText">
          {t("write.label")}
        </label>
        <textarea
          id="rawText"
          name="rawText"
          rows={14}
          required
          aria-required="true"
          minLength={40}
          className="mt-3 w-full resize-y rounded-lg border border-border bg-background p-4 text-base leading-7 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder={t("write.placeholder")}
        />
        <div className="mt-4 flex justify-end">
          <SubmitButton>{t("write.review")}</SubmitButton>
        </div>
      </form>
    </section>
  );
}
