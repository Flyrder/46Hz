"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearCurrentUser, createMigrationCode, requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function leaveAnonymousSessionAction(): Promise<void> {
  await clearCurrentUser();
  redirect("/");
}

export async function regenerateMigrationCodeAction(): Promise<string> {
  const user = await requireUser();
  const newCode = createMigrationCode();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { migrationCode: newCode }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "LETTER",
        targetId: user.id,
        action: "MIGRATION_CODE_REGENERATED",
        reason: "User regenerated migration code to prevent credential leakage or unauthorized account transfer.",
        previousStatus: "ROTATED",
        newStatus: "ACTIVE"
      }
    })
  ]);

  revalidatePath("/settings");
  return newCode;
}
