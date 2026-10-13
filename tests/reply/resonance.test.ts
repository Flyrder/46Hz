import { describe, expect, it } from "vitest";
import {
  DEFAULT_RESONANCE_CAP,
  EXPANDED_RESONANCE_CAP,
  isResonanceFull,
  canExpandResonance
} from "@/lib/reply/claiming";

describe("46Hz Schumann Resonance Harmonic Reply Cap", () => {
  it("defaults to 7 replies (Earth's 7th Schumann harmonic resonance)", () => {
    expect(DEFAULT_RESONANCE_CAP).toBe(7);
  });

  it("supports expanded resonance capacity up to 15 replies", () => {
    expect(EXPANDED_RESONANCE_CAP).toBe(15);
  });

  describe("isResonanceFull", () => {
    it("reports not full when replies are below 7 (default)", () => {
      expect(isResonanceFull(0)).toBe(false);
      expect(isResonanceFull(3)).toBe(false);
      expect(isResonanceFull(6)).toBe(false);
    });

    it("reports full when replies reach 7 (default)", () => {
      expect(isResonanceFull(7)).toBe(true);
      expect(isResonanceFull(8)).toBe(true);
    });

    it("respects expanded capacity of 15 when specified", () => {
      expect(isResonanceFull(7, 15)).toBe(false);
      expect(isResonanceFull(14, 15)).toBe(false);
      expect(isResonanceFull(15, 15)).toBe(true);
      expect(isResonanceFull(16, 15)).toBe(true);
    });
  });

  describe("canExpandResonance", () => {
    const letter = {
      authorId: "user-123",
      maxReplies: 7
    };

    it("allows the letter author to expand from 7 to 15", () => {
      expect(canExpandResonance(letter, "user-123")).toBe(true);
    });

    it("prevents non-authors from expanding resonance", () => {
      expect(canExpandResonance(letter, "other-user")).toBe(false);
    });

    it("prevents expansion if already expanded to 15", () => {
      const expandedLetter = {
        authorId: "user-123",
        maxReplies: 15
      };
      expect(canExpandResonance(expandedLetter, "user-123")).toBe(false);
    });
  });
});
