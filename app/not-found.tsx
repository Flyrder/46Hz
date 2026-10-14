import Link from "next/link";
import { MailQuestion, Home, Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";

export default async function NotFound() {
  const locale = await getLocalePreference();
  const t = createTranslator(locale);

  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-border/80 bg-surface/90 p-8 sm:p-10 shadow-soft text-center animate-in fade-in duration-200">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-5">
        <MailQuestion className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="inline-block rounded-full bg-muted/70 px-3 py-1 font-mono text-xs font-semibold text-muted-foreground">
        404 Not Found
      </span>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        {t("notfound.title")}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t("notfound.desc")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/inbox" className={buttonVariants("primary")}>
          <Inbox className="h-4 w-4" aria-hidden="true" />
          <span>{t("notfound.returnInbox")}</span>
        </Link>
        <Link href="/" className={buttonVariants("secondary")}>
          <Home className="h-4 w-4" aria-hidden="true" />
          <span>{t("notfound.returnHome")}</span>
        </Link>
      </div>
    </section>
  );
}
