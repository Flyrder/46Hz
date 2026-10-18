import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminRole = vi.fn();
vi.mock("@/lib/admin", () => ({ getAdminRole: () => getAdminRole() }));

import { POST } from "@/app/api/ai/test-connection/route";
import { applyRuntimeSettingsUpdate, FACTORY_DEFAULT_SETTINGS } from "@/settings";

function post(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost/api/ai/test-connection", {
      method: "POST",
      body: JSON.stringify(body)
    })
  );
}

describe("POST /api/ai/test-connection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAdminRole.mockReset();
    applyRuntimeSettingsUpdate(FACTORY_DEFAULT_SETTINGS);
    delete process.env.GEMINI_API_KEY;
    delete process.env.AI_API_KEY;
  });

  it("rejects non-admin callers with 403", async () => {
    getAdminRole.mockResolvedValue("MODERATOR");
    const res = await post({ provider: "gemini" });
    expect(res.status).toBe(403);
    expect((await res.json()).ok).toBe(false);
  });

  it("runs a local diagnostic for the mock provider", async () => {
    getAdminRole.mockResolvedValue("ADMIN");
    const res = await post({ provider: "mock", mockDelayMs: 0 });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.provider).toBe("mock");
  });

  it("treats any non-supported provider string as mock", async () => {
    getAdminRole.mockResolvedValue("ADMIN");
    const res = await post({ provider: "anthropic", mockDelayMs: 0 });
    expect((await res.json()).provider).toBe("mock");
  });

  it("reports a missing Gemini API key as a 400 without calling the network", async () => {
    getAdminRole.mockResolvedValue("ADMIN");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await post({ provider: "gemini", apiKey: "   " });
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.provider).toBe("gemini");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls the native Interactions endpoint with the supplied key and succeeds", async () => {
    getAdminRole.mockResolvedValue("ADMIN");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ output_text: JSON.stringify({ status: "ok", message: "ready" }) }),
        { status: 200 }
      )
    );
    const res = await post({ provider: "gemini", apiKey: "AIzaSy-test", model: "gemini-3.8-flash" });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.endpoint).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/interactions");
    const headers = init.headers as Record<string, string>;
    expect(headers["x-goog-api-key"]).toBe("AIzaSy-test");
    expect(headers["Api-Revision"]).toBe("2026-05-20");
  });
});
