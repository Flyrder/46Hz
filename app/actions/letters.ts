"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAiMiddleware } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLetterRouting } from "@/lib/safety/routing";
import { formValue, reviewLetterSchema, writeLetterSchema } from "@/lib/validators";

export async function processLetterAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const input = writeLetterSchema.parse({
    rawText: formValue(formData, "rawText")
  });

  const ai = getAiMiddleware();
  const result = await ai.processLetter({
    text: input.rawText,
    language: user.language,
    preferredReplyType: user.preferredReplyType
  });

  const letter = await prisma.letter.create({
    data: {
      authorId: user.id,
      rawText: input.rawText,
      processedText: result.processedText,
      emotionTags: result.emotionTags,
      situationTags: result.situationTags,
      desiredReplyType: result.desiredReplyType,
      riskLevel: result.risk.level,
      language: user.language,
      status: "DRAFT"
    }
  });

  redirect(`/write/review?id=${letter.id}`);
}

export async function confirmLetterAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const input = reviewLetterSchema.parse({
    letterId: formValue(formData, "letterId"),
    processedText: formValue(formData, "processedText")
  });

  const letter = await prisma.letter.findFirst({
    where: {
      id: input.letterId,
      authorId: user.id,
      status: "DRAFT"
    }
  });

  if (!letter) {
    throw new Error("Draft letter was not found.");
  }

  const routing = getLetterRouting(letter.riskLevel);

  await prisma.$transaction([
    prisma.letter.update({
      where: { id: letter.id },
      data: {
        processedText: input.processedText,
        status: routing.submitStatus
      }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "LETTER",
        targetId: letter.id,
        action: routing.showSupportResources ? "SAFETY_ROUTED" : "SUBMITTED",
        reason: routing.showSupportResources
          ? "Risk routing kept the letter out of peer matching."
          : "Writer confirmed the AI-processed letter.",
        previousStatus: letter.status,
        newStatus: routing.submitStatus
      }
    })
  ]);

  revalidatePath("/inbox");

  if (routing.showSupportResources) {
    redirect("/support-resources?routed=1");
  }

  redirect("/inbox?submitted=1");
}

export async function cancelDraftLetterAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const letterId = formValue(formData, "letterId");

  await prisma.letter.deleteMany({
    where: {
      id: letterId,
      authorId: user.id,
      status: "DRAFT"
    }
  });

  redirect("/write");
}
