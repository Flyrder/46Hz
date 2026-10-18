"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { conflictKey } from "@/lib/db/queries";
import { nextResponderTrustScore } from "@/lib/moderation/status";
import { requireUser } from "@/lib/session";
import { feedbackSchema, formBoolean, formValue } from "@/lib/validators";

export async function submitFeedbackAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const input = feedbackSchema.parse({
    replyId: formValue(formData, "replyId"),
    feltUnderstood: formBoolean(formData, "feltUnderstood"),
    helpful: formBoolean(formData, "helpful"),
    tooJudgmental: formBoolean(formData, "tooJudgmental"),
    tooMuchAdvice: formBoolean(formData, "tooMuchAdvice"),
    reportReason: formValue(formData, "reportReason") || undefined
  });

  const reply = await db.orm.public.Reply
    .select("id", "status", "letterId", "responderId")
    .include("letter", (letter) => letter.select("authorId"))
    .include("responder", (responder) => responder.select("trustScore"))
    .first({ id: input.replyId });

  if (!reply || reply.status !== "APPROVED" || !reply.letter || !reply.responder || reply.letter.authorId !== user.id) {
    throw new Error("Feedback can only be left by the writer on approved replies.");
  }

  const reported = Boolean(input.reportReason);
  const newTrustScore = nextResponderTrustScore(reply.responder.trustScore, {
    feltUnderstood: input.feltUnderstood,
    helpful: input.helpful,
    tooJudgmental: input.tooJudgmental,
    tooMuchAdvice: input.tooMuchAdvice,
    reported
  });

  await db.transaction(async (tx) => {
    await tx.orm.public.Feedback.select("id").upsert({
      conflictOn: conflictKey<"Feedback">({ replyId: reply.id, fromUserId: user.id }),
      create: {
        replyId: reply.id,
        fromUserId: user.id,
        feltUnderstood: input.feltUnderstood,
        helpful: input.helpful,
        tooJudgmental: input.tooJudgmental,
        tooMuchAdvice: input.tooMuchAdvice,
        reportReason: input.reportReason
      },
      update: {
        feltUnderstood: input.feltUnderstood,
        helpful: input.helpful,
        tooJudgmental: input.tooJudgmental,
        tooMuchAdvice: input.tooMuchAdvice,
        reportReason: input.reportReason
      }
    });
    await tx.orm.public.User.where((row) => row.id.eq(reply.responderId))
      .updateAndCount({ trustScore: newTrustScore });
    if (reported) {
      await tx.orm.public.ModerationEvent.create({
        targetType: "REPLY" as const,
        targetId: reply.id,
        action: "REPORTED",
        reason: input.reportReason,
        previousStatus: reply.status,
        newStatus: reply.status
      });
    }
  });

  revalidatePath(`/letters/${reply.letterId}`);
}
