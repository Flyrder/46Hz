export type AgeRange = "UNDER_18" | "ADULT";

export type ReplyType =
  | "COMFORT"
  | "ADVICE"
  | "SIMILAR_EXPERIENCES"
  | "JUST_BEING_HEARD";

export type RiskLevel = "NORMAL" | "SENSITIVE" | "HIGH" | "BLOCKED";

export type LetterStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ROUTED_TO_SUPPORT";

export type ReplyStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MatchStatus = "OFFERED" | "RESPONDED" | "SKIPPED" | "EXPIRED";

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
