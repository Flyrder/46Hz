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

export const brandSettings = {
  name: "46Hz",
  title: "46Hz Letterbox",
  tagline: "A quiet anonymous emotional support letterbox.",
  version: "0.1.0"
} as const;

export const i18nSettings = {
  defaultLocale: "ko_KR" as const,
  supportedLocales: ["ko_KR", "en_US", "zh_CN"] as const,
  localeOptions: [
    { value: "ko_KR" as const, label: "한국어" },
    { value: "en_US" as const, label: "English" },
    { value: "zh_CN" as const, label: "简体中文" }
  ]
} as const;

export const themeSettings = {
  defaultTheme: "system" as const,
  supportedThemes: ["system", "light", "dark"] as const,
  themeOptions: [
    { value: "system" as const, labelKey: "theme.system" },
    { value: "light" as const, labelKey: "theme.light" },
    { value: "dark" as const, labelKey: "theme.dark" }
  ]
} as const;

export const sessionSettings = {
  userCookie: "46hz_user_id",
  legacyUserCookie: "eko_user_id",
  localeCookie: "46hz_locale",
  legacyLocaleCookie: "eko_locale",
  themeCookie: "46hz_theme",
  legacyThemeCookie: "eko_theme",
  cookieMaxAgeSeconds: 60 * 60 * 24 * 180, // 180 days
  migrationCodePrefix: "46HZ-",
  migrationCodeAlphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
} as const;

export const adminSettings = {
  roleCookie: "46hz_admin_role",
  legacyRoleCookie: "eko_admin",
  defaultAdminPasscode: "local-admin",
  defaultModeratorPasscode: "local-moderator"
} as const;

export const resonanceSettings = {
  /**
   * 7th Harmonic: Default maximum replies per letter based on 46Hz Schumann resonance
   */
  defaultMaxReplies: 7,
  /**
   * 15th Harmonic: Expanded maximum replies when author explicitly consents
   */
  expandedMaxReplies: 15
} as const;

export const claimingSettings = {
  /**
   * Holding window duration (in minutes) for focused, uninterrupted writing
   */
  leaseDurationMinutes: 15
} as const;

export const securitySettings = {
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
} as const;

export const complianceSettings = {
  /**
   * Strict GDPR/Data Minimization retention window for IP & network traces
   */
  ipRetentionDays: 14,
  /**
   * Maximum recent IP connection entries kept per user profile
   */
  maxRecentIps: 5,
  protocolVersion: "46HZ-LE-PACKET-V1" as const,
  legalBasis: "Law Enforcement Incident & Compliance Request (Data Minimization Principle)",
  dataMinimizationNotice:
    "46Hz strictly collects zero PII (no legal names, no email, no phone, no biometrics). Retention policy is strictly capped at rolling 14 days."
} as const;

export const aiSettings = {
  defaultProvider: "mock" as const,
  timeoutMs: 10_000,
  mockDelayMs: 150
} as const;

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
  ai: aiSettings
} as const;

export default settings;
