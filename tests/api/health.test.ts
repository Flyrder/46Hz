import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/health/route";
import { db } from "@/lib/db";
import { brandSettings } from "@/settings";

describe("Health API Route (/api/health)", () => {
  it("returns 200 and healthy status when database probe succeeds", async () => {
    const runtimeSpy = vi.spyOn(db, "runtime").mockReturnValueOnce({
      query: vi.fn().mockResolvedValueOnce([{ ok: 1 }])
    } as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("healthy");
    expect(data.version).toBe(brandSettings.version);
    expect(data.service).toBe(brandSettings.title);
    expect(data.database.status).toBe("connected");
    expect(typeof data.database.latencyMs).toBe("number");
    expect(data.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(data.aiProvider).toBeDefined();
    expect(data.timestamp).toBeDefined();

    runtimeSpy.mockRestore();
  });

  it("returns 503 and degraded status when database probe throws error", async () => {
    const runtimeSpy = vi.spyOn(db, "runtime").mockReturnValueOnce({
      query: vi.fn().mockRejectedValueOnce(new Error("Connection refused"))
    } as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.ok).toBe(false);
    expect(data.status).toBe("degraded");
    expect(data.version).toBe(brandSettings.version);
    expect(data.database.status).toBe("disconnected");
    expect(data.database.error).toBe("Connection refused");
    expect(typeof data.database.latencyMs).toBe("number");

    runtimeSpy.mockRestore();
  });

  it("probes live database and returns healthy response", async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("healthy");
    expect(data.version).toBe(brandSettings.version);
    expect(data.database.status).toBe("connected");
    expect(data.database.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
