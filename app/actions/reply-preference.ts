"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formValue, replyTypeSchema } from "@/lib/validators";

export async function updateReplyPreferenceAction(formData: FormData): Promise<void> {
  const parsed = replyTypeSchema.safeParse(formValue(formData, "preferredReplyType"));
  if (!parsed.success) {
    return;
  }

  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { preferredReplyType: parsed.data }
  });

  revalidatePath("/settings");
  revalidatePath("/reply");
  revalidatePath("/write");
}
