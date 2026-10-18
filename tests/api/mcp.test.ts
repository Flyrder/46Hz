import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, DELETE, OPTIONS } from "@/app/api/mcp/route";

describe("MCP (Model Context Protocol) API Endpoint (/api/mcp)", () => {
  it("GET returns server discovery catalog with protocolVersion, tools, and resources", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jsonrpc).toBe("2.0");
    expect(data.server.name).toBe("46hz-mcp-server");
    expect(data.server.protocolVersion).toBe("2024-11-05");
    expect(Array.isArray(data.tools)).toBe(true);
    expect(data.tools.length).toBeGreaterThanOrEqual(5);

    const toolNames = data.tools.map((t: { name: string }) => t.name);
    expect(toolNames).toContain("get_runtime_settings");
    expect(toolNames).toContain("query_resonance_status");
    expect(toolNames).toContain("inspect_moderation_queue");
    expect(toolNames).toContain("diagnose_letter_pipeline");
    expect(toolNames).toContain("verify_data_contract");
  });

  it("POST handles 'initialize' method", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {}
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jsonrpc).toBe("2.0");
    expect(data.id).toBe(1);
    expect(data.result.serverInfo.name).toBe("46hz-mcp-server");
    expect(data.result.protocolVersion).toBe("2024-11-05");
  });

  it("POST handles 'ping' method", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "ping-1",
        method: "ping"
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jsonrpc).toBe("2.0");
    expect(data.id).toBe("ping-1");
    expect(data.result).toEqual({});
  });

  it("POST handles 'tools/list' method", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list"
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jsonrpc).toBe("2.0");
    expect(Array.isArray(data.result.tools)).toBe(true);
  });

  it("POST tools/call: 'get_runtime_settings' returns masked settings", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "get_runtime_settings",
          arguments: {}
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.jsonrpc).toBe("2.0");
    expect(data.id).toBe(3);
    expect(data.result.content[0].type).toBe("text");

    const parsed = JSON.parse(data.result.content[0].text);
    expect(parsed.brandName).toBe("46Hz");
    expect(parsed.aiApiKey).not.toContain("AQ.");
  });

  it("POST tools/call: 'verify_data_contract' executes contract checks", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "verify_data_contract",
          arguments: {}
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.id).toBe(4);
    const parsed = JSON.parse(data.result.content[0].text);
    expect(parsed.ok).toBe(true);
    expect(parsed.models.length).toBeGreaterThanOrEqual(8);
  });

  it("POST tools/call: 'inspect_moderation_queue' projects only queue metadata without leaking rawText or authorId", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 40,
        method: "tools/call",
        params: {
          name: "inspect_moderation_queue",
          arguments: { limit: 5 }
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    const parsed = JSON.parse(data.result.content[0].text);
    expect(Array.isArray(parsed.pendingLetters)).toBe(true);
    for (const item of parsed.pendingLetters) {
      expect(Object.hasOwn(item, "rawText")).toBe(false);
      expect(Object.hasOwn(item, "processedText")).toBe(false);
      expect(Object.hasOwn(item, "authorId")).toBe(false);
      expect(typeof item._count?.replies).toBe("number");
    }
  });

  it("POST tools/call: 'diagnose_letter_pipeline' runs text through AI middleware", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: {
          name: "diagnose_letter_pipeline",
          arguments: {
            text: "요즘 취업 준비가 너무 길어지면서 마음에 불안이 차오르고 지치네요. 밤마다 잠을 잘 못 이루고 있습니다.",
            language: "ko_KR",
            preferredReplyType: "COMFORT"
          }
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.id).toBe(5);
    const parsed = JSON.parse(data.result.content[0].text);
    expect(parsed.processedText).toBeDefined();
    expect(parsed.risk).toBeDefined();
    expect(Array.isArray(parsed.emotionTags)).toBe(true);
  });

  it("POST returns -32601 for unsupported methods", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 99,
        method: "unsupported/method"
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error.code).toBe(-32601);
  });

  it("POST handles resources/list and resources/read", async () => {
    const listReq = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 6,
        method: "resources/list"
      })
    });
    const listRes = await POST(listReq);
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.result.resources.length).toBeGreaterThanOrEqual(1);

    const readReq = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 7,
        method: "resources/read",
        params: { uri: "46hz://system/resonance" }
      })
    });
    const readRes = await POST(readReq);
    expect(readRes.status).toBe(200);
    const readData = await readRes.json();
    expect(readData.result.contents[0].uri).toBe("46hz://system/resonance");
  });

  it("POST handles Streamable HTTP 'notifications/initialized' returning 202 Accepted", async () => {
    const initReq = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 10,
        method: "initialize",
        params: { protocolVersion: "2024-11-05" }
      })
    });
    const initRes = await POST(initReq);
    expect(initRes.status).toBe(200);
    const sessionId = initRes.headers.get("mcp-session-id");
    expect(sessionId).toBeTruthy();

    const notifReq = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Mcp-Session-Id": sessionId!
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized"
      })
    });
    const notifRes = await POST(notifReq);
    expect(notifRes.status).toBe(202);
    expect(notifRes.headers.get("mcp-session-id")).toBe(sessionId);
  });

  it("POST handles 'prompts/list' method", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 11,
        method: "prompts/list"
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result.prompts).toEqual([]);
  });

  it("DELETE terminates MCP session with 204", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "DELETE",
      headers: { "Mcp-Session-Id": "test-session-id" }
    });

    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("mcp-session-id")).toBe("test-session-id");
  });

  it("OPTIONS returns CORS preflight headers with 204", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(res.headers.get("Access-Control-Expose-Headers")).toContain("Mcp-Session-Id");
  });

  it("GET supports SSE streaming when text/event-stream is accepted", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "GET",
      headers: { Accept: "text/event-stream" }
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("mcp-session-id")).toBeTruthy();
  });
});
