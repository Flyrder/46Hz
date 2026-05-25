"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAiMiddleware } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isPeerMatchable } from "@/lib/safety/routing";
import { coachReplySchema, formValue, submitReplySchema } from "@/lib/validators";

export type CoachReplyState =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      letterId: string;
      rawText: string;
      coachedText: string;
      flags: string[];
      suggestions: string[];
    };

export async function coachReplyAction(
  _previousState: CoachReplyState,
  formData: FormData
): Promise<CoachReplyState> {
  const user = await requireUser();
  const input = coachReplySchema.safeParse({
    letterId: formValue(formData, "letterId"),
    replyText: formValue(formData, "replyText")
  });

  if (!input.success) {
    return {
      ok: false,
      error: "Please write a little more before asking for reply coaching."
    };
  }

  const letter = await prisma.letter.findUnique({
    where: { id: input.data.letterId }
  });

  if (
    !letter ||
    letter.authorId === user.id ||
    !isPeerMatchable({ status: letter.status, riskLevel: letter.riskLevel })
  ) {
    return {
      ok: false,
      error: "This letter is not available for peer response."
    };
  }

  const ai = getAiMiddleware();
  const result = await ai.coachReply({
    letterText: letter.processedText,
    replyText: input.data.replyText,
    desiredReplyType: letter.desiredReplyType,
    language: letter.language
  });

  return {
    ok: true,
    letterId: letter.id,
    rawText: input.data.replyText,
    coachedText: result.coachedText,
    flags: result.flags,
    suggestions: result.suggestions
  };
}

export async function submitReplyAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const input = submitReplySchema.parse({
    letterId: formValue(formData, "letterId"),
    rawText: formValue(formData, "rawText"),
    coachedText: formValue(formData, "coachedText")
  });

  const letter = await prisma.letter.findUnique({
    where: { id: input.letterId }
  });

  if (
    !letter ||
    letter.authorId === user.id ||
    !isPeerMatchable({ status: letter.status, riskLevel: letter.riskLevel })
  ) {
    throw new Error("This letter is not available for peer response.");
  }

  const reply = await prisma.reply.create({
    data: {
      letterId: letter.id,
      responderId: user.id,
      rawText: input.rawText,
      coachedText: input.coachedText,
      status: "PENDING"
    }
  });

  await prisma.$transaction([
    prisma.match.upsert({
      where: {
        letterId_responderId: {
          letterId: letter.id,
          responderId: user.id
        }
      },
      create: {
        letterId: letter.id,
        responderId: user.id,
        status: "RESPONDED",
        matchReason: "Matched by approved normal-risk letter availability."
      },
      update: {
        status: "RESPONDED"
      }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "REPLY",
        targetId: reply.id,
        action: "SUBMITTED",
        reason: "Responder confirmed AI-coached reply.",
        previousStatus: null,
        newStatus: "PENDING"
      }
    })
  ]);

  revalidatePath("/admin/replies");
  redirect("/inbox?replySubmitted=1");
}
