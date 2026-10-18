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
import { toTimestamp } from "@/lib/dates";
import { db } from "@/lib/db";
import { canTransitionLetter, canTransitionReply } from "@/lib/moderation/status";
import { getClientIp } from "@/lib/ip";
import { checkRateLimit, resetRateLimit } from "@/lib/safety/rate-limit";
import { aiSettings, securitySettings } from "@/settings";
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

  const letter = await db.orm.public.Letter.select("id", "status", "riskLevel")
    .first({ id: input.letterId });

  if (!letter) {
    throw new Error("Letter not found.");
  }

  if (letter.status !== input.status && !canTransitionLetter(letter.status, input.status)) {
    throw new Error("Invalid letter moderation transition.");
  }

  await db.transaction(async (tx) => {
    await tx.orm.public.Letter.where((row) => row.id.eq(letter.id)).updateAndCount({
        status: input.status,
        riskLevel: input.riskLevel
    });
    await tx.orm.public.ModerationEvent.create({
        targetType: "LETTER",
        targetId: letter.id,
        action: role === "ADMIN" ? "ADMIN_MODERATED" : "MODERATOR_MODERATED",
        reason: input.reason,
        previousStatus: `${letter.status}/${letter.riskLevel}`,
        newStatus: `${input.status}/${input.riskLevel}`
    });
  });

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

  const letter = await db.orm.public.Letter.select("id", "riskLevel").first({ id: letterId });
  if (!letter) {
    throw new Error("Letter not found.");
  }

  await db.transaction(async (tx) => {
    await tx.orm.public.Letter.where((row) => row.id.eq(letter.id)).updateAndCount({ riskLevel });
    await tx.orm.public.ModerationEvent.create({
        targetType: "LETTER",
        targetId: letter.id,
        action: role === "ADMIN" ? "RISK_OVERRIDDEN" : "MODERATOR_RISK_OVERRIDDEN",
        reason,
        previousStatus: letter.riskLevel,
        newStatus: riskLevel
    });
  });

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

  const reply = await db.orm.public.Reply.select("id", "status", "letterId")
    .first({ id: input.replyId });

  if (!reply) {
    throw new Error("Reply not found.");
  }

  if (reply.status !== input.status && !canTransitionReply(reply.status, input.status)) {
    throw new Error("Invalid reply moderation transition.");
  }

  await db.transaction(async (tx) => {
    await tx.orm.public.Reply.where((row) => row.id.eq(reply.id))
      .updateAndCount({ status: input.status });
    await tx.orm.public.ModerationEvent.create({
        targetType: "REPLY",
        targetId: reply.id,
        action: role === "ADMIN" ? "ADMIN_MODERATED" : "MODERATOR_MODERATED",
        reason: input.reason,
        previousStatus: reply.status,
        newStatus: input.status
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/replies");
  revalidatePath(`/admin/replies/${reply.id}`);
  revalidatePath(`/letters/${reply.letterId}`);
}

export async function suspendUserAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = formValue(formData, "userId");
  const reason = formValue(formData, "reason") || "Admin suspension";

  await db.transaction(async (tx) => {
    await tx.orm.public.User.where((row) => row.id.eq(userId))
      .updateAndCount({ suspendedAt: toTimestamp() });
    await tx.orm.public.ModerationEvent.create({
        targetType: "USER",
        targetId: userId,
        action: "SUSPENDED",
        reason,
        previousStatus: "ACTIVE",
        newStatus: "SUSPENDED"
    });
  });

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

  const resource = await db.orm.public.SupportResource.select("id", "active").upsert({
    create: {
      ...(input.id ? { id: input.id } : {}),
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

  await db.orm.public.ModerationEvent.create({
      targetType: "SUPPORT_RESOURCE",
      targetId: resource.id,
      action: "RESOURCE_SAVED",
      previousStatus: null,
      newStatus: resource.active ? "ACTIVE" : "INACTIVE"
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

  await db.transaction(async (tx) => {
    await tx.orm.public.SupportResource.where((row) => row.id.eq(id)).deleteAndCount();
    await tx.orm.public.ModerationEvent.create({
        targetType: "SUPPORT_RESOURCE",
        targetId: id,
        action: "RESOURCE_DELETED",
        previousStatus: "ACTIVE",
        newStatus: "DELETED"
    });
  });

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
    aiDefaultProvider: formValue(formData, "aiDefaultProvider") || aiSettings.defaultProvider,
    aiTimeoutMs: formValue(formData, "aiTimeoutMs") || String(aiSettings.timeoutMs),
    aiMockDelayMs: formValue(formData, "aiMockDelayMs") || String(aiSettings.mockDelayMs),
    aiTemperature: formValue(formData, "aiTemperature") || String(aiSettings.temperature),
    aiMaxTokens: formValue(formData, "aiMaxTokens") || String(aiSettings.maxTokens),
    aiThinkingLevel: formValue(formData, "aiThinkingLevel") || aiSettings.thinkingLevel,
    aiStoreInteractions: formData.get("aiStoreInteractions") === "on" || formData.get("aiStoreInteractions") === "true",
    aiModel: formValue(formData, "aiModel") || aiSettings.model,
    aiApiKey: formData.has("aiApiKey") ? formValue(formData, "aiApiKey") : aiSettings.apiKey,
    aiBaseUrl: formData.has("aiBaseUrl") ? formValue(formData, "aiBaseUrl") : aiSettings.baseUrl,
    aiSystemPrompt: formData.has("aiSystemPrompt") ? formValue(formData, "aiSystemPrompt") : aiSettings.systemPrompt,
    aiPromptRiskSafety: formData.has("aiPromptRiskSafety") ? formValue(formData, "aiPromptRiskSafety") : aiSettings.promptRiskSafety,
    aiPromptAnonymization: formData.has("aiPromptAnonymization") ? formValue(formData, "aiPromptAnonymization") : aiSettings.promptAnonymization,
    aiPromptReplyCoach: formData.has("aiPromptReplyCoach") ? formValue(formData, "aiPromptReplyCoach") : aiSettings.promptReplyCoach,
    aiPromptWritingSparks: formData.has("aiPromptWritingSparks") ? formValue(formData, "aiPromptWritingSparks") : aiSettings.promptWritingSparks,
    aiPromptResonanceMatch: formData.has("aiPromptResonanceMatch") ? formValue(formData, "aiPromptResonanceMatch") : aiSettings.promptResonanceMatch,
    enableChinaSupportInfo: formData.get("enableChinaSupportInfo") === "on" || formData.get("enableChinaSupportInfo") === "true"
  });

  if (!parsed.success) {
    redirect("/admin/settings?error=validation");
  }

  const { settings: updated, syncedSettingsTs } = saveSystemSettings(parsed.data, {
    syncSourceFile: true
  });

  await db.orm.public.ModerationEvent.create({
      targetType: "SUPPORT_RESOURCE",
      targetId: "settings.ts",
      action: "SYSTEM_SETTINGS_UPDATED",
      reason: `Updated settings.ts (Replies: ${updated.defaultMaxReplies}->${updated.expandedMaxReplies}, Lease: ${updated.leaseDurationMinutes}m, AI: ${updated.aiDefaultProvider}/${updated.aiModel}, CN Support: ${updated.enableChinaSupportInfo ? "ON" : "OFF"})`,
      previousStatus: "LIVE",
      newStatus: syncedSettingsTs ? "SYNCED_TO_SETTINGS_TS" : "RUNTIME_OVERRIDDEN"
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

  await db.orm.public.ModerationEvent.create({
      targetType: "SUPPORT_RESOURCE",
      targetId: "settings.ts",
      action: "SYSTEM_SETTINGS_RESET",
      reason: "Restored settings.ts to factory default values",
      previousStatus: "CUSTOM",
      newStatus: "FACTORY_DEFAULT"
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/reply");
  revalidatePath("/settings");
  revalidatePath("/support-resources");
  redirect("/admin/settings?reset=1");
}

