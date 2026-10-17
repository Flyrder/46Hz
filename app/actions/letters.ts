"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAiMiddleware } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";
import { getLetterRouting } from "@/lib/safety/routing";
import { formValue, replyTypeSchema, reviewLetterSchema, writeLetterSchema } from "@/lib/validators";

export async function processLetterAction(formData: FormData): Promise<void> {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const parsed = writeLetterSchema.safeParse({
    rawText: formValue(formData, "rawText")
  });

  if (!parsed.success) {
    redirect("/write");
  }

  const input = parsed.data;

  const ai = getAiMiddleware();
  const result = await ai.processLetter({
    text: input.rawText,
    language: locale,
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
      language: locale,
      status: "DRAFT"
    }
  });

  redirect(`/write/review?id=${letter.id}`);
}

export async function confirmLetterAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = reviewLetterSchema.safeParse({
    letterId: formValue(formData, "letterId"),
    processedText: formValue(formData, "processedText")
  });

  if (!parsed.success) {
    redirect("/write");
  }

  const input = parsed.data;

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

export async function expandLetterResonanceAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const letterId = formValue(formData, "letterId");

  if (!letterId) {
    throw new Error("Letter ID is required.");
  }

  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      authorId: user.id
    }
  });

  if (!letter) {
    throw new Error("Letter not found or you are not the author.");
  }

  if (letter.maxReplies >= 15) {
    return;
  }

  await prisma.$transaction([
    prisma.letter.update({
      where: { id: letter.id },
      data: {
        maxReplies: 15
      }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "LETTER",
        targetId: letter.id,
        action: "RESONANCE_EXPANDED",
        reason: "Author explicitly consented to expand resonance capacity from 7 to 15 replies.",
        previousStatus: letter.status,
        newStatus: letter.status
      }
    })
  ]);

  revalidatePath(`/letters/${letter.id}`);
  revalidatePath("/inbox");
  revalidatePath("/reply");
}

export async function deleteLetterAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const letterId = formValue(formData, "letterId");

  if (!letterId) {
    throw new Error("Letter ID is required.");
  }

  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      authorId: user.id
    }
  });

  if (!letter) {
    throw new Error("Letter not found or you are not authorized to delete it.");
  }

  await prisma.$transaction([
    prisma.letter.delete({
      where: { id: letter.id }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "LETTER",
        targetId: letter.id,
        action: "DELETED_BY_AUTHOR",
        reason: "Author chose to permanently delete their letter.",
        previousStatus: letter.status,
        newStatus: "DELETED"
      }
    })
  ]);

  revalidatePath("/inbox");
  revalidatePath("/reply");
  redirect("/inbox?deleted=1");
}

export async function updateDesiredReplyTypeAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const letterId = formValue(formData, "letterId");
  const desiredReplyTypeRaw = formValue(formData, "desiredReplyType");

  const parsed = replyTypeSchema.safeParse(desiredReplyTypeRaw);
  if (!parsed.success) {
    throw new Error("Invalid desired reply type.");
  }

  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      authorId: user.id
    }
  });

  if (!letter) {
    throw new Error("Letter not found or you are not authorized to update it.");
  }

  await prisma.$transaction([
    prisma.letter.update({
      where: { id: letter.id },
      data: { desiredReplyType: parsed.data }
    }),
    prisma.moderationEvent.create({
      data: {
        targetType: "LETTER",
        targetId: letter.id,
        action: "DESIRED_REPLY_TYPE_UPDATED",
        reason: `Author updated desired reply type from ${letter.desiredReplyType} to ${parsed.data}.`,
        previousStatus: letter.status,
        newStatus: letter.status
      }
    })
  ]);

  revalidatePath(`/letters/${letter.id}`);
  revalidatePath("/inbox");
  revalidatePath("/reply");
}

