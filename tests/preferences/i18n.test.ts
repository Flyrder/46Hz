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
<<<<<<< HEAD
    expect(translate("ko_KR", "age.adult")).toBe("19세 이상");
    expect(translate("ko_KR", "age.under18")).toBe("19세 미만");
    expect(translate("en_US", "age.adult")).toBe("18+");
    expect(translate("en_US", "age.under18")).toBe("Under 18");
=======
>>>>>>> 2f3e05a24ebe43c1ec467468bc42a74b5966e785
  });
});
