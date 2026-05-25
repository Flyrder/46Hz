import { describe, expect, it } from "vitest";
import {
  canTransitionLetter,
  canTransitionReply,
  nextResponderTrustScore
} from "@/lib/moderation/status";

describe("moderation transitions", () => {
  it("allows draft letters to become pending or routed to support, but not approved directly", () => {
    expect(canTransitionLetter("DRAFT", "PENDING")).toBe(true);
    expect(canTransitionLetter("DRAFT", "ROUTED_TO_SUPPORT")).toBe(true);
    expect(canTransitionLetter("DRAFT", "APPROVED")).toBe(false);
  });

  it("allows admins to approve or reject pending letters", () => {
    expect(canTransitionLetter("PENDING", "APPROVED")).toBe(true);
    expect(canTransitionLetter("PENDING", "REJECTED")).toBe(true);
    expect(canTransitionLetter("APPROVED", "PENDING")).toBe(false);
  });

  it("allows pending replies to be approved or rejected once", () => {
    expect(canTransitionReply("PENDING", "APPROVED")).toBe(true);
    expect(canTransitionReply("PENDING", "REJECTED")).toBe(true);
    expect(canTransitionReply("APPROVED", "PENDING")).toBe(false);
  });

  it("updates responder trust score from feedback without leaving the 0-100 range", () => {
    expect(
      nextResponderTrustScore(50, {
        feltUnderstood: true,
        helpful: true,
        tooJudgmental: false,
        tooMuchAdvice: false,
        reported: false
      })
    ).toBe(57);
    expect(
      nextResponderTrustScore(2, {
        feltUnderstood: false,
        helpful: false,
        tooJudgmental: true,
        tooMuchAdvice: true,
        reported: true
      })
    ).toBe(0);
  });
});
