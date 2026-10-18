import { describe, it, expect, beforeEach, afterEach } from "vitest";
import settings, {
  brandSettings,
  i18nSettings,
  themeSettings,
  sessionSettings,
  resonanceSettings,
  claimingSettings,
  securitySettings,
  complianceSettings,
  supportResourcesSettings,
  FACTORY_DEFAULT_SETTINGS,
  getEditableSystemSettings,
  applyRuntimeSettingsUpdate,
  resetRuntimeSettingsToDefault
} from "@/settings";
import { formatSettingsTsPreview } from "@/lib/settings-store";
import { systemSettingsSchema } from "@/lib/validators";

describe("Unified Settings (settings.ts)", () => {
  beforeEach(() => {
    resetRuntimeSettingsToDefault();
  });

  afterEach(() => {
    resetRuntimeSettingsToDefault();
  });

  it("provides brand metadata", () => {
    expect(brandSettings.name).toBe("46Hz");
    expect(brandSettings.title).toContain("46Hz");
    expect(brandSettings.version).toBe("0.2.2");
    expect(FACTORY_DEFAULT_SETTINGS.brandVersion).toBe("0.2.2");
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
    editable.enableChinaSupportInfo = true;

    applyRuntimeSettingsUpdate(editable);

    expect(brandSettings.name).toBe("46Hz Studio");
    expect(resonanceSettings.defaultMaxReplies).toBe(9);
    expect(resonanceSettings.expandedMaxReplies).toBe(18);
    expect(claimingSettings.leaseDurationMinutes).toBe(20);
    expect(supportResourcesSettings.enableChinaSupportInfo).toBe(true);

    const preview = formatSettingsTsPreview(getEditableSystemSettings());
    expect(preview).toContain('"46Hz Studio"');
    expect(preview).toContain("defaultMaxReplies: 9");
    expect(preview).toContain("enableChinaSupportInfo: true");

    resetRuntimeSettingsToDefault();
    expect(brandSettings.name).toBe("46Hz");
    expect(resonanceSettings.defaultMaxReplies).toBe(7);
    expect(supportResourcesSettings.enableChinaSupportInfo).toBe(false);
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

  it("synchronizes v0.2.2 release version across package.json, settings, and docker-compose", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
    const pkgLock = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package-lock.json"), "utf8"));
    const composeContent = fs.readFileSync(path.join(process.cwd(), "docker-compose.yml"), "utf8");

    expect(brandSettings.version).toBe("0.2.2");
    expect(pkg.version).toBe("0.2.2");
    expect(pkgLock.version).toBe("0.2.2");
    expect(composeContent).toContain("ghcr.io/flyrder/46hz:v0.2.2");
  });
});
