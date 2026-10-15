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
              {t("admin.complianceSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} />

      {/* Data Minimization Principle Charter */}
      <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2 text-base font-bold text-foreground">
          <Scale className="h-5 w-5 text-accent" aria-hidden="true" />
          <span>{t("admin.complianceCharterTitle")}</span>
        </div>
        <div className="mt-4 grid gap-3 text-xs leading-5 text-muted-foreground sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="font-bold text-foreground block text-sm mb-1">{t("admin.complianceZeroPiiTitle")}</span>
            <p>
              {t("admin.complianceZeroPiiDesc")}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="font-bold text-foreground block text-sm mb-1">{t("admin.compliance14DayTitle")}</span>
            <p>
              {t("admin.compliance14DayDesc")}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="font-bold text-foreground block text-sm mb-1">{t("admin.complianceHashTitle")}</span>
            <p>
              {t("admin.complianceHashDesc")}
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
              <span>{t("admin.compliancePacketTitle")} {generatedPacket.packetHeader.packetId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/compliance"
                className="rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                {t("admin.complianceClosePacket")}
              </Link>
            </div>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-muted-foreground">
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">{t("admin.complianceTargetType")}</span>
                {generatedPacket.incident.targetType}
              </div>
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">{t("admin.complianceAuthorPseudonym")}</span>
                {generatedPacket.incident.authorPseudonym}
              </div>
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">{t("admin.complianceRiskClassification")}</span>
                {generatedPacket.incident.riskClassification}
              </div>
              <div className="rounded-lg bg-surface/80 p-2.5 border border-border/50">
                <span className="font-semibold text-foreground block">{t("admin.complianceGeneratedAt")}</span>
                {formatDate(generatedPacket.packetHeader.generatedAt)}
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">
                {t("admin.complianceSha256Header")}
              </span>
              <code className="block rounded-lg border border-border/60 bg-background p-2.5 font-mono text-[11px] text-accent break-all">
                {generatedPacket.incident.contentHashSha256}
              </code>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">
                {t("admin.complianceClientOriginHeader", { policy: generatedPacket.networkOrigin.retentionPolicy })}
              </span>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {generatedPacket.networkOrigin.maskedTrace.map((trace, idx) => {
                  const ua = generatedPacket.networkOrigin.userAgentTrace[idx] ?? t("admin.noUserAgent");
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
                {t("admin.complianceRawJsonHeader")}
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
            <span>{t("admin.complianceHighRiskLettersTitle")}</span>
          </h2>
          <div className="mt-3 space-y-3">
            {flaggedLetters.map((letter) => {
              const ips = Array.isArray(letter.author.recentIps)
                ? (letter.author.recentIps as unknown as IpRecord[])
                : [];
              const latest = ips.length > 0 ? ips[ips.length - 1] : undefined;
              const latestIp = latest ? maskIp(latest.ip) : t("admin.noTrace");
              const clientInfo = latest?.browser ? `${latest.browser} on ${latest.os ?? "OS"}` : undefined;

              return (
                <article
                  key={letter.id}
                  className="rounded-2xl border border-border/80 bg-surface p-4.5 shadow-soft flex flex-wrap items-center justify-between gap-3 transition-all hover:border-accent/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="danger">{t(`status.${letter.riskLevel}` as const)}</StatusBadge>
                      <StatusBadge>{t(`status.${letter.status}` as const)}</StatusBadge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(letter.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground line-clamp-1 max-w-xl font-mono">
                      {letter.rawText}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {t("admin.authorLabel")}: <span className="font-medium text-foreground">{letter.author.anonymousHandle}</span> | {t("admin.complianceMaskedOrigin")} {latestIp} {clientInfo ? `(${clientInfo})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/compliance?targetId=${letter.id}&targetType=LETTER`}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t("admin.complianceExtractPacket")}</span>
                    </Link>
                    <Link
                      href={`/admin/letters/${letter.id}`}
                      className="inline-flex min-h-[36px] items-center rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      {t("admin.complianceReview")}
                    </Link>
                  </div>
                </article>
              );
            })}
            {flaggedLetters.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-2xl border border-dashed border-border/80 bg-surface/50 p-6 text-center">
                {t("admin.complianceNoHighRiskLetters")}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <span>{t("admin.complianceModeratedRepliesTitle")}</span>
          </h2>
          <div className="mt-3 space-y-3">
            {flaggedReplies.map((reply) => {
              const ips = Array.isArray(reply.responder.recentIps)
                ? (reply.responder.recentIps as unknown as IpRecord[])
                : [];
              const latest = ips.length > 0 ? ips[ips.length - 1] : undefined;
              const latestIp = latest ? maskIp(latest.ip) : t("admin.noTrace");
              const clientInfo = latest?.browser ? `${latest.browser} on ${latest.os ?? "OS"}` : undefined;

              return (
                <article
                  key={reply.id}
                  className="rounded-2xl border border-border/80 bg-surface p-4.5 shadow-soft flex flex-wrap items-center justify-between gap-3 transition-all hover:border-accent/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="danger">{t(`status.${reply.status}` as const)}</StatusBadge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground line-clamp-1 max-w-xl font-mono">
                      {reply.rawText}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {t("admin.complianceResponderPrefix")} <span className="font-medium text-foreground">{reply.responder.anonymousHandle}</span> | {t("admin.complianceMaskedOrigin")} {latestIp} {clientInfo ? `(${clientInfo})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/compliance?targetId=${reply.id}&targetType=REPLY`}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t("admin.complianceExtractPacket")}</span>
                    </Link>
                    <Link
                      href={`/admin/replies/${reply.id}`}
                      className="inline-flex min-h-[36px] items-center rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      {t("admin.complianceReview")}
                    </Link>
                  </div>
                </article>
              );
            })}
            {flaggedReplies.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-2xl border border-dashed border-border/80 bg-surface/50 p-6 text-center">
                {t("admin.complianceNoModeratedReplies")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
