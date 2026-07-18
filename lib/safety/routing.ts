import type { LetterStatus, RiskLevel } from "@/lib/domain";

export type LetterRouting = {
  submitStatus: LetterStatus;
  canEnterPeerPool: boolean;
  showSupportResources: boolean;
};

export function getLetterRouting(riskLevel: RiskLevel): LetterRouting {
  switch (riskLevel) {
    case "NORMAL":
      return {
        submitStatus: "PENDING",
        canEnterPeerPool: true,
        showSupportResources: false
      };
    case "SENSITIVE":
      return {
        submitStatus: "PENDING",
        canEnterPeerPool: false,
        showSupportResources: false
      };
    case "HIGH":
      return {
        submitStatus: "ROUTED_TO_SUPPORT",
        canEnterPeerPool: false,
        showSupportResources: true
      };
    case "BLOCKED":
      return {
        submitStatus: "REJECTED",
        canEnterPeerPool: false,
        showSupportResources: true
      };
  }
}

export function isPeerMatchable(input: {
  status: LetterStatus;
  riskLevel: RiskLevel;
}): boolean {
  return input.status === "APPROVED" && input.riskLevel === "NORMAL";
}

export function shouldShowSupportResources(riskLevel: RiskLevel): boolean {
  return riskLevel === "HIGH" || riskLevel === "BLOCKED";
}

export function shouldMaskLetterContent(input: {
  status: LetterStatus;
  riskLevel: RiskLevel;
}): boolean {
  return (
    input.riskLevel !== "NORMAL" ||
    input.status === "ROUTED_TO_SUPPORT" ||
    input.status === "REJECTED"
  );
}
