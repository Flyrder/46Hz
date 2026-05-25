"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, getAdminPasscode, requireAdmin, setAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { canTransitionLetter, canTransitionReply } from "@/lib/moderation/status";
import {
  adminLetterSchema,
  adminReplySchema,
  formValue,
  riskLevelSchema,
  supportResourceSchema
} from "@/lib/validators";

export async function adminLoginAction(formData: FormData): Promise<void> {
  const passcode = formValue(formData, "passcode");
  if (passcode !== getAdminPasscode()) {
    redirect("/admin?error=1");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin");
}

export async function moderateLetterAction(formData: FormData): Promise<void> {
  await requireAdmin();
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
        action: "ADMIN_MODERATED",
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
  await requireAdmin();
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
        action: "RISK_OVERRIDDEN",
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
  await requireAdmin();
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
        action: "ADMIN_MODERATED",
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
