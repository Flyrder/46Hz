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

/**
 * GET /api/mcp - Discovery & Capability endpoint
 */
export async function GET() {
  return NextResponse.json({
    jsonrpc: "2.0",
    server: MCP_SERVER_INFO,
    capabilities: {
      tools: {
        listChanged: false
      },
      resources: {
        subscribe: false,
        listChanged: false
      }
    },
    tools: MCP_TOOLS,
    resources: MCP_RESOURCES
  });
}

/**
 * POST /api/mcp - JSON-RPC 2.0 Request Handler
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
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
      { status: 400 }
    );
  }

  const { id = null, method, params = {} } = body as {
    id?: string | number | null;
    method?: string;
    params?: Record<string, unknown>;
  };

  if (!method || typeof method !== "string") {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32600,
          message: "Invalid Request: 'method' field is required."
        }
      },
      { status: 400 }
    );
  }

  try {
    switch (method) {
      case "ping": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {}
        });
      }

      case "initialize": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: MCP_SERVER_INFO.protocolVersion,
            serverInfo: MCP_SERVER_INFO,
            capabilities: {
              tools: {},
              resources: {}
            }
          }
        });
      }

      case "tools/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS
          }
        });
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
            { status: 400 }
          );
        }

        const toolResult = await handleToolCall(name, args);
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: toolResult
        });
      }

      case "resources/list": {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            resources: MCP_RESOURCES
          }
        });
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
            { status: 400 }
          );
        }

        const resourceResult = await handleResourceRead(uri);
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: resourceResult
        });
      }

      default: {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method not found: '${method}' is not supported.`
            }
          },
          { status: 404 }
        );
      }
    }
  } catch (err) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32000,
        message: err instanceof Error ? err.message : String(err)
      }
    });
  }
}
