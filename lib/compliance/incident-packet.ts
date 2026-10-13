import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { maskIp, type IpRecord } from "@/lib/ip";

export type ComplianceIncidentPacket = {
  packetHeader: {
    protocolVersion: "46HZ-LE-PACKET-V1";
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
    capturedIpsCount: number;
    maskedTrace: string[];
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

  const moderationEvents = await prisma.moderationEvent.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: "asc" }
  });

  const moderationTrail = moderationEvents.map((evt) => ({
    action: evt.action,
    reason: evt.reason ?? null,
    timestamp: evt.createdAt.toISOString()
  }));

  if (targetType === "LETTER") {
    const letter = await prisma.letter.findUnique({
      where: { id: targetId },
      include: {
        author: {
          select: {
            anonymousHandle: true,
            recentIps: true
          }
        }
      }
    });

    if (!letter) return null;

    const ips = Array.isArray(letter.author.recentIps)
      ? (letter.author.recentIps as unknown as IpRecord[])
      : [];

    const contentHash = computeContentHash(letter.rawText);

    return {
      packetHeader: {
        protocolVersion: "46HZ-LE-PACKET-V1",
        packetId,
        generatedAt,
        legalBasis: "Law Enforcement Incident & Compliance Request (Data Minimization Principle)",
        dataMinimizationNotice:
          "46Hz strictly collects zero PII (no legal names, no email, no phone, no biometrics). Retention policy is strictly capped at rolling 14 days."
      },
      incident: {
        targetType: "LETTER",
        targetId: letter.id,
        authorPseudonym: letter.author.anonymousHandle,
        createdAt: letter.createdAt.toISOString(),
        riskClassification: letter.riskLevel,
        contentHashSha256: contentHash,
        rawContent: letter.rawText,
        moderationTrail
      },
      networkOrigin: {
        retentionPolicy: "14-day rolling window, maximum 5 entries",
        capturedIpsCount: ips.length,
        maskedTrace: ips.map((rec) => `${maskIp(rec.ip)} (${rec.at})`),
        ...(includeUnmaskedForWarrant ? { unmaskedComplianceRecord: ips } : {})
      }
    };
  }

  if (targetType === "REPLY") {
    const reply = await prisma.reply.findUnique({
      where: { id: targetId },
      include: {
        responder: {
          select: {
            anonymousHandle: true,
            recentIps: true
          }
        }
      }
    });

    if (!reply) return null;

    const ips = Array.isArray(reply.responder.recentIps)
      ? (reply.responder.recentIps as unknown as IpRecord[])
      : [];

    const contentHash = computeContentHash(reply.rawText);

    return {
      packetHeader: {
        protocolVersion: "46HZ-LE-PACKET-V1",
        packetId,
        generatedAt,
        legalBasis: "Law Enforcement Incident & Compliance Request (Data Minimization Principle)",
        dataMinimizationNotice:
          "46Hz strictly collects zero PII (no legal names, no email, no phone, no biometrics). Retention policy is strictly capped at rolling 14 days."
      },
      incident: {
        targetType: "REPLY",
        targetId: reply.id,
        authorPseudonym: reply.responder.anonymousHandle,
        createdAt: reply.createdAt.toISOString(),
        riskClassification: reply.status,
        contentHashSha256: contentHash,
        rawContent: reply.rawText,
        moderationTrail
      },
      networkOrigin: {
        retentionPolicy: "14-day rolling window, maximum 5 entries",
        capturedIpsCount: ips.length,
        maskedTrace: ips.map((rec) => `${maskIp(rec.ip)} (${rec.at})`),
        ...(includeUnmaskedForWarrant ? { unmaskedComplianceRecord: ips } : {})
      }
    };
  }

  return null;
}
