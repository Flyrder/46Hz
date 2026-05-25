import type { LetterStatus, ReplyStatus } from "@/lib/domain";

const letterTransitions: Record<LetterStatus, LetterStatus[]> = {
  DRAFT: ["PENDING", "ROUTED_TO_SUPPORT", "REJECTED"],
  PENDING: ["APPROVED", "REJECTED", "ROUTED_TO_SUPPORT"],
  APPROVED: ["REJECTED"],
  REJECTED: [],
  ROUTED_TO_SUPPORT: ["REJECTED"]
};

const replyTransitions: Record<ReplyStatus, ReplyStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["REJECTED"],
  REJECTED: []
};

export type FeedbackSignals = {
  feltUnderstood: boolean;
  helpful: boolean;
  tooJudgmental: boolean;
  tooMuchAdvice: boolean;
  reported: boolean;
};

export function canTransitionLetter(
  current: LetterStatus,
  next: LetterStatus
): boolean {
  return letterTransitions[current].includes(next);
}

export function canTransitionReply(current: ReplyStatus, next: ReplyStatus): boolean {
  return replyTransitions[current].includes(next);
}

export function nextResponderTrustScore(
  currentScore: number,
  feedback: FeedbackSignals
): number {
  const delta =
    (feedback.feltUnderstood ? 4 : 0) +
    (feedback.helpful ? 3 : 0) -
    (feedback.tooJudgmental ? 5 : 0) -
    (feedback.tooMuchAdvice ? 3 : 0) -
    (feedback.reported ? 8 : 0);

  return Math.max(0, Math.min(100, currentScore + delta));
}
