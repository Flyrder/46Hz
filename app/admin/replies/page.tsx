import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate, excerpt } from "@/lib/utils";
import { MessageSquare, ArrowRight, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRepliesPage() {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);

  const replies = await prisma.reply.findMany({
    where: { status: "PENDING" },
    include: { letter: true, responder: true },
    orderBy: { createdAt: "asc" },
    take: 50
  });

  return (
    <section className="mx-auto max-w-4xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.repliesTitle")}</h1>
              <StatusBadge tone={replies.length > 0 ? "warning" : "good"}>
                {replies.length}건
              </StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              동료 응답자가 작성한 코칭 답장의 온기와 안전성을 검토합니다.
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      <div className="space-y-3.5">
        {replies.map((reply) => (
          <Link
            key={reply.id}
            href={`/admin/replies/${reply.id}`}
            className="group block rounded-2xl border border-border/80 bg-surface p-5 shadow-soft transition-all hover:border-accent/40 hover:shadow-tactile"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <StatusBadge tone="warning">검토 대기 (PENDING)</StatusBadge>
                <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5 text-accent" />
                <span>{reply.responder.anonymousHandle}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                  신뢰도 {reply.responder.trustScore}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground">
              {excerpt(reply.coachedText)}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="line-clamp-1 italic text-muted-foreground/80">
                원문 편지: &quot;{excerpt(reply.letter.processedText, 60)}&quot;
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                검토하기 <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}

        {replies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/60 p-10 text-center text-sm text-muted-foreground shadow-soft">
            {t("admin.noPendingReplies")}
          </div>
        ) : null}
      </div>
    </section>
  );
}
