import { describe, expect, it } from "vitest";
import {
  createTranslator,
  defaultLocale,
  formatTag,
  formatToneFlag,
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

  it("localizes emotion tags, situation tags, and AI tone flags across ko_KR, en_US, and zh_CN", () => {
    const tKo = createTranslator("ko_KR");
    const tEn = createTranslator("en_US");
    const tZh = createTranslator("zh_CN");

    expect(formatTag("lonely", tKo)).toBe("외로움");
    expect(formatTag("overwhelmed", tKo)).toBe("버거움·번아웃");
    expect(formatTag("work", tKo)).toBe("직장·일");
    expect(formatTag("seeking-comfort", tKo)).toBe("위로가필요한");

    expect(formatTag("lonely", tEn)).toBe("lonely");
    expect(formatTag("life", tEn)).toBe("daily life");
    expect(formatTag("lonely", tZh)).toBe("孤独");
    expect(formatTag("work", tZh)).toBe("工作");

    expect(formatToneFlag("judgmental", tKo)).toBe("단정적·지시적 표현");
    expect(formatToneFlag("too_advice_heavy", tKo)).toBe("과도한 조언 위주");
    expect(formatToneFlag("judgmental", tEn)).toBe("judgmental tone");
    expect(formatToneFlag("judgmental", tZh)).toBe("评判性表达");
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
      "comment.delete",
      "resources.exitSlogan",
      "resources.exitSosSignal",
      "resources.exitStep1Title",
      "resources.exitStep1Desc",
      "resources.exitStep2Title",
      "resources.exitStep2Desc",
      "resources.exitStep3Title",
      "resources.exitStep3Desc",
      "resources.exitBreathStart",
      "resources.exitBreathStop",
      "resources.exitBreathPrompt",
      "resources.directoryTitle",
      "nav.home",
      "nav.mainAriaLabel",
      "nav.mobileAriaLabel",
      "nav.actionsAriaLabel",
      "shell.footerComplianceBadge",
      "home.resonanceCapSuffix",
      "home.philosophyAriaLabel",
      "home.slowLoopBadge",
      "home.stepBadge",
      "common.errorFallback",
      "common.globalErrorTitle",
      "common.globalErrorDesc",
      "common.loadingAria",
      "common.loadingLettersSrOnly",
      "common.processingSrOnly",
      "notfound.badge",
      "resonance.harmonicNodeTitle",
      "reply.errorTooShort",
      "reply.errorNotAvailable",
      "reply.errorAlreadyReplied",
      "reply.errorResonanceFull",
      "reply.errorLockedByOther",
      "resources.exitBreathPattern",
      "resources.exitGuideAria",
      "resources.exitPrimaryBadge",
      "resources.quickCallCN",
      "resources.quickCall1393",
      "resources.regionKR",
      "resources.regionCN",
      "resources.hotlineTitle109",
      "resources.hotlineTitle1393",
      "resources.hotlineTitle1577",
      "resources.hotlineTitle1388",
      "resources.hotlineTitleCN400",
      "resources.hotlineTitleCN12355",
      "resources.hotlineTitleCN800",
      "admin.settingsValidationError",
      "admin.settingsSecBrandTitle",
      "admin.settingsSecResonanceTitle",
      "admin.settingsSecI18nTitle",
      "admin.settingsChinaSupportTitle",
      "admin.settingsSecSecurityTitle",
      "admin.settingsSecAiTitle",
      "admin.settingsSyncNote"
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

    expect(translate("ko_KR", "resources.title")).toBe("EXIT: 지원 정보");
    expect(translate("en_US", "resources.title")).toBe("EXIT: Support Resources");
    expect(translate("zh_CN", "resources.title")).toBe("EXIT：援助信息");

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

  it("localizes license info link, NAVER font copyright notices, AGPLv3 summary, and open-source library descriptions across all locales", () => {
    expect(translate("ko_KR", "shell.licenseLink")).toBe("라이선스 정보");
    expect(translate("en_US", "shell.licenseLink")).toBe("License Info");
    expect(translate("zh_CN", "shell.licenseLink")).toBe("许可证信息");

    expect(translate("ko_KR", "license.fontSectionTitle")).toBe("네이버 글꼴 저작권 안내");
    expect(translate("ko_KR", "license.fontNoticeP1")).toContain("네이버와 네이버 문화재단");
    expect(translate("en_US", "license.fontNoticeP1")).toContain("NAVER Cultural Foundation");
    expect(translate("zh_CN", "license.fontNoticeP1")).toContain("NAVER 文化财团");

    expect(translate("ko_KR", "license.agplSectionTitle")).toContain("GNU AGPLv3");
    expect(translate("en_US", "license.agplSectionTitle")).toContain("GNU AGPLv3");
    expect(translate("zh_CN", "license.agplSectionTitle")).toContain("GNU AGPLv3");
  });
});
