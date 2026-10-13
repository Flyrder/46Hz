import { NextResponse } from "next/server";
import { getAiMiddleware } from "@/lib/ai";
import { z } from "zod";

const anonymizeApiSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  language: z.string().trim().default("ko_KR")
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = anonymizeApiSchema.parse(json);
    const result = await getAiMiddleware().anonymize(input);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to anonymize text" },
      { status: 400 }
    );
  }
}
