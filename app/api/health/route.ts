import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { brandSettings, aiSettings } from "@/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = performance.now();
  try {
    // Probe database connectivity and latency
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        status: "healthy",
        ok: true,
        version: brandSettings.version,
        service: brandSettings.title,
        database: {
          status: "connected",
          latencyMs
        },
        aiProvider: process.env.AI_PROVIDER ?? aiSettings.defaultProvider,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : "Database connection failed";

    return NextResponse.json(
      {
        status: "degraded",
        ok: false,
        version: brandSettings.version,
        service: brandSettings.title,
        database: {
          status: "disconnected",
          error: errorMessage,
          latencyMs
        },
        aiProvider: process.env.AI_PROVIDER ?? aiSettings.defaultProvider,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
