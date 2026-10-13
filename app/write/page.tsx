import { LetterEditor } from "@/components/letter-editor";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WritePage() {
  const [, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);

  return (
    <section className="mx-auto max-w-2xl py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("write.title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("write.subtitle")}
        </p>
      </div>

      <LetterEditor
        locale={locale}
        labels={{
          title: t("write.title"),
          subtitle: t("write.subtitle"),
          label: t("write.label"),
          placeholder: t("write.placeholder"),
          review: t("write.review")
        }}
      />
    </section>
  );
}
