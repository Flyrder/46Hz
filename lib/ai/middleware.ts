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

export type WritingSparksInput = {
  mood?: string;
  seedText?: string;
  language: string;
};

export type WritingSpark = {
  id: string;
  text: string;
  prompt: string;
};

export type WritingSparksResult = {
  sparks: WritingSpark[];
  suggestedEmotionTags: string[];
};

export type ReplyReframing = {
  label: string;
  text: string;
  tone: "warm" | "listening" | "grounding";
};

export type ToneMetrics = {
  empathy: number;      // 0-100
  gentleness: number;   // 0-100
  nonJudgmental: number; // 0-100
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
  reframings?: ReplyReframing[];
  metrics?: ToneMetrics;
};

export type ResonanceMatchInput = {
  responderPreference: ReplyType;
  language?: string;
  availableLetters: Array<{
    id: string;
    emotionTags: string[];
    situationTags: string[];
    desiredReplyType: ReplyType;
  }>;
};

export type ResonanceMatchResult = {
  recommendedLetterIds: string[];
  matchReasons: Record<string, string>;
};

export interface AiMiddleware {
  processLetter(input: ProcessLetterInput): Promise<ProcessedLetterResult>;
  coachReply(input: CoachReplyInput): Promise<CoachedReplyResult>;
  classifyRisk(input: RiskClassificationInput): Promise<RiskClassificationResult>;
  anonymize(input: AnonymizationInput): Promise<AnonymizationResult>;
  generateWritingSparks(input: WritingSparksInput): Promise<WritingSparksResult>;
  matchResonantLetters(input: ResonanceMatchInput): Promise<ResonanceMatchResult>;
}
