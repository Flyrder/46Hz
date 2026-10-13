import { notFound } from "next/navigation";
import { moderateLetterAction, overrideLetterRiskAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { letterStatusLabels, replyTypeLabels, riskLevelLabels } from "@/lib/domain";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { FileText, ShieldAlert, Sparkles, User, Tag, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLetterDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { id } = await params;
  const letter = await prisma.letter.findUnique({
    where: { id },
    include: {
      author: true,
      replies: true
    }
  });

  if (!letter) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">편지 안전 검토</h1>
          <p className="mt-1 text-xs text-muted-foreground font-mono">ID: {letter.id}</p>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Letter Inspection Card */}
        <article className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
            <StatusBadge>{letterStatusLabels[letter.status]}</StatusBadge>
            <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
              {riskLevelLabels[letter.riskLevel]}
            </StatusBadge>
            <StatusBadge tone="neutral">{replyTypeLabels[letter.desiredReplyType]}</StatusBadge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs">
            <div>
              <dt className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-accent" />
                작성자
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {letter.author.anonymousHandle} (신뢰도 {letter.author.trustScore})
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                작성 일시
              </dt>
              <dd className="mt-1 font-medium text-foreground">{formatDate(letter.createdAt)}</dd>
            </div>
            <div className="col-span-2 pt-2 border-t border-border/40">
              <dt className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-accent" />
                감정 & 상황 태그
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {[...letter.emotionTags, ...letter.situationTags].join(", ") || "태그 없음"}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              정돈본 (Processed Text)
            </h2>
            <div className="mt-2.5 rounded-xl border border-border/80 bg-background/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {letter.processedText}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              작성 원문 (Raw Text)
            </h2>
            <div className="mt-2.5 rounded-xl border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">
              {letter.rawText}
            </div>
          </div>
        </article>

        {/* Moderation Controls Workbench */}
        <div className="space-y-5">
          <form action={moderateLetterAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
            <h2 className="text-base font-bold text-foreground">모더레이션 결정</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              편지 상태와 위험도를 결정하여 편지함 노출 여부를 조정합니다.
            </p>

            <input type="hidden" name="letterId" value={letter.id} />

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-foreground" htmlFor="status">
                  상태 (Status)
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={letter.status}
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="PENDING">검토 대기 (Pending)</option>
                  <option value="APPROVED">승인 (Approved - 또래 공개)</option>
                  <option value="REJECTED">반려 (Rejected)</option>
                  <option value="ROUTED_TO_SUPPORT">전문 지원 연결 (Routed to Support)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground" htmlFor="riskLevel">
                  위험 등급 (Risk Level)
                </label>
                <select
                  id="riskLevel"
                  name="riskLevel"
                  defaultValue={letter.riskLevel}
                  className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="NORMAL">일반 (Normal)</option>
                  <option value="SENSITIVE">주의 필요 (Sensitive)</option>
                  <option value="HIGH">위기/고위험 (High)</option>
                  <option value="BLOCKED">차단 (Blocked)</option>
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
                  placeholder="상태 변경 사유를 입력하세요 (선택 사항)"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="mt-5">
              <SubmitButton>모더레이션 저장</SubmitButton>
            </div>
          </form>

          {/* Quick Risk Override Form */}
          <form action={overrideLetterRiskAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-bold text-foreground">신속 위험도 재조정</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              긴급 상황 시 상태 변경 없이 위험 등급만 즉시 수정합니다.
            </p>

            <input type="hidden" name="letterId" value={letter.id} />

            <div className="mt-3">
              <select
                id="risk-override"
                name="riskLevel"
                defaultValue={letter.riskLevel}
                aria-label="신속 위험도 재조정 선택"
                className="w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="NORMAL">일반 (Normal)</option>
                <option value="SENSITIVE">주의 필요 (Sensitive)</option>
                <option value="HIGH">위기/고위험 (High)</option>
                <option value="BLOCKED">차단 (Blocked)</option>
              </select>
            </div>
            <input type="hidden" name="reason" value="Admin risk override from detail page" />
            <div className="mt-4">
              <SubmitButton variant="secondary">위험도 덮어쓰기</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
