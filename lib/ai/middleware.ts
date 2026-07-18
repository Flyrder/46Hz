import type { ReplyType, RiskLevel } from "@/lib/domain";

export type ProcessLetterInput = {
  text: string;
  language: string;
  preferredReplyType: ReplyType;
};

export type RiskClassificationInput = {
  text: string;
  language: string;
};

export type AnonymizationInput = {
  text: string;
  language: string;
};

export type CoachReplyInput = {
  letterText: string;
  replyText: string;
  desiredReplyType: ReplyType;
  language: string;
};

export type RiskClassificationResult = {
  level: RiskLevel;
  reasons: string[];
  peerSafe: boolean;
  supportMessage?: string;
};

export type AnonymizationResult = {
  text: string;
  flaggedTerms: string[];
};

export type ProcessedLetterResult = {
  processedText: string;
  emotionTags: string[];
  situationTags: string[];
  desiredReplyType: ReplyType;
  anonymization: AnonymizationResult;
  risk: RiskClassificationResult;
};

export type CoachedReplyResult = {
  coachedText: string;
  flags: string[];
  suggestions: string[];
};

export interface AiMiddleware {
  processLetter(input: ProcessLetterInput): Promise<ProcessedLetterResult>;
  coachReply(input: CoachReplyInput): Promise<CoachedReplyResult>;
  classifyRisk(input: RiskClassificationInput): Promise<RiskClassificationResult>;
  anonymize(input: AnonymizationInput): Promise<AnonymizationResult>;
}
