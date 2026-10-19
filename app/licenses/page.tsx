import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  Type,
  Package,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  FileCode2
} from "lucide-react";
import { createTranslator, type TranslationKey } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";

export const dynamic = "force-dynamic";

const NAVER_FONT_LICENSE_URL =
  "https://help.naver.com/service/30016/contents/18088?osType=PC&lang=ko";
const GNU_AGPL_URL = "https://www.gnu.org/licenses/agpl-3.0.html";

function readAgplLicenseText(): string {
  try {
    const licensePath = path.join(process.cwd(), "LICENSE");
    return fs.readFileSync(licensePath, "utf8");
  } catch {
    return "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007 — https://www.gnu.org/licenses/agpl-3.0.html";
  }
}

export default async function LicensesPage() {
  const locale = await getLocalePreference();
  const t = createTranslator(locale);
  const agplFullText = readAgplLicenseText();

  const libraries: Array<{
    name: string;
    version: string;
    license: string;
    descKey: TranslationKey;
    url: string;
  }> = [
    {
      name: "Next.js (next)",
      version: "16.4.0",
      license: "MIT",
      descKey: "license.libNextDesc",
      url: "https://github.com/vercel/next.js"
    },
    {
      name: "React & React DOM (react, react-dom)",
      version: "19.3.0",
      license: "MIT",
      descKey: "license.libReactDesc",
      url: "https://github.com/facebook/react"
    },
    {
      name: "Prisma ORM (prisma, @prisma/orm-postgres)",
      version: "8.0.0-rc.23 / 8.0.0-rc.18",
      license: "Apache-2.0",
      descKey: "license.libPrismaDesc",
      url: "https://github.com/prisma/prisma"
    },
    {
      name: "node-postgres (pg)",
      version: "8.23.1",
      license: "MIT",
      descKey: "license.libPgDesc",
      url: "https://github.com/brianc/node-postgres"
    },
    {
      name: "Zod (zod)",
      version: "4.6.6",
      license: "MIT",
      descKey: "license.libZodDesc",
      url: "https://github.com/colinhacks/zod"
    },
    {
      name: "Lucide Icons (lucide-react)",
      version: "1.55.0",
      license: "ISC",
      descKey: "license.libLucideDesc",
      url: "https://github.com/lucide-icons/lucide"
    },
    {
      name: "Tailwind CSS & PostCSS (tailwindcss, @tailwindcss/postcss, postcss)",
      version: "4.3.3 / 8.4.49",
      license: "MIT",
      descKey: "license.libTailwindDesc",
      url: "https://github.com/tailwindlabs/tailwindcss"
    },
    {
      name: "TypeScript (typescript)",
      version: "7.0.2",
      license: "Apache-2.0",
      descKey: "license.libTypescriptDesc",
      url: "https://github.com/microsoft/TypeScript"
    },
    {
      name: "Vitest & tsx (vitest, tsx)",
      version: "5.0.4 / 4.23.15",
      license: "MIT",
      descKey: "license.libVitestDesc",
      url: "https://github.com/vitest-dev/vitest"
    }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-2">
      {/* Top Navigation & Header */}
      <section className="stationery-paper animate-entry p-6 sm:p-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("license.backHome")}</span>
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent mb-3">
          <Scale className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("license.badge")}</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t("license.title")}
        </h1>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
          {t("license.subtitle")}
        </p>
      </section>

      {/* Section 1: NAVER Font Copyright & License Notice */}
      <section
        aria-labelledby="font-license-heading"
        className="stationery-paper animate-entry p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
              <Type className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2
              id="font-license-heading"
              className="text-xl font-bold tracking-tight text-foreground"
            >
              {t("license.fontSectionTitle")}
            </h2>
          </div>

          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {t("license.fontSectionBadge")}
          </span>
        </div>

        {/* Attribution Highlight Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent/5 p-4 text-xs sm:text-sm text-foreground font-medium">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t("license.fontAttributionBanner")}</span>
        </div>

        {/* Live Font Pairing Showcase */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* NanumSquareRound (UI) */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs">
            <div className="text-sm font-bold text-foreground">
              {t("license.fontUiTitle")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("license.fontUiRole")}
            </p>
            <div className="mt-3.5 rounded-xl border border-border/60 bg-background/60 p-3.5 text-sm font-medium text-foreground">
              {t("license.fontUiSample")}
            </div>
          </div>

          {/* MaruBuri (Letter & Reply) */}
          <div className="rounded-2xl border border-accent/30 bg-surface p-5 shadow-2xs">
            <div className="font-letter text-sm font-bold text-foreground">
              {t("license.fontLetterTitle")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("license.fontLetterRole")}
            </p>
            <div className="mt-3.5 font-letter rounded-xl border border-accent/25 bg-accent/5 p-3.5 text-sm leading-relaxed text-foreground">
              {t("license.fontLetterSample")}
            </div>
          </div>
        </div>

        {/* Official NAVER Font Copyright Notice Paragraphs */}
        <div className="rounded-2xl border border-border/75 bg-muted/20 p-5 sm:p-6 space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>{t("license.fontNoticeP1")}</p>
          <p>{t("license.fontNoticeP2")}</p>
          <p>{t("license.fontNoticeP3")}</p>
          <p className="font-medium text-foreground/90">{t("license.fontNoticeP4")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end">
          <a
            href={NAVER_FONT_LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-bold text-accent hover:bg-accent/15 transition-colors"
          >
            <span>{t("license.fontOfficialLinkLabel")}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Section 2: 46Hz Core Software License (GNU AGPLv3) */}
      <section
        aria-labelledby="agpl-license-heading"
        className="stationery-paper animate-entry p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2
              id="agpl-license-heading"
              className="text-xl font-bold tracking-tight text-foreground"
            >
              {t("license.agplSectionTitle")}
            </h2>
          </div>

          <span className="rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-xs font-semibold text-foreground">
            {t("license.agplSectionBadge")}
          </span>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {t("license.agplSummary")}
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/75 bg-surface p-4">
            <h3 className="text-xs font-bold text-foreground">
              {t("license.agplTerm1Title")}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t("license.agplTerm1Desc")}
            </p>
          </div>

          <div className="rounded-xl border border-border/75 bg-surface p-4">
            <h3 className="text-xs font-bold text-foreground">
              {t("license.agplTerm2Title")}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t("license.agplTerm2Desc")}
            </p>
          </div>

          <div className="rounded-xl border border-border/75 bg-surface p-4">
            <h3 className="text-xs font-bold text-foreground">
              {t("license.agplTerm3Title")}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t("license.agplTerm3Desc")}
            </p>
          </div>
        </div>

        {/* Expandable Verbatim GNU AGPLv3 Full Text */}
        <details className="group rounded-2xl border border-border/80 bg-muted/20 overflow-hidden">
          <summary className="flex min-h-[48px] cursor-pointer items-center justify-between gap-2 px-5 py-3 text-xs font-bold text-foreground hover:bg-muted/40 transition-colors">
            <span className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{t("license.agplViewFullText")}</span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              GNU AGPLv3
            </span>
          </summary>
          <div className="border-t border-border/60 bg-background/80 p-5">
            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-muted-foreground">
              {agplFullText}
            </pre>
          </div>
        </details>

        <div className="flex flex-wrap items-center justify-end">
          <a
            href={GNU_AGPL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>{t("license.agplExternalLink")}</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Section 3: Open-Source Libraries & Tools */}
      <section
        aria-labelledby="libs-license-heading"
        className="stationery-paper animate-entry p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
              <Package className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="libs-license-heading"
                className="text-xl font-bold tracking-tight text-foreground"
              >
                {t("license.libsSectionTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("license.libsSectionDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-surface">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/40 text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t("license.tablePackage")}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t("license.tableVersion")}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t("license.tableLicense")}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t("license.tableRole")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {libraries.map((lib) => (
                <tr key={lib.name} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-foreground">
                    <a
                      href={lib.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-accent hover:underline underline-offset-4"
                    >
                      <span>{lib.name}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground/70 shrink-0" aria-hidden="true" />
                    </a>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    {lib.version}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-accent">
                      {lib.license}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground leading-relaxed">
                    {t(lib.descKey)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
