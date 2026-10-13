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

  it("ensures zero untranslated keys across all 3 supported languages", () => {
    const keysToCheck = [
      "write.counter",
      "write.sparks",
      "write.privacyAssurance",
      "write.peacePacing",
      "reply.counter",
      "reply.draftEncouragement",
      "reply.aiHint",
      "reply.coachEditableNote",
      "resonance.expandNote",
      "review.supportNoticeTitle",
      "review.directlyEditable",
      "review.supportConnected",
      "review.moderationNotice",
      "letter.backToInbox",
      "letter.peerReplyTitle",
      "letter.replyFeedbackTitle",
      "settings.profileTitle",
      "settings.subtitle",
      "onboarding.startSession",
      "reply.poolTitle",
      "home.schumannBadge",
      "home.browseLetters",
      "home.pillar1Title",
      "home.pillar1Desc",
      "home.pillar2Title",
      "home.pillar2Desc",
      "home.pillar3Title",
      "home.pillar3Desc",
      "home.stepsSubtitle",
      "home.step1Desc",
      "home.step2Desc",
      "home.step3Desc",
      "home.step4Desc",
      "home.crisisTitle",
      "home.crisisDesc",
      "home.crisisButton",
      "shell.skipToContent",
      "shell.tagline",
      "shell.footerDesc",
      "shell.crisisLink",
      "write.prompt1",
      "write.prompt2",
      "write.prompt3",
      "write.prompt4",
      "reply.writingPaceNote",
      "review.aiDraftNotice",
      "resources.helplineBadge",
      "resources.title",
      "resources.intro",
      "resources.highRiskNotice",
      "resources.website",
      "resources.empty",
      "resonance.capBadge",
      "resonance.frequencySubtitle",
      "resonance.progressAria",
      "resonance.seventhBadge",
      "common.copy",
      "common.copied",
      "common.errorTitle",
      "common.returnHome",
      "admin.navMetrics",
      "admin.navLetters",
      "admin.navReplies",
      "admin.navReports",
      "admin.navUsers",
      "admin.navResources",
      "admin.navCompliance",
      "admin.navLog",
      "admin.adminOnlyBadge",
      "admin.staffAccessTitle",
      "admin.staffAccessSubtitle",
      "admin.passcodeLabel",
      "admin.passcodePlaceholder",
      "admin.enterDashboard",
      "admin.rateLimited",
      "admin.invalidPasscode",
      "admin.dashboardTitle",
      "admin.dashboardSubtitle",
      "admin.roleBadge",
      "admin.logout",
      "letter.delete",
      "letter.deleteConfirmTitle",
      "letter.deleteConfirmDesc",
      "letter.deleteConfirmButton",
      "letter.deleteSuccess",
      "letter.submitSuccess",
      "letter.viewModeAria",
      "letter.viewProcessed",
      "letter.viewRaw",
      "letter.viewComparison",
      "letter.rawDraftBadge",
      "letter.processedBadge",
      "letter.copyRaw",
      "letter.restoreRaw",
      "letter.restoredNotice",
      "review.comparisonTitle",
      "review.tabProcessed",
      "review.tabRaw",
      "review.tabComparison",
      "review.rawNotice",
      "review.comparisonHint",
      "review.editInEditor",
      "write.privacyAssuranceBadge",
      "comment.title",
      "comment.subtitle",
      "comment.badge",
      "comment.add",
      "comment.commentOnSelection",
      "comment.selectedQuote",
      "comment.quotePlaceholder",
      "comment.contentLabel",
      "comment.placeholder",
      "comment.submit",
      "comment.emptyTitle",
      "comment.emptyBody",
      "comment.delete"
    ];

    for (const key of keysToCheck) {
      const ko = translate("ko_KR", key);
      const en = translate("en_US", key);
      const zh = translate("zh_CN", key);

      expect(ko).not.toBe(key);
      expect(en).not.toBe(key);
      expect(zh).not.toBe(key);

      expect(ko.length).toBeGreaterThan(0);
      expect(en.length).toBeGreaterThan(0);
      expect(zh.length).toBeGreaterThan(0);
    }

    // Dynamic interpolation check
    expect(translate("ko_KR", "write.counter", { current: "25", min: "40" })).toBe("25 / 40자 이상");
    expect(translate("en_US", "write.counter", { current: "25", min: "40" })).toBe("25 / min 40 chars");
    expect(translate("zh_CN", "write.counter", { current: "25", min: "40" })).toBe("25 / 最少40字");

    expect(
      translate("ko_KR", "resonance.progressAria", { current: "3", max: "7" })
    ).toBe("총 7개 공명 중 3개의 답장이 도착했습니다.");
    expect(
      translate("en_US", "resonance.progressAria", { current: "3", max: "7" })
    ).toBe("3 of 7 harmonic replies received");
    expect(
      translate("zh_CN", "resonance.progressAria", { current: "3", max: "7" })
    ).toBe("已收到 3 / 7 封共振回信");
  });

  it("reflects empirical Schumann resonance physics in schumannNote across locales", () => {
    expect(translate("ko_KR", "resonance.schumannNote")).toContain("감쇠");
    expect(translate("en_US", "resonance.schumannNote")).toContain("damping");
    expect(translate("zh_CN", "resonance.schumannNote")).toContain("衰减");
  });
});
