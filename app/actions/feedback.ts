"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
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

  const reply = await prisma.reply.findUnique({
    where: { id: input.replyId },
    include: {
      letter: true,
      responder: true
    }
  });

  if (!reply || reply.status !== "APPROVED" || reply.letter.authorId !== user.id) {
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

  await prisma.$transaction([
    prisma.feedback.upsert({
      where: {
        replyId_fromUserId: {
          replyId: reply.id,
          fromUserId: user.id
        }
      },
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
    }),
    prisma.user.update({
      where: { id: reply.responderId },
      data: { trustScore: newTrustScore }
    }),
    ...(reported
      ? [
          prisma.moderationEvent.create({
            data: {
              targetType: "REPLY" as const,
              targetId: reply.id,
              action: "REPORTED",
              reason: input.reportReason,
              previousStatus: reply.status,
              newStatus: reply.status
            }
          })
        ]
      : [])
  ]);

  revalidatePath(`/letters/${reply.letterId}`);
}
