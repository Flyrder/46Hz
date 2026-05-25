import { describe, expect, it } from "vitest";
import {
  defaultThemePreference,
  normalizeThemePreference,
  themeOptions
} from "@/lib/theme";

describe("theme preferences", () => {
  it("normalizes supported theme modes and falls back to system", () => {
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("system")).toBe("system");
    expect(normalizeThemePreference("light")).toBe("light");
    expect(normalizeThemePreference("dim")).toBe(defaultThemePreference);
  });

  it("keeps pure dark and system as first-class options", () => {
    expect(themeOptions.map((option) => option.value)).toEqual([
      "system",
      "light",
      "dark"
    ]);
  });
});
