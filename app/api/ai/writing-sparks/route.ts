import { NextResponse } from "next/server";
import { getAiMiddleware } from "@/lib/ai";
import { writingSparksSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = writingSparksSchema.parse(json);
    const result = await getAiMiddleware().generateWritingSparks(input);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate writing sparks" },
      { status: 400 }
    );
  }
}
