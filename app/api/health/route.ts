import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "eko-letterbox",
    aiProvider: process.env.AI_PROVIDER ?? "mock"
  });
}
