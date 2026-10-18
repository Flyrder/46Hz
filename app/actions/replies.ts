"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAiMiddleware } from "@/lib/ai";
import { db } from "@/lib/db";
import { conflictKey, replyEligibilityQuery } from "@/lib/db/queries";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { requireUser } from "@/lib/session";
import { isPeerMatchable } from "@/lib/safety/routing";
import { coachReplySchema, formValue, submitReplySchema } from "@/lib/validators";

import { isMatchActiveClaim, releaseLetterClaim } from "@/lib/reply/claiming";

import type { ReplyReframing, ToneMetrics } from "@/lib/ai/middleware";

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
      reframings?: ReplyReframing[];
      metrics?: ToneMetrics;
    };

export async function coachReplyAction(
  _previousState: CoachReplyState,
  formData: FormData
): Promise<CoachReplyState> {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const input = coachReplySchema.safeParse({
    letterId: formValue(formData, "letterId"),
    replyText: formValue(formData, "replyText")
  });

  if (!input.success) {
    return {
      ok: false,
      error: t("reply.errorTooShort")
    };
  }

  const letter = await replyEligibilityQuery(user.id).first({ id: input.data.letterId });

  if (
    !letter ||
    letter.authorId === user.id ||
    !isPeerMatchable({ status: letter.status, riskLevel: letter.riskLevel })
  ) {
    return {
      ok: false,
      error: t("reply.errorNotAvailable")
    };
  }

  if (letter.replies.existing.length > 0) {
    return {
      ok: false,
      error: t("reply.errorAlreadyReplied")
    };
  }

  if (letter.replies.activeCount >= (letter.maxReplies ?? 7)) {
    return {
      ok: false,
      error: t("reply.errorResonanceFull")
    };
  }

  const now = new Date();
  const lockedByOther = letter.matches.some(
    (m) => m.responderId !== user.id && isMatchActiveClaim(m, now)
  );

  if (lockedByOther) {
    return {
      ok: false,
      error: t("reply.errorLockedByOther")
    };
  }

  const ai = getAiMiddleware();
  const result = await ai.coachReply({
    letterText: letter.processedText,
    replyText: input.data.replyText,
    desiredReplyType: letter.desiredReplyType,
    language: locale
  });

  return {
    ok: true,
    letterId: letter.id,
    rawText: input.data.replyText,
    coachedText: result.coachedText,
    flags: result.flags,
    suggestions: result.suggestions,
    reframings: result.reframings,
    metrics: result.metrics
  };
}

export async function submitReplyAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const input = submitReplySchema.parse({
    letterId: formValue(formData, "letterId"),
    rawText: formValue(formData, "rawText"),
    coachedText: formValue(formData, "coachedText")
  });

  await db.transaction(async (tx) => {
    const lockedLetter = await tx.orm.public.Letter
      .select("id")
      .where({ id: input.letterId })
      .forNoKeyUpdate()
      .first();
    const letter = lockedLetter
      ? await replyEligibilityQuery(user.id, tx).first({ id: input.letterId })
      : null;

    if (
      !letter ||
      letter.authorId === user.id ||
      !isPeerMatchable({ status: letter.status, riskLevel: letter.riskLevel })
    ) {
      throw new Error("This letter is not available for peer response.");
    }

    if (letter.replies.existing.length > 0) {
      throw new Error("You have already submitted a reply to this letter.");
    }

    if (letter.replies.activeCount >= (letter.maxReplies ?? 7)) {
      throw new Error("This letter has reached its maximum resonance replies.");
    }

    const now = new Date();
    const lockedByOther = letter.matches.some(
      (m) => m.responderId !== user.id && isMatchActiveClaim(m, now)
    );

    if (lockedByOther) {
      throw new Error("This letter is currently locked by another peer's reply session.");
    }

    const reply = await tx.orm.public.Reply.select("id").create({
      letterId: letter.id,
      responderId: user.id,
      rawText: input.rawText,
      coachedText: input.coachedText,
      status: "PENDING"
    });

    await tx.orm.public.Match.select("id").upsert({
      conflictOn: conflictKey<"Match">({ letterId: letter.id, responderId: user.id }),
      create: {
        letterId: letter.id,
        responderId: user.id,
        status: "RESPONDED",
        matchReason: "Matched by approved normal-risk letter availability."
      },
      update: {
        status: "RESPONDED"
      }
    });

    await tx.orm.public.ModerationEvent.create({
      targetType: "REPLY",
      targetId: reply.id,
      action: "SUBMITTED",
      reason: "Responder confirmed AI-coached reply.",
      previousStatus: null,
      newStatus: "PENDING"
    });
  });

  revalidatePath("/admin/replies");
  redirect("/inbox?replySubmitted=1");
}

export async function releaseReplyClaimAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const letterId = formValue(formData, "letterId");
  if (letterId) {
    await releaseLetterClaim(letterId, user.id);
  }
  revalidatePath("/reply");
  redirect("/reply");
}
