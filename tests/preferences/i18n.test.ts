import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  localeOptions,
  normalizeLocale,
  translate
} from "@/lib/i18n";

describe("i18n preferences", () => {
  it("defaults to ko_KR and normalizes supported app locales with fallback", () => {
    expect(defaultLocale).toBe("ko_KR");
    expect(normalizeLocale("ko_KR")).toBe("ko_KR");
    expect(normalizeLocale("zh_CN")).toBe("zh_CN");
    expect(normalizeLocale("en_US")).toBe("en_US");
    expect(normalizeLocale("es")).toBe("ko_KR");
  });

  it("exposes supported locale options with Korean first", () => {
    expect(localeOptions.map((option) => option.value)).toEqual([
      "ko_KR",
      "en_US",
      "zh_CN"
    ]);
  });

  it("translates known keys across languages", () => {
    expect(translate("ko_KR", "nav.write")).toBe("쓰기");
    expect(translate("zh_CN", "theme.dark")).toBe("纯深色");
    expect(translate("zh_CN", "unknown.key")).toBe("unknown.key");
    expect(translate("ko_KR", "age.adult")).toBe("19세 이상");
    expect(translate("ko_KR", "age.under18")).toBe("19세 미만");
    expect(translate("en_US", "age.adult")).toBe("18+");
    expect(translate("en_US", "age.under18")).toBe("Under 18");
  });

  it("verifies 46Hz branding and clear warm claiming keys across locales without shadowban ambiguity", () => {
    expect(translate("en_US", "home.body")).toContain("46Hz");
    expect(translate("zh_CN", "home.body")).toContain("46Hz");
    expect(translate("ko_KR", "home.body")).toContain("46Hz");

    // Warm, non-shadowban copy
    expect(translate("zh_CN", "reply.alreadyRepliedTitle")).toBe("您已经送出过温暖的回信了");
    expect(translate("ko_KR", "reply.alreadyRepliedTitle")).toBe("이미 따뜻한 답장을 보내셨어요");
    expect(translate("en_US", "reply.alreadyRepliedTitle")).toBe("You have already replied to this letter");

    expect(translate("ko_KR", "reply.reservedByOtherTitle")).toBe("다른 동료가 편지를 읽고 답장을 적고 있어요");
    expect(translate("zh_CN", "reply.reservedByOtherTitle")).toBe("另一位同伴正在用心写信中");
    expect(translate("en_US", "reply.reservedByOtherTitle")).toBe("A peer is currently writing a reply to this letter");
  });
});
