import { NextResponse } from "next/server";
import { getAiMiddleware } from "@/lib/ai";
import { replyTypeSchema } from "@/lib/validators";
import { z } from "zod";

const coachApiSchema = z.object({
  letterText: z.string().trim().min(20).max(4000),
  replyText: z.string().trim().min(20).max(3000),
  desiredReplyType: replyTypeSchema,
  language: z.string().trim().min(2).max(12)
});

export async function POST(request: Request) {
  const input = coachApiSchema.parse(await request.json());
  const result = await getAiMiddleware().coachReply(input);

  return NextResponse.json(result);
}
