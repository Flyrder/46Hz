"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setLocalePreference } from "@/lib/preferences";
import { createAnonymousHandle, setCurrentUserId, createMigrationCode } from "@/lib/session";
import { recordUserIp } from "@/lib/ip";
import { formValue, onboardingSchema } from "@/lib/validators";

export async function createAnonymousSessionAction(formData: FormData): Promise<void> {
  const input = onboardingSchema.parse({
    language: formValue(formData, "language"),
    ageRange: formValue(formData, "ageRange"),
    preferredReplyType: formValue(formData, "preferredReplyType")
  });

  const user = await prisma.user.create({
    data: {
      anonymousHandle: createAnonymousHandle(),
      migrationCode: createMigrationCode(),
      language: input.language,
      ageRange: input.ageRange,
      preferredReplyType: input.preferredReplyType
    }
  });

  await recordUserIp(user.id);
  await setCurrentUserId(user.id);
  await setLocalePreference(user.language as "en_US" | "ko_KR" | "zh_CN");
  redirect("/write");
}

export async function restoreSessionAction(formData: FormData): Promise<void> {
  const migrationCode = formValue(formData, "migrationCode");
  if (!migrationCode || typeof migrationCode !== "string") {
    redirect("/onboarding?error=invalid_code");
  }

  const user = await prisma.user.findUnique({
    where: { migrationCode: migrationCode.trim() }
  });

  if (!user || user.suspendedAt) {
    redirect("/onboarding?error=invalid_code");
  }

  await setCurrentUserId(user.id);
  await setLocalePreference(user.language as "en_US" | "ko_KR" | "zh_CN");
  redirect("/inbox?restored=1");
}
