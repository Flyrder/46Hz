import Link from "next/link";
import { Inbox, PenLine } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const steps = ["home.step1", "home.step2", "home.step3", "home.step4"];

  return (
    <section className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="py-8">
        <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          {t("home.body")}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={user ? "/write" : "/onboarding"} className={buttonVariants("primary")}>
            <PenLine className="h-4 w-4" aria-hidden="true" />
            {t("home.write")}
          </Link>
          <Link href="/inbox" className={buttonVariants("secondary")}>
            <Inbox className="h-4 w-4" aria-hidden="true" />
            {t("home.openInbox")}
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
        <div className="border-b border-border pb-4 text-sm font-semibold text-muted-foreground">
          {t("home.stepsTitle")}
        </div>
        <div className="space-y-4 pt-4">
          {steps.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm">{t(item)}</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
