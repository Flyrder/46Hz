import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { databaseDate } from "@/lib/dates";
import { maskIp, type IpRecord } from "@/lib/ip";
import { complianceSettings } from "@/settings";

export type ComplianceIncidentPacket = {
  packetHeader: {
    protocolVersion: typeof complianceSettings.protocolVersion;
    packetId: string;
    generatedAt: string;
    legalBasis: string;
    dataMinimizationNotice: string;
  };
  incident: {
    targetType: "LETTER" | "REPLY";
    targetId: string;
    authorPseudonym: string;
    createdAt: string;
    riskClassification: string;
    contentHashSha256: string;
    rawContent: string;
    moderationTrail: Array<{
      action: string;
      reason: string | null;
      timestamp: string;
    }>;
  };
  networkOrigin: {
    retentionPolicy: string;
    capturedRecordsCount: number;
    maskedTrace: string[];
    userAgentTrace: string[];
    unmaskedComplianceRecord?: IpRecord[];
  };
};

/**
 * Computes a cryptographic SHA-256 digest of text to guarantee evidentiary chain of custody.
 */
export function computeContentHash(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Compiles a structured, data-minimized compliance incident packet.
 * Only collects and exports the bare minimum evidentiary record strictly required for law enforcement.
 * Does NOT collect or expose any user PII (names, emails, phone numbers, contacts, device hardware IDs).
 *
 * @param targetId ID of the flagged Letter or Reply
 * @param targetType "LETTER" or "REPLY"
 * @param includeUnmaskedForWarrant Whether to include unmasked IP traces for an official warrant/subpoena
 */
export async function generateIncidentPacket(
  targetId: string,
  targetType: "LETTER" | "REPLY",
  includeUnmaskedForWarrant: boolean = false
): Promise<ComplianceIncidentPacket | null> {
  const generatedAt = new Date().toISOString();
  const packetId = `46HZ-INCIDENT-${Date.now().toString(36).toUpperCase()}-${targetId.slice(-6).toUpperCase()}`;

  const moderationEvents = await db.orm.public.ModerationEvent
    .select("action", "reason", "createdAt")
    .where({ targetType, targetId })
    .orderBy((event) => event.createdAt.asc())
    .all();

  const moderationTrail = moderationEvents.map((evt) => ({
    action: evt.action,
    reason: evt.reason ?? null,
    timestamp: databaseDate(evt.createdAt).toISOString()
  }));

  if (targetType === "LETTER") {
    const letter = await db.orm.public.Letter
      .select("id", "rawText", "createdAt", "riskLevel")
      .include("author", (author) => author.select("anonymousHandle", "recentIps"))
      .first({ id: targetId });

    if (!letter || !letter.author) return null;

    const ips = Array.isArray(letter.author.recentIps)
      ? (letter.author.recentIps as unknown as IpRecord[])
      : [];

    const contentHash = computeContentHash(letter.rawText);

    return {
      packetHeader: {
        protocolVersion: complianceSettings.protocolVersion,
        packetId,
        generatedAt,
        legalBasis: complianceSettings.legalBasis,
        dataMinimizationNotice: complianceSettings.dataMinimizationNotice
      },
      incident: {
        targetType: "LETTER",
        targetId: letter.id,
        authorPseudonym: letter.author.anonymousHandle,
        createdAt: databaseDate(letter.createdAt).toISOString(),
        riskClassification: letter.riskLevel,
        contentHashSha256: contentHash,
        rawContent: letter.rawText,
        moderationTrail
      },
      networkOrigin: {
        retentionPolicy: `${complianceSettings.ipRetentionDays}-day rolling window, maximum ${complianceSettings.maxRecentIps} entries`,
        capturedRecordsCount: ips.length,
        maskedTrace: ips.map((rec) => `${maskIp(rec.ip)} (${rec.at})`),
        userAgentTrace: ips.map((rec) =>
          rec.userAgent
            ? `${rec.browser ?? "Unknown"} on ${rec.os ?? "Unknown"} [${rec.userAgent}]`
            : "No User Agent captured"
        ),
        ...(includeUnmaskedForWarrant ? { unmaskedComplianceRecord: ips } : {})
      }
    };
  }

  if (targetType === "REPLY") {
    const reply = await db.orm.public.Reply
      .select("id", "rawText", "createdAt", "status")
      .include("responder", (responder) => responder.select("anonymousHandle", "recentIps"))
      .first({ id: targetId });

    if (!reply || !reply.responder) return null;

    const ips = Array.isArray(reply.responder.recentIps)
      ? (reply.responder.recentIps as unknown as IpRecord[])
      : [];

    const contentHash = computeContentHash(reply.rawText);

    return {
      packetHeader: {
        protocolVersion: complianceSettings.protocolVersion,
        packetId,
        generatedAt,
        legalBasis: complianceSettings.legalBasis,
        dataMinimizationNotice: complianceSettings.dataMinimizationNotice
      },
      incident: {
        targetType: "REPLY",
        targetId: reply.id,
        authorPseudonym: reply.responder.anonymousHandle,
        createdAt: databaseDate(reply.createdAt).toISOString(),
        riskClassification: reply.status,
        contentHashSha256: contentHash,
        rawContent: reply.rawText,
        moderationTrail
      },
      networkOrigin: {
        retentionPolicy: `${complianceSettings.ipRetentionDays}-day rolling window, maximum ${complianceSettings.maxRecentIps} entries`,
        capturedRecordsCount: ips.length,
        maskedTrace: ips.map((rec) => `${maskIp(rec.ip)} (${rec.at})`),
        userAgentTrace: ips.map((rec) =>
          rec.userAgent
            ? `${rec.browser ?? "Unknown"} on ${rec.os ?? "Unknown"} [${rec.userAgent}]`
            : "No User Agent captured"
        ),
        ...(includeUnmaskedForWarrant ? { unmaskedComplianceRecord: ips } : {})
      }
    };
  }

  return null;
}
