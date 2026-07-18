"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setLocalePreference } from "@/lib/preferences";
import { createAnonymousHandle, setCurrentUserId } from "@/lib/session";
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
      language: input.language,
      ageRange: input.ageRange,
      preferredReplyType: input.preferredReplyType
    }
  });

  await setCurrentUserId(user.id);
  await setLocalePreference(user.language as "en_US" | "ko_KR" | "zh_CN");
  redirect("/write");
}
