import { describe, expect, it } from "vitest";
import {
  getLetterRouting,
  isPeerMatchable,
  shouldMaskLetterContent,
  shouldShowSupportResources
} from "@/lib/safety/routing";

describe("risk routing", () => {
  it("allows normal and sensitive letters into moderation but only normal approved letters into peer matching by default", () => {
    expect(getLetterRouting("NORMAL")).toEqual({
      submitStatus: "PENDING",
      canEnterPeerPool: true,
      showSupportResources: false
    });
    expect(getLetterRouting("SENSITIVE")).toEqual({
      submitStatus: "PENDING",
      canEnterPeerPool: false,
      showSupportResources: false
    });
  });

  it("routes high and blocked letters away from peer responders", () => {
    expect(getLetterRouting("HIGH")).toEqual({
      submitStatus: "ROUTED_TO_SUPPORT",
      canEnterPeerPool: false,
      showSupportResources: true
    });
    expect(getLetterRouting("BLOCKED")).toEqual({
      submitStatus: "REJECTED",
      canEnterPeerPool: false,
      showSupportResources: true
    });
  });

  it("prevents high-risk approved records from being matched defensively", () => {
    expect(isPeerMatchable({ status: "APPROVED", riskLevel: "NORMAL" })).toBe(true);
    expect(isPeerMatchable({ status: "APPROVED", riskLevel: "SENSITIVE" })).toBe(false);
    expect(isPeerMatchable({ status: "APPROVED", riskLevel: "HIGH" })).toBe(false);
    expect(isPeerMatchable({ status: "PENDING", riskLevel: "NORMAL" })).toBe(false);
  });

  it("shows support resources for high-risk routes", () => {
    expect(shouldShowSupportResources("HIGH")).toBe(true);
    expect(shouldShowSupportResources("BLOCKED")).toBe(true);
    expect(shouldShowSupportResources("NORMAL")).toBe(false);
  });

  it("masks peer-unsafe letter content in ordinary user surfaces", () => {
    expect(shouldMaskLetterContent({ status: "ROUTED_TO_SUPPORT", riskLevel: "HIGH" })).toBe(true);
    expect(shouldMaskLetterContent({ status: "REJECTED", riskLevel: "BLOCKED" })).toBe(true);
    expect(shouldMaskLetterContent({ status: "APPROVED", riskLevel: "SENSITIVE" })).toBe(true);
    expect(shouldMaskLetterContent({ status: "APPROVED", riskLevel: "NORMAL" })).toBe(false);
  });
});
