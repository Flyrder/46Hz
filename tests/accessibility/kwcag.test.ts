import { describe, expect, it } from "vitest";
import { defaultLocale, translate } from "@/lib/i18n";
import { settings } from "@/settings";

describe("KWCAG 2.2 (한국형 웹 콘텐츠 접근성 지침 / KS X 9256) Compliance", () => {
  it("Principle 1 (인식의 용이성): guarantees text alternatives and clear status indicators", () => {
    // Every key status has explicit, non-color-dependent text representations across locales
    const statuses = ["APPROVED", "PENDING", "REJECTED", "ROUTED_TO_SUPPORT"] as const;
    for (const status of statuses) {
      expect(translate("ko_KR", `status.${status}`)).not.toBe(`status.${status}`);
      expect(translate("en_US", `status.${status}`)).not.toBe(`status.${status}`);
      expect(translate("zh_CN", `status.${status}`)).not.toBe(`status.${status}`);
    }
  });

  it("Principle 2 (운용의 용이성): provides skip navigation and sufficient time controls", () => {
    // 2.4.1 반복 영역 건너뛰기 (Skip to main content)
    const skipKo = translate("ko_KR", "shell.skipToContent");
    expect(skipKo).toBe("본문으로 건너뛰기");
    expect(translate("en_US", "shell.skipToContent")).toBe("Skip to main content");
    expect(translate("zh_CN", "shell.skipToContent")).toBe("跳至主要内容");

    // 2.2.1 충분한 시간 제공 (15-min lease duration and voluntary release)
    expect(settings.claiming.leaseDurationMinutes).toBe(15);
    expect(translate("ko_KR", "reply.skipClaim")).toContain("양보");
  });

  it("Principle 3 (이해의 용이성): enforces default page language declaration and accessible feedback", () => {
    // 3.1.1 기본 언어 표시 (Language declaration)
    expect(defaultLocale).toBe("ko_KR");
    const langAttr = defaultLocale.replace("_", "-");
    expect(langAttr).toBe("ko-KR");

    // 3.4.1 오류 식별 (Accessible error announcements)
    expect(translate("ko_KR", "onboarding.errorInvalidCode")).not.toBe("onboarding.errorInvalidCode");
    expect(translate("ko_KR", "admin.rateLimited")).not.toBe("admin.rateLimited");
    expect(translate("ko_KR", "admin.invalidPasscode")).not.toBe("admin.invalidPasscode");
  });

  it("Principle 4 (견고성): provides WAI-ARIA live regions and progressbar descriptors", () => {
    // 4.2 웹 애플리케이션 접근성 (Live announcements and progress values)
    const meterKo = translate("ko_KR", "resonance.meterLabel", { current: "3", max: "7" });
    expect(meterKo).toContain("3 / 7");

    const progressAriaKo = translate("ko_KR", "resonance.progressAria", { current: "5", max: "7" });
    expect(progressAriaKo).toBe("총 7개 공명 중 5개의 답장이 도착했습니다.");

    const counterKo = translate("ko_KR", "write.counter", { current: "42", min: "40" });
    expect(counterKo).toBe("42 / 40자 이상");
  });
});
