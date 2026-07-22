import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export type IpRecord = {
  ip: string;
  at: string;
};

/**
 * Pure function to maintain a queue of up to `maxItems` recent IPs.
 * Appends the new IP record and keeps only the latest `maxItems` entries.
 */
export function updateIpQueue(
  currentQueue: IpRecord[],
  newIp: string,
  nowIso: string = new Date().toISOString(),
  maxItems: number = 5
): IpRecord[] {
  if (!newIp) return currentQueue;

  const newRecord: IpRecord = { ip: newIp, at: nowIso };
  
  // If the last recorded IP is identical to the current one, update its timestamp instead of duplicating entries needlessly.
  const updatedQueue = [...currentQueue];
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
