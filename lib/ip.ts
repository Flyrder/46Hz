import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export type IpRecord = {
  ip: string;
  at: string;
};

export const DEFAULT_RETENTION_DAYS = 14;

/**
 * Mask an IP address to preserve privacy for everyday staff and dashboard views.
 * IPv4: 192.168.1.100 -> 192.168.***.***
 * IPv6: 2001:0db8:85a3::7334 -> 2001:0db8:****:****
 */
export function maskIp(ip: string): string {
  if (!ip) return "***";

  // IPv4
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
    return `${parts[0]}.***.***`;
  }

  // IPv6
  if (ip.includes(":")) {
    const parts = ip.split(":");
    const prefix = parts.slice(0, 2).filter(Boolean).join(":");
    return `${prefix || "2001:db8"}:****:****`;
  }

  return "***";
}

/**
 * Prunes IP entries that have exceeded the compliance retention window (default 14 days).
 */
export function pruneExpiredIps(
  queue: IpRecord[],
  retentionDays: number = DEFAULT_RETENTION_DAYS,
  now: Date = new Date()
): IpRecord[] {
  const cutoffTime = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;

  return queue.filter((record) => {
    const recordTime = new Date(record.at).getTime();
    return !isNaN(recordTime) && recordTime >= cutoffTime;
  });
}

/**
 * Pure function to maintain a queue of up to `maxItems` recent IPs with auto-pruning.
 * Appends the new IP record, discards expired records (> 14 days), and keeps only the latest `maxItems` entries.
 */
export function updateIpQueue(
  currentQueue: IpRecord[],
  newIp: string,
  nowIso: string = new Date().toISOString(),
  maxItems: number = 5,
  retentionDays: number = DEFAULT_RETENTION_DAYS
): IpRecord[] {
  if (!newIp) return currentQueue;

  // Enforce data minimization: prune records older than retention period
  const pruned = pruneExpiredIps(currentQueue, retentionDays, new Date(nowIso));

  const newRecord: IpRecord = { ip: newIp, at: nowIso };
  const updatedQueue = [...pruned];
  const lastIndex = updatedQueue.length - 1;

  if (lastIndex >= 0 && updatedQueue[lastIndex].ip === newIp) {
    updatedQueue[lastIndex] = newRecord;
  } else {
    updatedQueue.push(newRecord);
  }

  // Keep only the last maxItems records
  if (updatedQueue.length > maxItems) {
    return updatedQueue.slice(updatedQueue.length - maxItems);
  }

  return updatedQueue;
}

/**
 * Extracts the client IP address from request headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerStore = await headers();
    const forwardedFor = headerStore.get("x-forwarded-for");
    if (forwardedFor) {
      // x-forwarded-for can be a comma-separated list of IPs. The first one is the client IP.
      const firstIp = forwardedFor.split(",")[0].trim();
      if (firstIp) return firstIp;
    }

    const realIp = headerStore.get("x-real-ip");
    if (realIp) return realIp.trim();

    const cfIp = headerStore.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  } catch {
    // If headers() is called outside request context, fall back gracefully
  }

  return "127.0.0.1";
}

/**
 * Records the current client IP to the user's recentIps in the database (keeping last 5).
 */
export async function recordUserIp(userId: string): Promise<void> {
  if (!userId) return;

  const clientIp = await getClientIp();
  if (!clientIp) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { recentIps: true }
    });

    if (!user) return;

    let currentQueue: IpRecord[] = [];
    if (Array.isArray(user.recentIps)) {
      currentQueue = user.recentIps as unknown as IpRecord[];
    }

    const nextQueue = updateIpQueue(currentQueue, clientIp);

    await prisma.user.update({
      where: { id: userId },
      data: {
        recentIps: nextQueue
      }
    });
  } catch (error) {
    console.error("Failed to record user IP:", error);
  }
}
