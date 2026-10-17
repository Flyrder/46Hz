import fs from "node:fs";
import path from "node:path";
import {
  applyRuntimeSettingsUpdate,
  FACTORY_DEFAULT_SETTINGS,
  getEditableSystemSettings,
  resetRuntimeSettingsToDefault,
  type EditableSystemSettings
} from "@/settings";

const OVERRIDE_FILE_NAME = ".settings.override.json";

function getOverrideFilePath(): string {
  return path.join(process.cwd(), OVERRIDE_FILE_NAME);
}

function getSettingsTsFilePath(): string {
  return path.join(process.cwd(), "settings.ts");
}

let initializedFromDisk = false;

/**
 * Ensures any persisted override in .settings.override.json is loaded into memory
 * in non-test environments.
 */
export function ensureSettingsLoadedFromDisk(): EditableSystemSettings {
  if (!initializedFromDisk && process.env.NODE_ENV !== "test") {
    initializedFromDisk = true;
    const overridePath = getOverrideFilePath();
    if (fs.existsSync(overridePath)) {
      try {
        const raw = fs.readFileSync(overridePath, "utf-8");
        const parsed = JSON.parse(raw) as Partial<EditableSystemSettings>;
        return applyRuntimeSettingsUpdate(parsed);
      } catch {
        // Ignore malformed override file
      }
    }
  }
  return getEditableSystemSettings();
}

/**
 * Generates a formatted TypeScript representation of settings.ts reflecting the given configuration.
 */
export function formatSettingsTsPreview(cfg: EditableSystemSettings): string {
  return `// Auto-synchronized by 46Hz Admin System Settings Studio
export const brandSettings = {
  name: ${JSON.stringify(cfg.brandName)},
  title: ${JSON.stringify(cfg.brandTitle)},
  tagline: ${JSON.stringify(cfg.brandTagline)},
  version: ${JSON.stringify(cfg.brandVersion)}
} as const;

export const i18nSettings = {
  defaultLocale: ${JSON.stringify(cfg.defaultLocale)} as const,
  supportedLocales: ["ko_KR", "en_US", "zh_CN"] as const
} as const;

export const themeSettings = {
  defaultTheme: ${JSON.stringify(cfg.defaultTheme)} as const,
  supportedThemes: ["system", "light", "dark"] as const
} as const;

export const sessionSettings = {
  userCookie: "46hz_user_id",
  cookieMaxAgeSeconds: 60 * 60 * 24 * ${cfg.cookieMaxAgeDays}, // ${cfg.cookieMaxAgeDays} days
  migrationCodePrefix: ${JSON.stringify(cfg.migrationCodePrefix)}
} as const;

export const resonanceSettings = {
  defaultMaxReplies: ${cfg.defaultMaxReplies},
  expandedMaxReplies: ${cfg.expandedMaxReplies}
} as const;

export const claimingSettings = {
  leaseDurationMinutes: ${cfg.leaseDurationMinutes}
} as const;

export const securitySettings = {
  rateLimits: {
    adminLogin: { maxRequests: ${cfg.adminLoginMaxRequests}, windowMs: ${cfg.adminLoginWindowSeconds * 1000} },
    writeLetter: { maxRequests: ${cfg.writeLetterMaxRequests}, windowMs: ${cfg.writeLetterWindowSeconds * 1000} },
    coachReply: { maxRequests: ${cfg.coachReplyMaxRequests}, windowMs: ${cfg.coachReplyWindowSeconds * 1000} }
  }
} as const;

export const complianceSettings = {
  ipRetentionDays: ${cfg.ipRetentionDays},
  maxRecentIps: ${cfg.maxRecentIps},
  protocolVersion: "46HZ-LE-PACKET-V1" as const,
  legalBasis: ${JSON.stringify(cfg.legalBasis)},
  dataMinimizationNotice: ${JSON.stringify(cfg.dataMinimizationNotice)}
} as const;

export const aiSettings = {
  enabled: ${cfg.enableAi},
  enableRiskSafety: ${cfg.enableAiRiskSafety},
  enableAnonymization: ${cfg.enableAiAnonymization},
  enableReplyCoach: ${cfg.enableAiReplyCoach},
  enableWritingSparks: ${cfg.enableAiWritingSparks},
  enableResonanceMatch: ${cfg.enableAiResonanceMatch},
  defaultProvider: ${JSON.stringify(cfg.aiDefaultProvider)} as const,
  timeoutMs: ${cfg.aiTimeoutMs},
  mockDelayMs: ${cfg.aiMockDelayMs},
  temperature: ${cfg.aiTemperature},
  maxTokens: ${cfg.aiMaxTokens},
  model: ${JSON.stringify(cfg.aiModel)},
  apiKey: ${JSON.stringify(cfg.aiApiKey)},
  baseUrl: ${JSON.stringify(cfg.aiBaseUrl)},
  systemPrompt: ${JSON.stringify(cfg.aiSystemPrompt)}
} as const;

export const supportResourcesSettings = {
  enableChinaSupportInfo: ${cfg.enableChinaSupportInfo}
} as const;`;
}

/**
 * Synchronizes the literal values inside root settings.ts on disk when writable.
 */
function syncRootSettingsTsLiterals(cfg: EditableSystemSettings): boolean {
  const filePath = getSettingsTsFilePath();
  if (!fs.existsSync(filePath)) return false;

  try {
    let source = fs.readFileSync(filePath, "utf-8");

    // Synchronize the live initial object literals in settings.ts
    source = source.replace(
      /(export const brandSettings[\s\S]*?=\s*\{)([\s\S]*?)(\n\};)/,
      `$1\n  name: ${JSON.stringify(cfg.brandName)},\n  title: ${JSON.stringify(cfg.brandTitle)},\n  tagline: ${JSON.stringify(cfg.brandTagline)},\n  version: ${JSON.stringify(cfg.brandVersion)}$3`
    );

    source = source.replace(
      /(export const i18nSettings[\s\S]*?=\s*\{\s*defaultLocale:\s*)"[^"]+"/,
      `$1${JSON.stringify(cfg.defaultLocale)}`
    );

    source = source.replace(
      /(export const themeSettings[\s\S]*?=\s*\{\s*defaultTheme:\s*)"[^"]+"/,
      `$1${JSON.stringify(cfg.defaultTheme)}`
    );

    source = source.replace(
      /(cookieMaxAgeSeconds:\s*)60 \* 60 \* 24 \* \d+([^\n]*)/,
      `$160 * 60 * 24 * ${cfg.cookieMaxAgeDays}, // ${cfg.cookieMaxAgeDays} days`
    );

    source = source.replace(
      /(export const sessionSettings[\s\S]*?migrationCodePrefix:\s*)"[^"]+"/,
      `$1${JSON.stringify(cfg.migrationCodePrefix)}`
    );

    source = source.replace(
      /(export const resonanceSettings[\s\S]*?=\s*\{)([\s\S]*?)(\n\};)/,
      `$1\n  defaultMaxReplies: ${cfg.defaultMaxReplies},\n  expandedMaxReplies: ${cfg.expandedMaxReplies}$3`
    );

    source = source.replace(
      /(export const claimingSettings[\s\S]*?=\s*\{)([\s\S]*?)(\n\};)/,
      `$1\n  leaseDurationMinutes: ${cfg.leaseDurationMinutes}$3`
    );

    source = source.replace(
      /(export const securitySettings[\s\S]*?=\s*\{)([\s\S]*?)(\n\};)/,
      `$1\n  rateLimits: {\n    adminLogin: {\n      maxRequests: ${cfg.adminLoginMaxRequests},\n      windowMs: ${cfg.adminLoginWindowSeconds * 1000}\n    },\n    writeLetter: {\n      maxRequests: ${cfg.writeLetterMaxRequests},\n      windowMs: ${cfg.writeLetterWindowSeconds * 1000}\n    },\n    coachReply: {\n      maxRequests: ${cfg.coachReplyMaxRequests},\n      windowMs: ${cfg.coachReplyWindowSeconds * 1000}\n    }\n  }$3`
    );

    source = source.replace(
      /(export const complianceSettings[\s\S]*?=\s*\{)([\s\S]*?)(\n\};)/,
      `$1\n  ipRetentionDays: ${cfg.ipRetentionDays},\n  maxRecentIps: ${cfg.maxRecentIps},\n  protocolVersion: "46HZ-LE-PACKET-V1" as const,\n  legalBasis: ${JSON.stringify(cfg.legalBasis)},\n  dataMinimizationNotice:\n    ${JSON.stringify(cfg.dataMinimizationNotice)}$3`
    );

    source = source.replace(
      /(export const aiSettings[\s\S]*?=\s*\{)([\s\S]*?)(\n\};)/,
      `$1\n  enabled: ${cfg.enableAi},\n  enableRiskSafety: ${cfg.enableAiRiskSafety},\n  enableAnonymization: ${cfg.enableAiAnonymization},\n  enableReplyCoach: ${cfg.enableAiReplyCoach},\n  enableWritingSparks: ${cfg.enableAiWritingSparks},\n  enableResonanceMatch: ${cfg.enableAiResonanceMatch},\n  defaultProvider: ${JSON.stringify(cfg.aiDefaultProvider)},\n  timeoutMs: ${cfg.aiTimeoutMs},\n  mockDelayMs: ${cfg.aiMockDelayMs},\n  temperature: ${cfg.aiTemperature},\n  maxTokens: ${cfg.aiMaxTokens},\n  model: ${JSON.stringify(cfg.aiModel)},\n  apiKey: ${JSON.stringify(cfg.aiApiKey)},\n  baseUrl: ${JSON.stringify(cfg.aiBaseUrl)},\n  systemPrompt: ${JSON.stringify(cfg.aiSystemPrompt)}$3`
    );

    source = source.replace(
      /(export const supportResourcesSettings[\s\S]*?=\s*\{)([\s\S]*?)(\n\};)/,
      `$1\n  enableChinaSupportInfo: ${cfg.enableChinaSupportInfo}$3`
    );

    fs.writeFileSync(filePath, source, "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Updates live runtime settings, writes .settings.override.json, and synchronizes settings.ts on disk.
 */
export function saveSystemSettings(
  partial: Partial<EditableSystemSettings>,
  options: { syncSourceFile?: boolean } = { syncSourceFile: true }
): {
  settings: EditableSystemSettings;
  persistedOverride: boolean;
  syncedSettingsTs: boolean;
} {
  const updated = applyRuntimeSettingsUpdate(partial);
  let persistedOverride = false;
  let syncedSettingsTs = false;

  if (process.env.NODE_ENV !== "test") {
    try {
      fs.writeFileSync(getOverrideFilePath(), JSON.stringify(updated, null, 2), "utf-8");
      persistedOverride = true;
    } catch {
      persistedOverride = false;
    }

    if (options.syncSourceFile) {
      syncedSettingsTs = syncRootSettingsTsLiterals(updated);
    }
  }

  return {
    settings: updated,
    persistedOverride,
    syncedSettingsTs
  };
}

/**
 * Resets runtime settings and disk files back to FACTORY_DEFAULT_SETTINGS.
 */
export function resetSystemSettings(
  options: { syncSourceFile?: boolean } = { syncSourceFile: true }
): EditableSystemSettings {
  const restored = resetRuntimeSettingsToDefault();

  if (process.env.NODE_ENV !== "test") {
    const overridePath = getOverrideFilePath();
    if (fs.existsSync(overridePath)) {
      try {
        fs.rmSync(overridePath, { force: true });
      } catch {
        // Ignore
      }
    }
    if (options.syncSourceFile) {
      syncRootSettingsTsLiterals(FACTORY_DEFAULT_SETTINGS);
    }
  }

  return restored;
}
