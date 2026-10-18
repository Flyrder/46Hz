import { headers } from "next/headers";
import { db } from "@/lib/db";
import { complianceSettings } from "@/settings";

export type IpRecord = {
  ip: string;
  at: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
};

export const DEFAULT_RETENTION_DAYS = complianceSettings.ipRetentionDays;
export const MAX_RECENT_IPS = complianceSettings.maxRecentIps;

export type ParsedUserAgent = {
  browser: string;
  os: string;
  device: "Mobile" | "Tablet" | "Desktop" | "Bot" | "Unknown";
};

/**
 * Lightweight, zero-dependency parser for user agent strings.
 * Extracts browser name, operating system, and general device type.
 */
export function parseUserAgent(ua: string): ParsedUserAgent {
  if (!ua || ua === "Unknown" || ua === "Unknown / Server Context") {
    return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  }

  // OS Detection
  let os = "Unknown";
  if (/windows phone/i.test(ua)) os = "Windows Phone";
  else if (/win(dows|98|nt|xp|7|8|10|11)/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/ipad|iphone|ipod/i.test(ua)) os = "iOS";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/cros/i.test(ua)) os = "Chrome OS";
  else if (/linux/i.test(ua)) os = "Linux";

  // Device Detection
  let device: ParsedUserAgent["device"] = "Desktop";
  if (/bot|crawler|spider|googlebot|bingbot/i.test(ua)) {
    device = "Bot";
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android/i.test(ua)) {
    device = "Mobile";
  }

  // Browser Detection (Order matters due to token inclusion)
  let browser = "Unknown";
  if (/edg(e|a|ios)?\//i.test(ua)) browser = "Microsoft Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/trident|msie/i.test(ua)) browser = "Internet Explorer";

  return { browser, os, device };
}

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
 * Prunes connection entries that have exceeded the compliance retention window (default 14 days).
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
 * Pure function to maintain a queue of up to `maxItems` recent IP and User Agent records with auto-pruning.
 * Appends the new record, discards expired records (> 14 days), and keeps only the latest `maxItems` entries.
 */
export function updateIpQueue(
  currentQueue: IpRecord[],
  newIp: string,
  nowIso: string = new Date().toISOString(),
  maxItems: number = MAX_RECENT_IPS,
  retentionDays: number = DEFAULT_RETENTION_DAYS,
  userAgent?: string
): IpRecord[] {
  if (!newIp) return currentQueue;

  // Enforce data minimization: prune records older than retention period
  const pruned = pruneExpiredIps(currentQueue, retentionDays, new Date(nowIso));

  const parsed = userAgent ? parseUserAgent(userAgent) : undefined;
  const newRecord: IpRecord = {
    ip: newIp,
    at: nowIso,
    ...(userAgent ? { userAgent } : {}),
    ...(parsed ? { browser: parsed.browser, os: parsed.os, device: parsed.device } : {})
  };

  const updatedQueue = [...pruned];
  const lastIndex = updatedQueue.length - 1;

  if (lastIndex >= 0 && updatedQueue[lastIndex].ip === newIp) {
    updatedQueue[lastIndex] = {
      ...updatedQueue[lastIndex],
      at: nowIso,
      ...(userAgent ? { userAgent } : {}),
      ...(parsed ? { browser: parsed.browser, os: parsed.os, device: parsed.device } : {})
    };
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
 * Extracts the client browser user agent string from request headers.
 */
export async function getClientUserAgent(): Promise<string> {
  try {
    const headerStore = await headers();
    const ua = headerStore.get("user-agent");
    if (ua) return ua.trim();
  } catch {
    // If headers() is called outside request context, fall back gracefully
  }

  return "Unknown / Server Context";
}

/**
 * Records the current client IP and browser User Agent to the user's recentIps in the database.
 */
export async function recordUserIp(userId: string, knownQueue?: unknown): Promise<void> {
  if (!userId) return;

  const [clientIp, userAgent] = await Promise.all([getClientIp(), getClientUserAgent()]);
  if (!clientIp) return;

  try {
    const queue = knownQueue === undefined
      ? (await db.orm.public.User.select("recentIps").first({ id: userId }))?.recentIps
      : knownQueue;
    if (queue === undefined) return;

    let currentQueue: IpRecord[] = [];
    if (Array.isArray(queue)) {
      currentQueue = queue as IpRecord[];
    }

    const nextQueue = updateIpQueue(
      currentQueue,
      clientIp,
      new Date().toISOString(),
      MAX_RECENT_IPS,
      DEFAULT_RETENTION_DAYS,
      userAgent
    );

    await db.orm.public.User.where((user) => user.id.eq(userId))
      .updateAndCount({ recentIps: nextQueue });
  } catch (error) {
    console.error("Failed to record client audit (IP + User Agent):", error);
  }
}
