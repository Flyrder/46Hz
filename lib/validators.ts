import { z } from "zod";

export const ageRangeSchema = z.enum(["UNDER_18", "ADULT"]);
export const replyTypeSchema = z.enum([
  "COMFORT",
  "ADVICE",
  "SIMILAR_EXPERIENCES",
  "JUST_BEING_HEARD"
]);
export const riskLevelSchema = z.enum(["NORMAL", "SENSITIVE", "HIGH", "BLOCKED"]);
export const letterStatusSchema = z.enum([
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ROUTED_TO_SUPPORT"
]);
export const replyStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const onboardingSchema = z.object({
  language: z.enum(["en_US", "ko_KR", "zh_CN"]),
  ageRange: ageRangeSchema,
  preferredReplyType: replyTypeSchema
});

export const writeLetterSchema = z.object({
  rawText: z.string().trim().min(40, "Write at least a few sentences.").max(4000)
});

export const reviewLetterSchema = z.object({
  letterId: z.string().min(1),
  processedText: z.string().trim().min(20).max(4000)
});

export const coachReplySchema = z.object({
  letterId: z.string().min(1),
  replyText: z.string().trim().min(20).max(3000)
});

export const submitReplySchema = z.object({
  letterId: z.string().min(1),
  rawText: z.string().trim().min(20).max(3000),
  coachedText: z.string().trim().min(20).max(3000)
});

export const feedbackSchema = z.object({
  replyId: z.string().min(1),
  feltUnderstood: z.boolean(),
  helpful: z.boolean(),
  tooJudgmental: z.boolean(),
  tooMuchAdvice: z.boolean(),
  reportReason: z.string().trim().max(800).optional()
});

export const adminLetterSchema = z.object({
  letterId: z.string().min(1),
  status: letterStatusSchema,
  riskLevel: riskLevelSchema,
  reason: z.string().trim().max(800).optional()
});

export const adminReplySchema = z.object({
  replyId: z.string().min(1),
  status: replyStatusSchema,
  reason: z.string().trim().max(800).optional()
});

export const supportResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(300),
  region: z.string().trim().min(2).max(80),
  language: z.string().trim().min(2).max(12),
  url: z.string().trim().url().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  active: z.boolean()
});

export const createCommentSchema = z.object({
  letterId: z.string().min(1),
  selectedText: z.string().trim().max(500).default(""),
  content: z.string().trim().min(1, "Comment cannot be empty.").max(1000)
});

export const writingSparksSchema = z.object({
  mood: z.string().trim().max(100).optional(),
  seedText: z.string().trim().max(1000).optional(),
  language: z.enum(["en_US", "ko_KR", "zh_CN"]).default("ko_KR")
});

export const resonanceMatchSchema = z.object({
  responderPreference: replyTypeSchema,
  language: z.enum(["en_US", "ko_KR", "zh_CN"]).optional(),
  availableLetters: z.array(
    z.object({
      id: z.string().min(1),
      emotionTags: z.array(z.string()),
      situationTags: z.array(z.string()),
      desiredReplyType: replyTypeSchema
    })
  )
});

export const systemSettingsSchema = z
  .object({
    brandName: z.string().trim().min(1).max(40),
    brandTitle: z.string().trim().min(2).max(80),
    brandTagline: z.string().trim().min(5).max(160),
    brandVersion: z.string().trim().min(1).max(24),
    defaultLocale: z.enum(["ko_KR", "en_US", "zh_CN"]),
    defaultTheme: z.enum(["system", "light", "dark"]),
    cookieMaxAgeDays: z.coerce.number().int().min(1).max(365),
    migrationCodePrefix: z
      .string()
      .trim()
      .min(2)
      .max(12)
      .regex(/^[A-Z0-9-]+$/, "Prefix must contain uppercase letters, numbers, or hyphens."),
    defaultMaxReplies: z.coerce.number().int().min(1).max(30),
    expandedMaxReplies: z.coerce.number().int().min(2).max(50),
    leaseDurationMinutes: z.coerce.number().int().min(1).max(120),
    adminLoginMaxRequests: z.coerce.number().int().min(1).max(100),
    adminLoginWindowSeconds: z.coerce.number().int().min(10).max(3600),
    writeLetterMaxRequests: z.coerce.number().int().min(1).max(100),
    writeLetterWindowSeconds: z.coerce.number().int().min(10).max(3600),
    coachReplyMaxRequests: z.coerce.number().int().min(1).max(100),
    coachReplyWindowSeconds: z.coerce.number().int().min(10).max(3600),
    ipRetentionDays: z.coerce.number().int().min(1).max(90),
    maxRecentIps: z.coerce.number().int().min(1).max(20),
    legalBasis: z.string().trim().min(5).max(300),
    dataMinimizationNotice: z.string().trim().min(10).max(500),
    enableAi: z.boolean().default(true),
    enableAiRiskSafety: z.boolean().default(true),
    enableAiAnonymization: z.boolean().default(true),
    enableAiReplyCoach: z.boolean().default(true),
    enableAiWritingSparks: z.boolean().default(true),
    enableAiResonanceMatch: z.boolean().default(true),
    aiDefaultProvider: z.enum(["mock", "gemini"]),
    aiTimeoutMs: z.coerce.number().int().min(1000).max(120000),
    aiMockDelayMs: z.coerce.number().int().min(0).max(5000),
    aiTemperature: z.coerce.number().min(0).max(2).default(0.7),
    aiMaxTokens: z.coerce.number().int().min(50).max(65536).default(4096),
    aiThinkingLevel: z.enum(["minimal", "low", "medium", "high"]).default("low"),
    aiStoreInteractions: z.boolean().default(false),
    aiModel: z.string().trim().min(1).max(80).default("gemini-3.8-flash"),
    aiApiKey: z.string().trim().max(500).default(""),
    aiBaseUrl: z.string().trim().max(500).default(""),
    aiSystemPrompt: z.string().trim().max(8000).default(""),
    aiPromptRiskSafety: z.string().trim().max(8000).default(""),
    aiPromptAnonymization: z.string().trim().max(8000).default(""),
    aiPromptReplyCoach: z.string().trim().max(8000).default(""),
    aiPromptWritingSparks: z.string().trim().max(8000).default(""),
    aiPromptResonanceMatch: z.string().trim().max(8000).default(""),
    enableChinaSupportInfo: z.boolean().default(false)
  })
  .refine((data) => data.expandedMaxReplies >= data.defaultMaxReplies, {
    message: "Expanded max replies must be greater than or equal to default max replies.",
    path: ["expandedMaxReplies"]
  });

export function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function formBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

