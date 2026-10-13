import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Minimalist cn utility", () => {
  it("joins simple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles falsy values, null, undefined, booleans, and 0", () => {
    expect(cn("foo", null, undefined, false, true && "bar", 0 && "baz")).toBe("foo bar");
  });

  it("handles conditional objects", () => {
    expect(
      cn("base", {
        active: true,
        disabled: false,
        highlight: null,
        visible: undefined
      })
    ).toBe("base active");
  });

  it("handles nested arrays", () => {
    expect(cn(["a", ["b", ["c"]]], "d")).toBe("a b c d");
  });

  it("returns empty string when given no truthy inputs", () => {
    expect(cn(null, false, undefined)).toBe("");
  });
});
