import { createAccountAction, signInAction } from "@/app/actions/account";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const [user, locale, params] = await Promise.all([
    getCurrentUser(),
    getLocalePreference(),
    searchParams
  ]);
  const t = createTranslator(locale);
  const isCreateMode = params.mode !== "signin";

  return (
    <section className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-semibold">{t("account.title")}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isCreateMode ? t("account.createHelp") : t("account.signInHelp")}
        </p>
        {params.error ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {params.error === "exists" ? t("account.errorExists") : t("account.errorInvalid")}
          </p>
        ) : null}
      </div>

      <div className="space-y-5">
        <form action={createAccountAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-lg font-semibold">{t("account.create")}</h2>
          <label className="mt-5 block text-sm font-semibold" htmlFor="create-email">
            {t("account.email")}
          </label>
          <input
            id="create-email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <label className="mt-4 block text-sm font-semibold" htmlFor="create-display-name">
            {t("account.handle")}
          </label>
          <input
            id="create-display-name"
            name="displayName"
            type="text"
            defaultValue={user?.anonymousHandle ?? ""}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <label className="mt-4 block text-sm font-semibold" htmlFor="create-password">
            {t("account.password")}
          </label>
          <input
            id="create-password"
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-5">
            <SubmitButton>{t("account.create")}</SubmitButton>
          </div>
        </form>

        <form action={signInAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-lg font-semibold">{t("account.signIn")}</h2>
          <label className="mt-5 block text-sm font-semibold" htmlFor="signin-email">
            {t("account.email")}
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <label className="mt-4 block text-sm font-semibold" htmlFor="signin-password">
            {t("account.password")}
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-5">
            <SubmitButton variant="secondary">{t("account.signIn")}</SubmitButton>
          </div>
        </form>
      </div>
    </section>
  );
}
