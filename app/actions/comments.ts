"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createCommentSchema, formValue } from "@/lib/validators";

export async function createLetterCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const input = createCommentSchema.parse({
    letterId: formValue(formData, "letterId"),
    selectedText: formValue(formData, "selectedText"),
    content: formValue(formData, "content")
  });

  const letter = await db.orm.public.Letter.select("id").first({ id: input.letterId });

  if (!letter) {
    throw new Error("Letter not found.");
  }

  await db.orm.public.LetterComment.create({
      letterId: letter.id,
      authorId: user.id,
      selectedText: input.selectedText,
      content: input.content
  });

  revalidatePath(`/letters/${letter.id}`);
}

export async function deleteLetterCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const commentId = formValue(formData, "commentId");
  const letterId = formValue(formData, "letterId");

  if (!commentId) {
    throw new Error("Comment ID is required.");
  }

  const comment = await db.orm.public.LetterComment.select("id", "authorId")
    .include("letter", (letter) => letter.select("authorId"))
    .first({ id: commentId });

  if (!comment) {
    throw new Error("Comment not found.");
  }

  // Can be deleted by the comment author OR the letter author
  if (comment.authorId !== user.id && comment.letter?.authorId !== user.id) {
    throw new Error("You are not authorized to delete this comment.");
  }

  await db.orm.public.LetterComment.where((row) => row.id.eq(commentId)).deleteAndCount();

  if (letterId) {
    revalidatePath(`/letters/${letterId}`);
  }
}
