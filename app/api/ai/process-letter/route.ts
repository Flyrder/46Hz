import { NextResponse } from "next/server";
import { getAiMiddleware } from "@/lib/ai";
import { onboardingSchema, writeLetterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const preferences = onboardingSchema.pick({
    language: true,
    preferredReplyType: true,
    ageRange: true
  }).parse(body);
  const letter = writeLetterSchema.parse({ rawText: body.rawText });

  const result = await getAiMiddleware().processLetter({
    text: letter.rawText,
    language: preferences.language,
    preferredReplyType: preferences.preferredReplyType
  });

  return NextResponse.json(result);
}
