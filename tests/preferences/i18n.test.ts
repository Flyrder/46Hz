import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  localeOptions,
  normalizeLocale,
  translate
} from "@/lib/i18n";

describe("i18n preferences", () => {
  it("normalizes supported app locales and falls back to en_US", () => {
    expect(normalizeLocale("ko_KR")).toBe("ko_KR");
    expect(normalizeLocale("zh_CN")).toBe("zh_CN");
    expect(normalizeLocale("es")).toBe(defaultLocale);
  });

  it("exposes exactly the supported locale options", () => {
    expect(localeOptions.map((option) => option.value)).toEqual([
      "en_US",
      "ko_KR",
      "zh_CN"
    ]);
  });

  it("translates known keys with English fallback", () => {
    expect(translate("ko_KR", "nav.write")).toBe("쓰기");
    expect(translate("zh_CN", "theme.dark")).toBe("纯深色");
    expect(translate("zh_CN", "unknown.key")).toBe("unknown.key");
  });
});
