import { describe, it, expect } from "vitest";
import { parseUserAgent } from "@/lib/ip";

describe("Browser User Agent Collector & Parser", () => {
  it("detects Chrome on Windows desktop", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const res = parseUserAgent(ua);
    expect(res).toEqual({
      browser: "Chrome",
      os: "Windows",
      device: "Desktop"
    });
  });

  it("detects Safari on iPhone (iOS Mobile)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
    const res = parseUserAgent(ua);
    expect(res).toEqual({
      browser: "Safari",
      os: "iOS",
      device: "Mobile"
    });
  });

  it("detects Chrome on Android mobile", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36";
    const res = parseUserAgent(ua);
    expect(res).toEqual({
      browser: "Chrome",
      os: "Android",
      device: "Mobile"
    });
  });

  it("detects Firefox on macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:120.0) Gecko/20100101 Firefox/120.0";
    const res = parseUserAgent(ua);
    expect(res).toEqual({
      browser: "Firefox",
      os: "macOS",
      device: "Desktop"
    });
  });

  it("detects Microsoft Edge", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
    const res = parseUserAgent(ua);
    expect(res).toEqual({
      browser: "Microsoft Edge",
      os: "Windows",
      device: "Desktop"
    });
  });

  it("detects search bots and crawlers", () => {
    const ua =
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    const res = parseUserAgent(ua);
    expect(res.device).toBe("Bot");
  });

  it("handles unknown or empty user agents gracefully", () => {
    expect(parseUserAgent("")).toEqual({
      browser: "Unknown",
      os: "Unknown",
      device: "Unknown"
    });
    expect(parseUserAgent("Unknown")).toEqual({
      browser: "Unknown",
      os: "Unknown",
      device: "Unknown"
    });
  });
});
