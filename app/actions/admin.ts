"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  authenticatePasscode,
  clearAdminSession,
  requireAdmin,
  requireStaff,
  setAdminSession
} from "@/lib/admin";
import { prisma } from "@/lib/db";
import { canTransitionLetter, canTransitionReply } from "@/lib/moderation/status";
import { getClientIp } from "@/lib/ip";
import { checkRateLimit, resetRateLimit } from "@/lib/safety/rate-limit";
import { securitySettings } from "@/settings";
import {
  adminLetterSchema,
  adminReplySchema,
  formValue,
  riskLevelSchema,
  supportResourceSchema,
  systemSettingsSchema
} from "@/lib/validators";
import { resetSystemSettings, saveSystemSettings } from "@/lib/settings-store";

export async function adminLoginAction(formData: FormData): Promise<void> {
  const ip = await getClientIp();
  const rateLimitKey = `admin_login:${ip}`;
  const { maxRequests, windowMs } = securitySettings.rateLimits.adminLogin;
  const rateLimit = checkRateLimit(rateLimitKey, maxRequests, windowMs);

  if (!rateLimit.allowed) {
    redirect("/admin?error=rate_limited");
  }

  const passcode = formValue(formData, "passcode");
  const role = authenticatePasscode(passcode);
  if (!role) {
    redirect("/admin?error=1");
  }

  resetRateLimit(rateLimitKey);
  await setAdminSession(role);
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin");
}

export async function moderateLetterAction(formData: FormData): Promise<void> {
  const role = await requireStaff();
  const input = adminLetterSchema.parse({
    letterId: formValue(formData, "letterId"),
    status: formValue(formData, "status"),
    riskLevel: formValue(formData, "riskLevel"),
    reason: formValue(formData, "reason") || undefined
  });

  const letter = await prisma.letter.findUnique({
    where: { id: input.letterId }
  });

  if (!letter) {
    throw new Error("Letter not found.");
  }

  if (letter.status !== input.status && !canTransitionLetter(letter.status, input.status)) {
    throw new Error("Invalid letter moderation transition.");
  }

  await prisma.$transaction([
    prisma.letter.update({
      where: { id: letter.id },
      data: {
        status: input.status,
        riskLevel: input.riskLevel
      }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "LETTER",
        targetId: letter.id,
        action: role === "ADMIN" ? "ADMIN_MODERATED" : "MODERATOR_MODERATED",
        reason: input.reason,
        previousStatus: `${letter.status}/${letter.riskLevel}`,
        newStatus: `${input.status}/${input.riskLevel}`
      }
    })
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/letters");
  revalidatePath(`/admin/letters/${letter.id}`);
  revalidatePath("/reply");
}

export async function overrideLetterRiskAction(formData: FormData): Promise<void> {
  const role = await requireStaff();
  const letterId = formValue(formData, "letterId");
  const riskLevel = riskLevelSchema.parse(formValue(formData, "riskLevel"));
  const reason = formValue(formData, "reason") || "Risk override";

  const letter = await prisma.letter.findUnique({ where: { id: letterId } });
  if (!letter) {
    throw new Error("Letter not found.");
  }

  await prisma.$transaction([
    prisma.letter.update({
      where: { id: letter.id },
      data: { riskLevel }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "LETTER",
        targetId: letter.id,
        action: role === "ADMIN" ? "RISK_OVERRIDDEN" : "MODERATOR_RISK_OVERRIDDEN",
        reason,
        previousStatus: letter.riskLevel,
        newStatus: riskLevel
      }
    })
  ]);

  revalidatePath(`/admin/letters/${letter.id}`);
  revalidatePath("/reply");
}

export async function moderateReplyAction(formData: FormData): Promise<void> {
  const role = await requireStaff();
  const input = adminReplySchema.parse({
    replyId: formValue(formData, "replyId"),
    status: formValue(formData, "status"),
    reason: formValue(formData, "reason") || undefined
  });

  const reply = await prisma.reply.findUnique({
    where: { id: input.replyId }
  });

  if (!reply) {
    throw new Error("Reply not found.");
  }

  if (reply.status !== input.status && !canTransitionReply(reply.status, input.status)) {
    throw new Error("Invalid reply moderation transition.");
  }

  await prisma.$transaction([
    prisma.reply.update({
      where: { id: reply.id },
      data: { status: input.status }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "REPLY",
        targetId: reply.id,
        action: role === "ADMIN" ? "ADMIN_MODERATED" : "MODERATOR_MODERATED",
        reason: input.reason,
        previousStatus: reply.status,
        newStatus: input.status
      }
    })
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/replies");
  revalidatePath(`/admin/replies/${reply.id}`);
  revalidatePath(`/letters/${reply.letterId}`);
}

export async function suspendUserAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = formValue(formData, "userId");
  const reason = formValue(formData, "reason") || "Admin suspension";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { suspendedAt: new Date() }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "USER",
        targetId: userId,
        action: "SUSPENDED",
        reason,
        previousStatus: "ACTIVE",
        newStatus: "SUSPENDED"
      }
    })
  ]);

  revalidatePath("/admin/users");
}

export async function saveSupportResourceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const input = supportResourceSchema.parse({
    id: formValue(formData, "id") || undefined,
    title: formValue(formData, "title"),
    description: formValue(formData, "description"),
    region: formValue(formData, "region"),
    language: formValue(formData, "language"),
    url: formValue(formData, "url"),
    phone: formValue(formData, "phone"),
    active: formData.get("active") !== null
  });

  const resource = await prisma.supportResource.upsert({
    where: { id: input.id ?? "__new__" },
    create: {
      title: input.title,
      description: input.description,
      region: input.region,
      language: input.language,
      url: input.url || null,
      phone: input.phone || null,
      active: input.active
    },
    update: {
      title: input.title,
      description: input.description,
      region: input.region,
      language: input.language,
      url: input.url || null,
      phone: input.phone || null,
      active: input.active
    }
  });

  await prisma.moderationEvent.create({
    data: {
      targetType: "SUPPORT_RESOURCE",
      targetId: resource.id,
      action: "RESOURCE_SAVED",
      previousStatus: null,
      newStatus: resource.active ? "ACTIVE" : "INACTIVE"
    }
  });

  revalidatePath("/admin/resources");
  revalidatePath("/support-resources");
}

export async function deleteSupportResourceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formValue(formData, "id");
  if (!id) {
    throw new Error("Resource ID is required for deletion.");
  }

  await prisma.$transaction([
    prisma.supportResource.delete({
      where: { id }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "SUPPORT_RESOURCE",
        targetId: id,
        action: "RESOURCE_DELETED",
        previousStatus: "ACTIVE",
        newStatus: "DELETED"
      }
    })
  ]);

  revalidatePath("/admin/resources");
  revalidatePath("/support-resources");
}

export async function saveSystemSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = systemSettingsSchema.safeParse({
    brandName: formValue(formData, "brandName"),
    brandTitle: formValue(formData, "brandTitle"),
    brandTagline: formValue(formData, "brandTagline"),
    brandVersion: formValue(formData, "brandVersion"),
    defaultLocale: formValue(formData, "defaultLocale"),
    defaultTheme: formValue(formData, "defaultTheme"),
    cookieMaxAgeDays: formValue(formData, "cookieMaxAgeDays"),
    migrationCodePrefix: formValue(formData, "migrationCodePrefix"),
    defaultMaxReplies: formValue(formData, "defaultMaxReplies"),
    expandedMaxReplies: formValue(formData, "expandedMaxReplies"),
    leaseDurationMinutes: formValue(formData, "leaseDurationMinutes"),
    adminLoginMaxRequests: formValue(formData, "adminLoginMaxRequests"),
    adminLoginWindowSeconds: formValue(formData, "adminLoginWindowSeconds"),
    writeLetterMaxRequests: formValue(formData, "writeLetterMaxRequests"),
    writeLetterWindowSeconds: formValue(formData, "writeLetterWindowSeconds"),
    coachReplyMaxRequests: formValue(formData, "coachReplyMaxRequests"),
    coachReplyWindowSeconds: formValue(formData, "coachReplyWindowSeconds"),
    ipRetentionDays: formValue(formData, "ipRetentionDays"),
    maxRecentIps: formValue(formData, "maxRecentIps"),
    legalBasis: formValue(formData, "legalBasis"),
    dataMinimizationNotice: formValue(formData, "dataMinimizationNotice"),
    enableAi: formData.get("enableAi") === "on" || formData.get("enableAi") === "true",
    enableAiRiskSafety: formData.get("enableAiRiskSafety") === "on" || formData.get("enableAiRiskSafety") === "true",
    enableAiAnonymization: formData.get("enableAiAnonymization") === "on" || formData.get("enableAiAnonymization") === "true",
    enableAiReplyCoach: formData.get("enableAiReplyCoach") === "on" || formData.get("enableAiReplyCoach") === "true",
    enableAiWritingSparks: formData.get("enableAiWritingSparks") === "on" || formData.get("enableAiWritingSparks") === "true",
    enableAiResonanceMatch: formData.get("enableAiResonanceMatch") === "on" || formData.get("enableAiResonanceMatch") === "true",
    aiDefaultProvider: formValue(formData, "aiDefaultProvider"),
    aiTimeoutMs: formValue(formData, "aiTimeoutMs"),
    aiMockDelayMs: formValue(formData, "aiMockDelayMs"),
    aiTemperature: formValue(formData, "aiTemperature"),
    aiMaxTokens: formValue(formData, "aiMaxTokens"),
    aiModel: formValue(formData, "aiModel"),
    aiApiKey: formValue(formData, "aiApiKey"),
    aiBaseUrl: formValue(formData, "aiBaseUrl"),
    aiSystemPrompt: formValue(formData, "aiSystemPrompt"),
    enableChinaSupportInfo: formData.get("enableChinaSupportInfo") === "on" || formData.get("enableChinaSupportInfo") === "true"
  });

  if (!parsed.success) {
    redirect("/admin/settings?error=validation");
  }

  const { settings: updated, syncedSettingsTs } = saveSystemSettings(parsed.data, {
    syncSourceFile: true
  });

  await prisma.moderationEvent.create({
    data: {
      targetType: "SUPPORT_RESOURCE",
      targetId: "settings.ts",
      action: "SYSTEM_SETTINGS_UPDATED",
      reason: `Updated settings.ts (Replies: ${updated.defaultMaxReplies}->${updated.expandedMaxReplies}, Lease: ${updated.leaseDurationMinutes}m, AI: ${updated.aiDefaultProvider}, CN Support: ${updated.enableChinaSupportInfo ? "ON" : "OFF"})`,
      previousStatus: "LIVE",
      newStatus: syncedSettingsTs ? "SYNCED_TO_SETTINGS_TS" : "RUNTIME_OVERRIDDEN"
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/reply");
  revalidatePath("/settings");
  revalidatePath("/support-resources");
  redirect("/admin/settings?saved=1");
}

export async function resetSystemSettingsAction(): Promise<void> {
  await requireAdmin();

  resetSystemSettings({ syncSourceFile: true });

  await prisma.moderationEvent.create({
    data: {
      targetType: "SUPPORT_RESOURCE",
      targetId: "settings.ts",
      action: "SYSTEM_SETTINGS_RESET",
      reason: "Restored settings.ts to factory default values",
      previousStatus: "CUSTOM",
      newStatus: "FACTORY_DEFAULT"
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/reply");
  revalidatePath("/settings");
  revalidatePath("/support-resources");
  redirect("/admin/settings?reset=1");
}

