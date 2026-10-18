"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formValue, replyTypeSchema } from "@/lib/validators";

export async function updateReplyPreferenceAction(formData: FormData): Promise<void> {
  const parsed = replyTypeSchema.safeParse(formValue(formData, "preferredReplyType"));
  if (!parsed.success) {
    return;
  }

  const user = await requireUser();
  await db.orm.public.User.where((row) => row.id.eq(user.id))
    .updateAndCount({ preferredReplyType: parsed.data });

  revalidatePath("/settings");
  revalidatePath("/reply");
  revalidatePath("/write");
}
