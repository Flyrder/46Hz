import { notFound } from "next/navigation";
import { moderateReplyAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { Sparkles, FileText, Mail, User, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReplyDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { id } = await params;
  const reply = await prisma.reply.findUnique({
    where: { id },
    include: {
      letter: true,
      responder: true
    }
  });

  if (!reply) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">답장 안전 검토</h1>
          <p className="mt-1 text-xs text-muted-foreground font-mono">ID: {reply.id}</p>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Reply Content Article */}
        <article className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <StatusBadge>{reply.status.toUpperCase()}</StatusBadge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(reply.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5 text-accent" />
              <span className="font-medium text-foreground">{reply.responder.anonymousHandle}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                신뢰도 {reply.responder.trustScore}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              코칭된 최종 답장 (Coached Reply)
            </h2>
            <div className="mt-2.5 rounded-xl border border-border/80 bg-background/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {reply.coachedText}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              응답자 원문 (Raw Reply)
            </h2>
            <div className="mt-2.5 rounded-xl border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">
              {reply.rawText}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-accent" />
              원문 편지 맥락 (Letter Context)
            </h2>
            <div className="mt-2.5 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {reply.letter.processedText}
            </div>
          </div>
        </article>

        {/* Moderation Actions Form */}
        <div>
          <form action={moderateReplyAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
            <h2 className="text-base font-bold text-foreground">답장 승인/반려 결정</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              답장이 승인되면 작성자의 받은 편지함에 안전하게 전달됩니다.
            </p>

            <input type="hidden" name="replyId" value={reply.id} />

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-foreground" htmlFor="status">
                  상태 (Status)
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={reply.status}
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="PENDING">검토 대기 (Pending)</option>
                  <option value="APPROVED">승인 (Approved - 작성자 전달)</option>
                  <option value="REJECTED">반려 (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground" htmlFor="reason">
                  검토 사유 (감사 로그 기록)
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  placeholder="반려 또는 승인 특이사항을 입력하세요 (선택 사항)"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="mt-5">
              <SubmitButton>모더레이션 저장</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
