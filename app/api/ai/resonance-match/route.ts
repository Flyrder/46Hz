import { NextResponse } from "next/server";
import { getAiMiddleware } from "@/lib/ai";
import { resonanceMatchSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = resonanceMatchSchema.parse(json);
    const result = await getAiMiddleware().matchResonantLetters(input);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to match resonant letters" },
      { status: 400 }
    );
  }
}
