import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { generateIncidentPacket } from "@/lib/compliance/incident-packet";
import { prisma } from "@/lib/db";
import { maskIp, type IpRecord } from "@/lib/ip";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { ShieldAlert, FileText, Scale, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCompliancePage({
  searchParams
}: {
  searchParams?: Promise<{ targetId?: string; targetType?: string; warrant?: string }>;
}) {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);

  const resolvedParams = searchParams ? await searchParams : undefined;
  const targetId = resolvedParams?.targetId;
  const targetType = resolvedParams?.targetType === "REPLY" ? "REPLY" : "LETTER";
  const isWarrant = resolvedParams?.warrant === "1";

  // Generate packet if targetId is specified
  const generatedPacket = targetId
    ? await generateIncidentPacket(targetId, targetType, isWarrant)
    : null;

  // Retrieve flagged or high-risk incidents for inspection
  const [flaggedLetters, flaggedReplies] = await Promise.all([
    prisma.letter.findMany({
      where: {
        OR: [{ riskLevel: "HIGH" }, { riskLevel: "BLOCKED" }, { status: "ROUTED_TO_SUPPORT" }]
      },
      include: {
        author: { select: { anonymousHandle: true, recentIps: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.reply.findMany({
      where: {
        status: "REJECTED"
      },
      include: {
        responder: { select: { anonymousHandle: true, recentIps: true } },
        letter: { select: { id: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.complianceTitle")}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              법적 요청(압수수색 등) 대응 및 보안 감사를 위한 엄격한 데이터 최소화 규정 준수 관리
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      {/* Data Minimization Principle Charter */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2 text-base font-bold text-foreground">
          <Scale className="h-5 w-5 text-accent" aria-hidden="true" />
          <span>46Hz 데이터 최소화 및 사법 공조 표준 (Data Minimization Standard)</span>
        </div>
        <div className="mt-4 grid gap-3 text-xs leading-5 text-muted-foreground sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="font-bold text-foreground block text-sm mb-1">Zero PII (개인식별정보 부존재)</span>
            <p>
              실명, 주민등록번호, 연락처, 이메일, 비밀번호, 기기 고유식별값(UDID) 등을 수집하거나 저장하지 않습니다.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="font-bold text-foreground block text-sm mb-1">14일 롤링 보관 및 자동 파기</span>
            <p>
              보안 및 방화벽 IP 접속 기록은 최대 5개 항목으로 한정되며, 14일 경과 시 데이터베이스에서 영구 소멸합니다.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="font-bold text-foreground block text-sm mb-1">SHA-256 증거 무결성 해시</span>
            <p>
              사법기관 제출용 인시던트 패킷은 SHA-256 암호화 해시를 포함하여 위변조 없는 증거 연속성을 보장합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Generated Packet Inspection View */}
      {generatedPacket ? (
        <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/5 p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
              <span>사법 공조 패킷: {generatedPacket.packetHeader.packetId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/compliance"
                className="rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                검사 닫기
              </Link>
            </div>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-muted-foreground">
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">대상 유형</span>
                {generatedPacket.incident.targetType}
              </div>
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">작성자 가명</span>
                {generatedPacket.incident.authorPseudonym}
              </div>
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">분류 등급</span>
                {generatedPacket.incident.riskClassification}
              </div>
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">생성 일시</span>
                {formatDate(generatedPacket.packetHeader.generatedAt)}
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">
                SHA-256 증거 무결성 해시
              </span>
              <code className="block rounded-lg border border-border/60 bg-background p-2.5 font-mono text-[11px] text-accent break-all">
                {generatedPacket.incident.contentHashSha256}
              </code>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">
                클라이언트 접속 원본 추적 ({generatedPacket.networkOrigin.retentionPolicy})
              </span>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {generatedPacket.networkOrigin.maskedTrace.map((trace, idx) => {
                  const ua = generatedPacket.networkOrigin.userAgentTrace[idx] ?? "No UA";
                  return (
                    <li key={idx}>
                      <span className="font-medium text-foreground">{trace}</span> — <span className="text-[11px] font-mono">{ua}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">
                원시 JSON 증거 패킷
              </span>
              <pre className="max-h-60 overflow-auto rounded-xl border border-border/60 bg-background p-3 text-[11px] leading-5 text-foreground font-mono">
                {JSON.stringify(generatedPacket, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}

      {/* Flagged Incidents List */}
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-4 w-4 text-danger" aria-hidden="true" />
            <span>고위험 편지 인시던트 (High-Risk Letters)</span>
          </h2>
          <div className="mt-3 space-y-3">
            {flaggedLetters.map((letter) => {
              const ips = Array.isArray(letter.author.recentIps)
                ? (letter.author.recentIps as unknown as IpRecord[])
                : [];
              const latest = ips.length > 0 ? ips[ips.length - 1] : undefined;
              const latestIp = latest ? maskIp(latest.ip) : "No trace";
              const clientInfo = latest?.browser ? `${latest.browser} on ${latest.os ?? "OS"}` : undefined;

              return (
                <article
                  key={letter.id}
                  className="rounded-2xl border border-border/80 bg-surface p-4.5 shadow-soft flex flex-wrap items-center justify-between gap-3 transition-all hover:border-accent/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="danger">{letter.riskLevel}</StatusBadge>
                      <StatusBadge>{letter.status}</StatusBadge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(letter.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground line-clamp-1 max-w-xl font-mono">
                      {letter.rawText}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      작성자: <span className="font-medium text-foreground">{letter.author.anonymousHandle}</span> | 마스킹 접속지: {latestIp} {clientInfo ? `(${clientInfo})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/compliance?targetId=${letter.id}&targetType=LETTER`}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>증거 패킷 추출</span>
                    </Link>
                    <Link
                      href={`/admin/letters/${letter.id}`}
                      className="inline-flex min-h-[36px] items-center rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      검토
                    </Link>
                  </div>
                </article>
              );
            })}
            {flaggedLetters.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-2xl border border-dashed border-border/80 bg-surface/50 p-6 text-center">
                기록된 고위험 편지가 없습니다.
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <span>반려 및 이상 답장 인시던트 (Moderated / Rejected Replies)</span>
          </h2>
          <div className="mt-3 space-y-3">
            {flaggedReplies.map((reply) => {
              const ips = Array.isArray(reply.responder.recentIps)
                ? (reply.responder.recentIps as unknown as IpRecord[])
                : [];
              const latest = ips.length > 0 ? ips[ips.length - 1] : undefined;
              const latestIp = latest ? maskIp(latest.ip) : "No trace";
              const clientInfo = latest?.browser ? `${latest.browser} on ${latest.os ?? "OS"}` : undefined;

              return (
                <article
                  key={reply.id}
                  className="rounded-2xl border border-border/80 bg-surface p-4.5 shadow-soft flex flex-wrap items-center justify-between gap-3 transition-all hover:border-accent/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="danger">{reply.status}</StatusBadge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground line-clamp-1 max-w-xl font-mono">
                      {reply.rawText}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      응답자: <span className="font-medium text-foreground">{reply.responder.anonymousHandle}</span> | 마스킹 접속지: {latestIp} {clientInfo ? `(${clientInfo})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/compliance?targetId=${reply.id}&targetType=REPLY`}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>증거 패킷 추출</span>
                    </Link>
                    <Link
                      href={`/admin/replies/${reply.id}`}
                      className="inline-flex min-h-[36px] items-center rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      검토
                    </Link>
                  </div>
                </article>
              );
            })}
            {flaggedReplies.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-2xl border border-dashed border-border/80 bg-surface/50 p-6 text-center">
                기록된 반려 답장이 없습니다.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
