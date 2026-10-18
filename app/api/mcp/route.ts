import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAiMiddleware } from "@/lib/ai";
import { ensureSettingsLoadedFromDisk } from "@/lib/settings-store";
import {
  brandSettings,
  resonanceSettings,
  claimingSettings,
  getEditableSystemSettings
} from "@/settings";
import { verifyDataContract } from "@/lib/data-contract";
import type { ReplyType } from "@/lib/domain";

export const dynamic = "force-dynamic";

const MCP_SERVER_INFO = {
  name: "46hz-mcp-server",
  version: brandSettings.version,
  protocolVersion: "2024-11-05"
};

const MCP_TOOLS = [
  {
    name: "get_runtime_settings",
    description: "Inspect current unified 46Hz system settings from settings.ts and runtime override.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "query_resonance_status",
    description: "Check Schumann resonance harmonic slots, active letter claiming leases, and capacity health.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "inspect_moderation_queue",
    description: "Audit letters in the moderation queue, review flags, and recent moderation action events.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max items to return (default 10, max 50)"
        }
      },
      additionalProperties: false
    }
  },
  {
    name: "diagnose_letter_pipeline",
    description: "Run an input letter text through the 46Hz AI safety sentinel and anonymization scrubber pipeline.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Letter content to analyze"
        },
        language: {
          type: "string",
          description: "Language code (ko_KR, en_US, zh_CN)",
          default: "ko_KR"
        },
        preferredReplyType: {
          type: "string",
          enum: ["COMFORT", "ADVICE", "SIMILAR_EXPERIENCES", "JUST_BEING_HEARD"],
          description: "Preferred reply type category"
        }
      },
      required: ["text"],
      additionalProperties: false
    }
  },
  {
    name: "verify_data_contract",
    description: "Verify integrity and parity between Prisma 8 Data Contract (contract.json/d.ts), schema.prisma, and Zod validators.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
];

const MCP_RESOURCES = [
  {
    uri: "46hz://system/settings",
    name: "46Hz Unified System Settings",
    mimeType: "application/json",
    description: "Current live configuration values for 46Hz"
  },
  {
    uri: "46hz://system/contract",
    name: "Prisma 8 Data Contract Summary",
    mimeType: "application/json",
    description: "Summary of PSL Data Contract roots and schema version"
  },
  {
    uri: "46hz://system/resonance",
    name: "Schumann Resonance Capacity",
    mimeType: "application/json",
    description: "Harmonic parameters and claiming lease durations"
  }
];

async function handleToolCall(name: string, args: Record<string, unknown> = {}) {
  switch (name) {
    case "get_runtime_settings": {
      ensureSettingsLoadedFromDisk();
      const settings = getEditableSystemSettings();
      // Mask any API keys before returning to prevent leaking secrets over MCP
      const sanitized = {
        ...settings,
        aiApiKey: settings.aiApiKey ? "********" : ""
      };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sanitized, null, 2)
          }
        ]
      };
    }

    case "query_resonance_status": {
      ensureSettingsLoadedFromDisk();
      const now = new Date();
      const leaseDurationMs = claimingSettings.leaseDurationMinutes * 60 * 1000;
      const leaseThreshold = new Date(now.getTime() - leaseDurationMs);

      const [totalLetters, activeClaimsCount, expiredMatchesCount] = await Promise.all([
        prisma.letter.count({ where: { status: "APPROVED" } }),
        prisma.match.count({
          where: {
            status: "OFFERED",
            createdAt: { gte: leaseThreshold }
          }
        }),
        prisma.match.count({
          where: {
            status: { in: ["EXPIRED", "SKIPPED"] }
          }
        })
      ]);

      const data = {
        schumannHarmonics: {
          baseFrequencyHz: 7.83,
          seventhHarmonicHz: 45.9,
          defaultMaxReplies: resonanceSettings.defaultMaxReplies,
          expandedMaxReplies: resonanceSettings.expandedMaxReplies
        },
        claimingLease: {
          leaseDurationMinutes: claimingSettings.leaseDurationMinutes,
          activeClaims: activeClaimsCount,
          expiredOrSkippedMatches: expiredMatchesCount
        },
        letterPool: {
          totalApprovedLetters: totalLetters
        }
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }

    case "inspect_moderation_queue": {
      const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);

      const [pendingLetters, recentEvents] = await Promise.all([
        prisma.letter.findMany({
          where: {
            OR: [
              { status: "PENDING" },
              { riskLevel: { in: ["HIGH", "BLOCKED", "SENSITIVE"] } }
            ]
          },
          select: {
            id: prisma.letter.fields.id ? true : true,
            status: true,
            riskLevel: true,
            createdAt: true,
            desiredReplyType: true,
            _count: {
              select: { replies: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: limit
        }),
        prisma.moderationEvent.findMany({
          select: {
            id: true,
            targetType: true,
            targetId: true,
            action: true,
            reason: true,
            previousStatus: true,
            newStatus: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" },
          take: limit
        })
      ]);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                pendingQueueCount: pendingLetters.length,
                pendingLetters,
                recentModerationEvents: recentEvents
              },
              null,
              2
            )
          }
        ]
      };
    }

    case "diagnose_letter_pipeline": {
      const text = String(args.text || "").trim();
      if (!text) {
        throw new Error("Missing required argument 'text'");
      }
      const language = String(args.language || "ko_KR");
      const preferredReplyType = (args.preferredReplyType as ReplyType) || "COMFORT";

      const startTime = Date.now();
      const ai = getAiMiddleware();
      const processed = await ai.processLetter({
        text,
        language,
        preferredReplyType
      });
      const durationMs = Date.now() - startTime;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                durationMs,
                processedText: processed.processedText,
                risk: processed.risk,
                anonymization: processed.anonymization,
                emotionTags: processed.emotionTags,
                situationTags: processed.situationTags,
                desiredReplyType: processed.desiredReplyType
              },
              null,
              2
            )
          }
        ]
      };
    }

    case "verify_data_contract": {
      const result = verifyDataContract();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: !result.ok
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleResourceRead(uri: string) {
  switch (uri) {
    case "46hz://system/settings": {
      ensureSettingsLoadedFromDisk();
      const settings = getEditableSystemSettings();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                ...settings,
                aiApiKey: settings.aiApiKey ? "********" : ""
              },
              null,
              2
            )
          }
        ]
      };
    }

    case "46hz://system/contract": {
      const result = verifyDataContract();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }

    case "46hz://system/resonance": {
      ensureSettingsLoadedFromDisk();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                baseFrequencyHz: 7.83,
                seventhHarmonicHz: 45.9,
                defaultMaxReplies: resonanceSettings.defaultMaxReplies,
                expandedMaxReplies: resonanceSettings.expandedMaxReplies,
                leaseDurationMinutes: claimingSettings.leaseDurationMinutes
              },
              null,
              2
            )
          }
        ]
      };
    }

    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}

const activeSessions = new Set<string>();

function resolveSessionId(req?: NextRequest): string {
  const fromHeader = req?.headers?.get("mcp-session-id");
  if (fromHeader && fromHeader.trim().length > 0) {
    const id = fromHeader.trim();
    activeSessions.add(id);
    return id;
  }
  const newId = crypto.randomUUID();
  activeSessions.add(newId);
  return newId;
}

function getMcpHeaders(sessionId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Mcp-Session-Id": sessionId,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, Authorization, Accept",
    "Access-Control-Expose-Headers": "Mcp-Session-Id"
  };
}

function getNotificationHeaders(sessionId: string): Record<string, string> {
  return {
    "Mcp-Session-Id": sessionId,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, Authorization, Accept",
    "Access-Control-Expose-Headers": "Mcp-Session-Id"
  };
}

/**
 * OPTIONS /api/mcp - CORS Preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS, HEAD",
      "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, Authorization, Accept",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
      "Access-Control-Max-Age": "86400"
    }
  });
}

/**
 * DELETE /api/mcp - Session Termination
 */
export async function DELETE(req: NextRequest) {
  const sessionId = resolveSessionId(req);
  activeSessions.delete(sessionId);
  return new Response(null, {
    status: 204,
    headers: getNotificationHeaders(sessionId)
  });
}

/**
 * GET /api/mcp - Discovery, Capability & SSE Streaming endpoint
 */
export async function GET(req?: NextRequest) {
  const sessionId = resolveSessionId(req);
  const accept = req?.headers?.get("accept") || "";

  // Handle Server-Sent Events (SSE) stream if requested by Streamable HTTP client
  if (accept.includes("text/event-stream") && req) {
    const encoder = new TextEncoder();
    let isClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(": connection established\n\n"));
        const interval = setInterval(() => {
          if (isClosed) {
            clearInterval(interval);
            return;
          }
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            isClosed = true;
            clearInterval(interval);
          }
        }, 15000);

        req.signal?.addEventListener("abort", () => {
          isClosed = true;
          clearInterval(interval);
          try {
            controller.close();
          } catch {
            // ignore
          }
        });
      },
      cancel() {
        isClosed = true;
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Mcp-Session-Id": sessionId,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "Mcp-Session-Id"
      }
    });
  }

  // Standard JSON discovery response
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      server: MCP_SERVER_INFO,
      capabilities: {
        tools: {
          listChanged: false
        },
        resources: {
          subscribe: false,
          listChanged: false
        },
        prompts: {
          listChanged: false
        },
        logging: {}
      },
      tools: MCP_TOOLS,
      resources: MCP_RESOURCES,
      prompts: []
    },
    {
      headers: getMcpHeaders(sessionId)
    }
  );
}

/**
 * POST /api/mcp - JSON-RPC 2.0 Request & Notification Handler
 */
export async function POST(req: NextRequest) {
  const sessionId = resolveSessionId(req);
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error: Invalid JSON was received by the server."
        }
      },
      {
        status: 400,
        headers: getMcpHeaders(sessionId)
      }
    );
  }

  const body = (rawBody && typeof rawBody === "object" ? rawBody : {}) as Record<string, unknown>;
  const hasId = "id" in body && body.id !== undefined;
  const id = hasId ? (body.id as string | number | null) : null;
  const method = typeof body.method === "string" ? body.method : "";
  const params = (body.params && typeof body.params === "object" ? body.params : {}) as Record<string, unknown>;

  if (!method) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32600,
          message: "Invalid Request: 'method' field is required."
        }
      },
      {
        status: 400,
        headers: getMcpHeaders(sessionId)
      }
    );
  }

  // Check if this is a notification (no id property provided, or explicit notification method)
  const isNotification =
    !hasId ||
    method === "notifications/initialized" ||
    method.startsWith("notifications/") ||
    method.startsWith("$/");

  // Notifications MUST receive 202 Accepted and no response body in Streamable HTTP
  if (isNotification && (method === "notifications/initialized" || method.startsWith("notifications/") || method.startsWith("$/"))) {
    return new Response(null, {
      status: 202,
      headers: getNotificationHeaders(sessionId)
    });
  }

  try {
    switch (method) {
      case "ping": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {}
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      case "initialize": {
        const clientProtocolVersion =
          typeof params.protocolVersion === "string" && params.protocolVersion.trim()
            ? params.protocolVersion.trim()
            : MCP_SERVER_INFO.protocolVersion;

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: clientProtocolVersion,
              serverInfo: {
                name: MCP_SERVER_INFO.name,
                version: MCP_SERVER_INFO.version
              },
              capabilities: {
                tools: {
                  listChanged: false
                },
                resources: {
                  subscribe: false,
                  listChanged: false
                },
                prompts: {
                  listChanged: false
                },
                logging: {}
              }
            }
          },
          {
            headers: getMcpHeaders(sessionId)
          }
        );
      }

      case "notifications/initialized": {
        return new Response(null, {
          status: 202,
          headers: getNotificationHeaders(sessionId)
        });
      }

      case "tools/list": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              tools: MCP_TOOLS
            }
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      case "tools/call": {
        const { name, arguments: args } = (params || {}) as {
          name?: string;
          arguments?: Record<string, unknown>;
        };

        if (!name || typeof name !== "string") {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Invalid params: 'name' is required for tools/call."
              }
            },
            {
              status: 400,
              headers: getMcpHeaders(sessionId)
            }
          );
        }

        try {
          const toolResult = await handleToolCall(name, args);
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: toolResult
            },
            { headers: getMcpHeaders(sessionId) }
          );
        } catch (callErr) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              result: {
                content: [
                  {
                    type: "text",
                    text: callErr instanceof Error ? callErr.message : String(callErr)
                  }
                ],
                isError: true
              }
            },
            { headers: getMcpHeaders(sessionId) }
          );
        }
      }

      case "resources/list": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              resources: MCP_RESOURCES
            }
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      case "resources/read": {
        const { uri } = (params || {}) as { uri?: string };
        if (!uri || typeof uri !== "string") {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id,
              error: {
                code: -32602,
                message: "Invalid params: 'uri' is required for resources/read."
              }
            },
            {
              status: 400,
              headers: getMcpHeaders(sessionId)
            }
          );
        }

        const resourceResult = await handleResourceRead(uri);
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: resourceResult
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      case "resources/templates/list": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              resourceTemplates: []
            }
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      case "prompts/list": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              prompts: []
            }
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      case "prompts/get": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: "Prompt not found"
            }
          },
          {
            status: 200,
            headers: getMcpHeaders(sessionId)
          }
        );
      }

      case "logging/setLevel": {
        if (isNotification) {
          return new Response(null, {
            status: 202,
            headers: getNotificationHeaders(sessionId)
          });
        }
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {}
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      case "completion/complete": {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              completion: {
                values: []
              }
            }
          },
          { headers: getMcpHeaders(sessionId) }
        );
      }

      default: {
        // If it was a notification, accept it quietly with 202
        if (isNotification) {
          return new Response(null, {
            status: 202,
            headers: getNotificationHeaders(sessionId)
          });
        }

        // For unknown request method with ID:
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: '${method}' is not supported.`
            }
          },
          {
            status: 404,
            headers: getMcpHeaders(sessionId)
          }
        );
      }
    }
  } catch (err) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32000,
          message: err instanceof Error ? err.message : String(err)
        }
      },
      {
        status: 200,
        headers: getMcpHeaders(sessionId)
      }
    );
  }
}
