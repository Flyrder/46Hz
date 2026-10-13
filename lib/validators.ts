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

export function formValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function formBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}
