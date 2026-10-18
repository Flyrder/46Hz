import type { Models } from "@/prisma/contract";

export type AgeRange = Models.public_User["ageRange"];
export type ReplyType = Models.public_Letter["desiredReplyType"];
export type RiskLevel = Models.public_Letter["riskLevel"];
export type LetterStatus = Models.public_Letter["status"];
export type ReplyStatus = Models.public_Reply["status"];
export type MatchStatus = Models.public_Match["status"];

export const replyTypeLabels: Record<ReplyType, string> = {
  COMFORT: "Comfort",
  ADVICE: "Gentle advice",
  SIMILAR_EXPERIENCES: "Similar experiences",
  JUST_BEING_HEARD: "Just being heard"
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  NORMAL: "Normal",
  SENSITIVE: "Sensitive",
  HIGH: "High",
  BLOCKED: "Blocked"
};

export const letterStatusLabels: Record<LetterStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ROUTED_TO_SUPPORT: "Routed to support"
};
