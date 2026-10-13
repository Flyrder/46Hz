import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { generateIncidentPacket } from "@/lib/compliance/incident-packet";
import { prisma } from "@/lib/db";
import { maskIp, type IpRecord } from "@/lib/ip";
import { formatDate } from "@/lib/utils";
import { ShieldAlert, FileText, CheckCircle, Scale, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCompliancePage({
  searchParams
}: {
  searchParams?: Promise<{ targetId?: string; targetType?: string; warrant?: string }>;
}) {
  const role = await requireStaff();
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
    <section className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Compliance & Law Enforcement</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Strict data minimization management for legal requests and safety audits.
          </p>
        </div>
      </div>

      <AdminNav role={role} />

      {/* Data Minimization Principle Charter */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Scale className="h-5 w-5 text-accent" aria-hidden="true" />
          <span>46Hz Data Minimization Principle (Law Enforcement Standard)</span>
        </div>
        <div className="mt-3 grid gap-3 text-xs leading-5 text-muted-foreground sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <span className="font-semibold text-foreground">Zero PII Collected</span>
            <p className="mt-1">
              No real names, phone numbers, email addresses, passwords, physical addresses, or device IDs are ever requested or stored.
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <span className="font-semibold text-foreground">14-Day Rolling Horizon</span>
            <p className="mt-1">
              IP connection traces are strictly capped at max 5 entries and automatically pruned after 14 days unless sealed for compliance.
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <span className="font-semibold text-foreground">Cryptographic Evidence</span>
            <p className="mt-1">
              All exported incident packets contain SHA-256 content hashes to prove tamper-free chain of custody for official legal requests.
            </p>
          </div>
        </div>
      </div>

      {/* Generated Packet Inspection View */}
      {generatedPacket ? (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/5 p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
              <span>Compliance Packet: {generatedPacket.packetHeader.packetId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/compliance"
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Clear Inspection
              </Link>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground block">Target Type</span>
                {generatedPacket.incident.targetType}
              </div>
              <div>
                <span className="font-semibold text-foreground block">Author Pseudonym</span>
                {generatedPacket.incident.authorPseudonym}
              </div>
              <div>
                <span className="font-semibold text-foreground block">Classification</span>
                {generatedPacket.incident.riskClassification}
              </div>
              <div>
                <span className="font-semibold text-foreground block">Generated At</span>
                {formatDate(generatedPacket.packetHeader.generatedAt)}
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">
                SHA-256 Evidentiary Hash
              </span>
              <code className="block rounded bg-background p-2 font-mono text-[11px] text-accent break-all">
                {generatedPacket.incident.contentHashSha256}
              </code>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">
                Client Browser & Origin Trace ({generatedPacket.networkOrigin.retentionPolicy})
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
                Raw JSON Incident Packet
              </span>
              <pre className="max-h-60 overflow-auto rounded bg-background p-3 text-[11px] leading-5 text-foreground font-mono">
                {JSON.stringify(generatedPacket, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}

      {/* Flagged Incidents List */}
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-danger" aria-hidden="true" />
            <span>High-Risk Incidents (Letters)</span>
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
                  className="rounded-lg border border-border bg-surface p-4 shadow-soft flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="danger">{letter.riskLevel}</StatusBadge>
                      <StatusBadge>{letter.status}</StatusBadge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(letter.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground line-clamp-1 max-w-xl">
                      {letter.rawText}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Author: <span className="font-medium">{letter.author.anonymousHandle}</span> | Masked Origin: {latestIp} {clientInfo ? `(${clientInfo})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/compliance?targetId=${letter.id}&targetType=LETTER`}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Export Packet</span>
                    </Link>
                    <Link
                      href={`/admin/letters/${letter.id}`}
                      className="inline-flex min-h-[36px] items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Review
                    </Link>
                  </div>
                </article>
              );
            })}
            {flaggedLetters.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-lg border border-border bg-surface p-4">
                No high-risk letters recorded.
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <span>Moderated / Rejected Replies</span>
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
                  className="rounded-lg border border-border bg-surface p-4 shadow-soft flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="danger">{reply.status}</StatusBadge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground line-clamp-1 max-w-xl">
                      {reply.rawText}
                    </p>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Responder: <span className="font-medium">{reply.responder.anonymousHandle}</span> | Masked Origin: {latestIp} {clientInfo ? `(${clientInfo})` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/compliance?targetId=${reply.id}&targetType=REPLY`}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Export Packet</span>
                    </Link>
                    <Link
                      href={`/admin/replies/${reply.id}`}
                      className="inline-flex min-h-[36px] items-center rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      Review
                    </Link>
                  </div>
                </article>
              );
            })}
            {flaggedReplies.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-lg border border-border bg-surface p-4">
                No rejected replies recorded.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
