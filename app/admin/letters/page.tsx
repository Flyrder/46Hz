import { AdminNav } from "@/components/admin-nav";
import { LetterCard } from "@/components/letter-card";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLettersPage() {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);

  const letters = await prisma.letter.findMany({
    where: { status: { in: ["PENDING", "ROUTED_TO_SUPPORT"] } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 50
  });

  return (
    <section className="mx-auto max-w-4xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Mail className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.lettersTitle")}</h1>
              <StatusBadge tone={letters.length > 0 ? "warning" : "good"}>
                {letters.length}건
              </StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              안전 라우팅 및 또래 공개 전 신뢰성 검토 대기 목록입니다.
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      <div className="space-y-4">
        {letters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} href={`/admin/letters/${letter.id}`} mode="admin" />
        ))}
        {letters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/60 p-10 text-center text-sm text-muted-foreground shadow-soft">
            {t("admin.noPendingLetters")}
          </div>
        ) : null}
      </div>
    </section>
  );
}
