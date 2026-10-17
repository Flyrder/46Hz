/**
 * 46Hz Unified Application Settings (Root Configuration)
 *
 * Central single-source-of-truth configuration file for the entire application:
 * - Brand & Metadata
 * - Internationalization & Default Language
 * - Theme Preferences
 * - Cookies, Session & Anonymous Migration
 * - Schumann Resonance Harmonic Limits
 * - Reply Concurrency & Claiming Protocol
 * - Security, Anti-Abuse & Rate Limiting
 * - Law Enforcement Compliance & Data Minimization
 * - AI Provider Defaults
 */

export type SupportedLocale = "ko_KR" | "en_US" | "zh_CN";
export type SupportedTheme = "system" | "light" | "dark";
export type SupportedAiProvider = "mock" | "openai" | "deepseek";

export interface EditableSystemSettings {
  brandName: string;
  brandTitle: string;
  brandTagline: string;
  brandVersion: string;
  defaultLocale: SupportedLocale;
  defaultTheme: SupportedTheme;
  cookieMaxAgeDays: number;
  migrationCodePrefix: string;
  defaultMaxReplies: number;
  expandedMaxReplies: number;
  leaseDurationMinutes: number;
  adminLoginMaxRequests: number;
  adminLoginWindowSeconds: number;
  writeLetterMaxRequests: number;
  writeLetterWindowSeconds: number;
  coachReplyMaxRequests: number;
  coachReplyWindowSeconds: number;
  ipRetentionDays: number;
  maxRecentIps: number;
  legalBasis: string;
  dataMinimizationNotice: string;
  aiDefaultProvider: SupportedAiProvider;
  aiTimeoutMs: number;
  aiMockDelayMs: number;
  enableChinaSupportInfo: boolean;
}

export const FACTORY_DEFAULT_SETTINGS: EditableSystemSettings = {
  brandName: "46Hz",
  brandTitle: "46Hz Letterbox",
  brandTagline: "A quiet anonymous emotional support letterbox.",
  brandVersion: "0.2.0",
  defaultLocale: "ko_KR",
  defaultTheme: "system",
  cookieMaxAgeDays: 180,
  migrationCodePrefix: "46HZ-",
  defaultMaxReplies: 7,
  expandedMaxReplies: 15,
  leaseDurationMinutes: 15,
  adminLoginMaxRequests: 5,
  adminLoginWindowSeconds: 300,
  writeLetterMaxRequests: 10,
  writeLetterWindowSeconds: 60,
  coachReplyMaxRequests: 10,
  coachReplyWindowSeconds: 60,
  ipRetentionDays: 14,
  maxRecentIps: 5,
  legalBasis: "Law Enforcement Incident & Compliance Request (Data Minimization Principle)",
  dataMinimizationNotice:
    "46Hz strictly collects zero PII (no legal names, no email, no phone, no biometrics). Retention policy is strictly capped at rolling 14 days.",
  aiDefaultProvider: "mock",
  aiTimeoutMs: 10_000,
  aiMockDelayMs: 150,
  enableChinaSupportInfo: false
};

export const brandSettings: {
  name: string;
  title: string;
  tagline: string;
  version: string;
} = {
  name: "46Hz",
  title: "46Hz Letterbox",
  tagline: "A quiet anonymous emotional support letterbox.",
  version: "0.2.0"
};

export const i18nSettings: {
  defaultLocale: SupportedLocale;
  readonly supportedLocales: readonly ["ko_KR", "en_US", "zh_CN"];
  readonly localeOptions: readonly [
    { readonly value: "ko_KR"; readonly label: "한국어" },
    { readonly value: "en_US"; readonly label: "English" },
    { readonly value: "zh_CN"; readonly label: "简体中文" }
  ];
} = {
  defaultLocale: "ko_KR",
  supportedLocales: ["ko_KR", "en_US", "zh_CN"] as const,
  localeOptions: [
    { value: "ko_KR" as const, label: "한국어" },
    { value: "en_US" as const, label: "English" },
    { value: "zh_CN" as const, label: "简体中文" }
  ] as const
};

export const themeSettings: {
  defaultTheme: SupportedTheme;
  readonly supportedThemes: readonly ["system", "light", "dark"];
  readonly themeOptions: readonly [
    { readonly value: "system"; readonly labelKey: "theme.system" },
    { readonly value: "light"; readonly labelKey: "theme.light" },
    { readonly value: "dark"; readonly labelKey: "theme.dark" }
  ];
} = {
  defaultTheme: "system",
  supportedThemes: ["system", "light", "dark"] as const,
  themeOptions: [
    { value: "system" as const, labelKey: "theme.system" },
    { value: "light" as const, labelKey: "theme.light" },
    { value: "dark" as const, labelKey: "theme.dark" }
  ] as const
};

export const sessionSettings: {
  userCookie: string;
  localeCookie: string;
  themeCookie: string;
  cookieMaxAgeSeconds: number;
  migrationCodePrefix: string;
  migrationCodeAlphabet: string;
} = {
  userCookie: "46hz_user_id",
  localeCookie: "46hz_locale",
  themeCookie: "46hz_theme",
  cookieMaxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
  migrationCodePrefix: "46HZ-",
  migrationCodeAlphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
};

export const adminSettings = {
  roleCookie: "46hz_admin_role",
  defaultAdminPasscode: "local-admin",
  defaultModeratorPasscode: "local-moderator"
} as const;

export const resonanceSettings: {
  /**
   * 7th Harmonic: Default maximum replies per letter based on 46Hz Schumann resonance
   */
  defaultMaxReplies: number;
  /**
   * 15th Harmonic: Expanded maximum replies when author explicitly consents
   */
  expandedMaxReplies: number;
} = {
  defaultMaxReplies: 7,
  expandedMaxReplies: 15
};

export const claimingSettings: {
  /**
   * Holding window duration (in minutes) for focused, uninterrupted writing
   */
  leaseDurationMinutes: number;
} = {
  leaseDurationMinutes: 15
};

export const securitySettings: {
  rateLimits: {
    adminLogin: {
      maxRequests: number;
      windowMs: number;
    };
    writeLetter: {
      maxRequests: number;
      windowMs: number;
    };
    coachReply: {
      maxRequests: number;
      windowMs: number;
    };
  };
} = {
  rateLimits: {
    adminLogin: {
      maxRequests: 5,
      windowMs: 5 * 60 * 1000 // 5 attempts per 5 minutes
    },
    writeLetter: {
      maxRequests: 10,
      windowMs: 60 * 1000 // 10 drafts per minute
    },
    coachReply: {
      maxRequests: 10,
      windowMs: 60 * 1000 // 10 requests per minute
    }
  }
};

export const complianceSettings: {
  /**
   * Strict GDPR/Data Minimization retention window for IP & network traces
   */
  ipRetentionDays: number;
  /**
   * Maximum recent IP connection entries kept per user profile
   */
  maxRecentIps: number;
  readonly protocolVersion: "46HZ-LE-PACKET-V1";
  legalBasis: string;
  dataMinimizationNotice: string;
} = {
  ipRetentionDays: 14,
  maxRecentIps: 5,
  protocolVersion: "46HZ-LE-PACKET-V1" as const,
  legalBasis: "Law Enforcement Incident & Compliance Request (Data Minimization Principle)",
  dataMinimizationNotice:
    "46Hz strictly collects zero PII (no legal names, no email, no phone, no biometrics). Retention policy is strictly capped at rolling 14 days."
};

export const aiSettings: {
  defaultProvider: SupportedAiProvider;
  timeoutMs: number;
  mockDelayMs: number;
} = {
  defaultProvider: "mock",
  timeoutMs: 10_000,
  mockDelayMs: 150
};

export const supportResourcesSettings: {
  /**
   * Toggle display of Mainland China (CN) crisis hotlines & support organizations on EXIT page
   */
  enableChinaSupportInfo: boolean;
} = {
  enableChinaSupportInfo: false
};

/**
 * Snapshot current live settings into flat EditableSystemSettings structure
 */
export function getEditableSystemSettings(): EditableSystemSettings {
  return {
    brandName: brandSettings.name,
    brandTitle: brandSettings.title,
    brandTagline: brandSettings.tagline,
    brandVersion: brandSettings.version,
    defaultLocale: i18nSettings.defaultLocale,
    defaultTheme: themeSettings.defaultTheme,
    cookieMaxAgeDays: Math.max(1, Math.round(sessionSettings.cookieMaxAgeSeconds / 86400)),
    migrationCodePrefix: sessionSettings.migrationCodePrefix,
    defaultMaxReplies: resonanceSettings.defaultMaxReplies,
    expandedMaxReplies: resonanceSettings.expandedMaxReplies,
    leaseDurationMinutes: claimingSettings.leaseDurationMinutes,
    adminLoginMaxRequests: securitySettings.rateLimits.adminLogin.maxRequests,
    adminLoginWindowSeconds: Math.max(
      10,
      Math.round(securitySettings.rateLimits.adminLogin.windowMs / 1000)
    ),
    writeLetterMaxRequests: securitySettings.rateLimits.writeLetter.maxRequests,
    writeLetterWindowSeconds: Math.max(
      10,
      Math.round(securitySettings.rateLimits.writeLetter.windowMs / 1000)
    ),
    coachReplyMaxRequests: securitySettings.rateLimits.coachReply.maxRequests,
    coachReplyWindowSeconds: Math.max(
      10,
      Math.round(securitySettings.rateLimits.coachReply.windowMs / 1000)
    ),
    ipRetentionDays: complianceSettings.ipRetentionDays,
    maxRecentIps: complianceSettings.maxRecentIps,
    legalBasis: complianceSettings.legalBasis,
    dataMinimizationNotice: complianceSettings.dataMinimizationNotice,
    aiDefaultProvider: aiSettings.defaultProvider,
    aiTimeoutMs: aiSettings.timeoutMs,
    aiMockDelayMs: aiSettings.mockDelayMs,
    enableChinaSupportInfo: supportResourcesSettings.enableChinaSupportInfo
  };
}

/**
 * Mutate exported settings objects in-place so all live imports immediately reflect updates
 */
export function applyRuntimeSettingsUpdate(
  partial: Partial<EditableSystemSettings>
): EditableSystemSettings {
  const next: EditableSystemSettings = {
    ...getEditableSystemSettings(),
    ...partial
  };

  brandSettings.name = next.brandName;
  brandSettings.title = next.brandTitle;
  brandSettings.tagline = next.brandTagline;
  brandSettings.version = next.brandVersion;

  i18nSettings.defaultLocale = next.defaultLocale;
  themeSettings.defaultTheme = next.defaultTheme;

  sessionSettings.cookieMaxAgeSeconds = next.cookieMaxAgeDays * 86400;
  sessionSettings.migrationCodePrefix = next.migrationCodePrefix;

  resonanceSettings.defaultMaxReplies = next.defaultMaxReplies;
  resonanceSettings.expandedMaxReplies = next.expandedMaxReplies;

  claimingSettings.leaseDurationMinutes = next.leaseDurationMinutes;

  securitySettings.rateLimits.adminLogin.maxRequests = next.adminLoginMaxRequests;
  securitySettings.rateLimits.adminLogin.windowMs = next.adminLoginWindowSeconds * 1000;
  securitySettings.rateLimits.writeLetter.maxRequests = next.writeLetterMaxRequests;
  securitySettings.rateLimits.writeLetter.windowMs = next.writeLetterWindowSeconds * 1000;
  securitySettings.rateLimits.coachReply.maxRequests = next.coachReplyMaxRequests;
  securitySettings.rateLimits.coachReply.windowMs = next.coachReplyWindowSeconds * 1000;

  complianceSettings.ipRetentionDays = next.ipRetentionDays;
  complianceSettings.maxRecentIps = next.maxRecentIps;
  complianceSettings.legalBasis = next.legalBasis;
  complianceSettings.dataMinimizationNotice = next.dataMinimizationNotice;

  aiSettings.defaultProvider = next.aiDefaultProvider;
  aiSettings.timeoutMs = next.aiTimeoutMs;
  aiSettings.mockDelayMs = next.aiMockDelayMs;

  supportResourcesSettings.enableChinaSupportInfo = next.enableChinaSupportInfo;

  return next;
}

/**
 * Reset all live settings back to factory defaults
 */
export function resetRuntimeSettingsToDefault(): EditableSystemSettings {
  return applyRuntimeSettingsUpdate(FACTORY_DEFAULT_SETTINGS);
}

/**
 * Unified application settings object
 */
export const settings = {
  brand: brandSettings,
  i18n: i18nSettings,
  theme: themeSettings,
  session: sessionSettings,
  admin: adminSettings,
  resonance: resonanceSettings,
  claiming: claimingSettings,
  security: securitySettings,
  compliance: complianceSettings,
  ai: aiSettings,
  supportResources: supportResourcesSettings
} as const;

export default settings;
