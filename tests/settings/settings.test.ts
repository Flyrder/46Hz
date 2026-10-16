import { describe, it, expect, afterEach } from "vitest";
import settings, {
  brandSettings,
  i18nSettings,
  themeSettings,
  sessionSettings,
  resonanceSettings,
  claimingSettings,
  securitySettings,
  complianceSettings,
  getEditableSystemSettings,
  applyRuntimeSettingsUpdate,
  resetRuntimeSettingsToDefault
} from "@/settings";
import { formatSettingsTsPreview } from "@/lib/settings-store";
import { systemSettingsSchema } from "@/lib/validators";

describe("Unified Settings (settings.ts)", () => {
  afterEach(() => {
    resetRuntimeSettingsToDefault();
  });

  it("provides brand metadata", () => {
    expect(brandSettings.name).toBe("46Hz");
    expect(brandSettings.title).toContain("46Hz");
    expect(settings.brand).toEqual(brandSettings);
  });

  it("configures i18n with Korean as default", () => {
    expect(i18nSettings.defaultLocale).toBe("ko_KR");
    expect(i18nSettings.supportedLocales).toContain("ko_KR");
    expect(i18nSettings.supportedLocales).toContain("en_US");
    expect(i18nSettings.supportedLocales).toContain("zh_CN");
  });

  it("configures theme options with system as default", () => {
    expect(themeSettings.defaultTheme).toBe("system");
    expect(themeSettings.supportedThemes).toEqual(["system", "light", "dark"]);
  });

  it("specifies session and migration settings", () => {
    expect(sessionSettings.userCookie).toBe("46hz_user_id");
    expect(sessionSettings.migrationCodePrefix).toBe("46HZ-");
    expect(sessionSettings.cookieMaxAgeSeconds).toBeGreaterThan(0);
  });

  it("defines 46Hz Schumann resonance harmonic limits (7 -> 15)", () => {
    expect(resonanceSettings.defaultMaxReplies).toBe(7);
    expect(resonanceSettings.expandedMaxReplies).toBe(15);
  });

  it("defines claiming lease window as 15 minutes", () => {
    expect(claimingSettings.leaseDurationMinutes).toBe(15);
  });

  it("defines data minimization compliance retention limits", () => {
    expect(complianceSettings.ipRetentionDays).toBe(14);
    expect(complianceSettings.maxRecentIps).toBe(5);
    expect(complianceSettings.protocolVersion).toBe("46HZ-LE-PACKET-V1");
  });

  it("defines security rate limiting rules", () => {
    expect(securitySettings.rateLimits.adminLogin.maxRequests).toBe(5);
    expect(securitySettings.rateLimits.adminLogin.windowMs).toBe(300_000);
  });

  it("supports dynamic runtime updates and resets via applyRuntimeSettingsUpdate", () => {
    const editable = getEditableSystemSettings();
    editable.brandName = "46Hz Studio";
    editable.defaultMaxReplies = 9;
    editable.expandedMaxReplies = 18;
    editable.leaseDurationMinutes = 20;

    applyRuntimeSettingsUpdate(editable);

    expect(brandSettings.name).toBe("46Hz Studio");
    expect(resonanceSettings.defaultMaxReplies).toBe(9);
    expect(resonanceSettings.expandedMaxReplies).toBe(18);
    expect(claimingSettings.leaseDurationMinutes).toBe(20);

    const preview = formatSettingsTsPreview(getEditableSystemSettings());
    expect(preview).toContain('"46Hz Studio"');
    expect(preview).toContain("defaultMaxReplies: 9");

    resetRuntimeSettingsToDefault();
    expect(brandSettings.name).toBe("46Hz");
    expect(resonanceSettings.defaultMaxReplies).toBe(7);
  });

  it("validates systemSettingsSchema and rejects expandedMaxReplies < defaultMaxReplies", () => {
    const valid = systemSettingsSchema.safeParse({
      ...getEditableSystemSettings(),
      defaultMaxReplies: 7,
      expandedMaxReplies: 15
    });
    expect(valid.success).toBe(true);

    const invalid = systemSettingsSchema.safeParse({
      ...getEditableSystemSettings(),
      defaultMaxReplies: 15,
      expandedMaxReplies: 7
    });
    expect(invalid.success).toBe(false);
  });
});
