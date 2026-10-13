"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useTransition } from "react";
import { updatePreferencesAction } from "@/app/actions/preferences";
import type { Locale } from "@/lib/i18n";
import { themePreferences, type ThemePreference } from "@/lib/theme";
import { Sun, Moon, Monitor, Languages, Check, Loader2 } from "lucide-react";

type Option<T extends string> = {
  value: T;
  label: string;
};

export function PreferenceForm({
  locale,
  theme,
  localeLabel,
  themeLabel,
  localeOptions,
  themeOptions,
  title,
  variant = "compact"
}: {
  locale: Locale;
  theme: ThemePreference;
  localeLabel: string;
  themeLabel: string;
  localeOptions: Array<Option<Locale>>;
  themeOptions: Array<Option<ThemePreference>>;
  title?: string;
  variant?: "compact" | "full";
}) {
  const router = useRouter();
  const [localeValue, setLocaleValue] = useState<Locale>(locale);
  const [themeValue, setThemeValue] = useState<ThemePreference>(theme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCompact = variant === "compact";

  useEffect(() => {
    setLocaleValue(locale);
  }, [locale]);

  useEffect(() => {
    setThemeValue(theme);
  }, [theme]);

  // Handle click outside to close the dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handlePreferenceChange(nextLocale: Locale, nextTheme: ThemePreference) {
    // Optimistic UI updates
    setLocaleValue(nextLocale);
    setThemeValue(nextTheme);
    applyTheme(nextTheme);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("locale", nextLocale);
      formData.set("theme", nextTheme);
      await updatePreferencesAction(formData);
      router.refresh();
    });
  }

  const getThemeIcon = (val: ThemePreference, className = "h-4 w-4") => {
    switch (val) {
      case "light":
        return <Sun className={className} />;
      case "dark":
        return <Moon className={className} />;
      case "system":
      default:
        return <Monitor className={className} />;
    }
  };

  const getLangCode = (val: Locale) => {
    switch (val) {
      case "ko_KR":
        return "KO";
      case "zh_CN":
        return "ZH";
      case "en_US":
      default:
        return "EN";
    }
  };

  if (isCompact) {
    const rawThemeIndex = themePreferences.indexOf(themeValue);
    const themeIndex = rawThemeIndex >= 0 ? rawThemeIndex : 0;

    return (
      <div className="flex items-center gap-2 relative">
        {/* Language Picker Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={localeLabel}
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-full border border-border/80 bg-surface/90 text-xs font-medium hover:bg-muted/60 active:scale-95 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 shadow-2xs"
          >
            <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-semibold">{getLangCode(localeValue)}</span>
          </button>

          {menuOpen && (
            <div
              role="listbox"
              aria-label={localeLabel}
              className="absolute right-0 mt-1.5 w-36 rounded-2xl border border-border/80 bg-surface p-1.5 shadow-tactile z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {localeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={localeValue === option.value}
                  onClick={() => {
                    handlePreferenceChange(option.value, themeValue);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between min-h-[44px] px-3 py-2 rounded-xl text-left text-xs font-medium hover:bg-muted/60 transition-colors text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span>{option.label}</span>
                  {localeValue === option.value && (
                    <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Segmented Toggle */}
        <div
          role="radiogroup"
          aria-label={themeLabel}
          className="relative flex items-center bg-muted/50 border border-border/70 p-0.5 rounded-full h-11 min-w-[124px] overflow-hidden select-none"
        >
          {/* Sliding Pill Background Highlight */}
          <div
            className="absolute top-0.5 bottom-0.5 rounded-full bg-surface shadow-xs transition-all duration-200 ease-out"
            style={{
              left: `calc(${themeIndex} * 33.333% + 2px)`,
              width: `calc(33.333% - 4px)`
            }}
          />

          {themePreferences.map((pref) => {
            const isActive = themeValue === pref;
            return (
              <button
                key={pref}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => handlePreferenceChange(localeValue, pref)}
                aria-label={`${pref} theme`}
                className={`relative flex-1 grid place-items-center h-full min-h-[40px] rounded-full transition-colors z-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {getThemeIcon(pref, "h-4 w-4")}
              </button>
            );
          })}
        </div>

        {/* Loader Status Overlay */}
        {isPending && (
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
          </div>
        )}
      </div>
    );
  }

  // Full representation in settings page
  return (
    <div className="mt-6 rounded-2xl border border-border/85 bg-surface p-6 shadow-soft">
      {title && (
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
        </div>
      )}

      {/* Language Section */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
          {localeLabel}
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {localeOptions.map((option) => {
            const isActive = localeValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePreferenceChange(option.value, themeValue)}
                className={`relative flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                  isActive
                    ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent/30 font-semibold"
                    : "border-border/80 bg-surface hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{option.label}</span>
                {isActive && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Section */}
      <div className="mt-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2.5">
          {themeLabel}
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {themeOptions.map((option) => {
            const isActive = themeValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePreferenceChange(localeValue, option.value)}
                className={`relative flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent/30 font-semibold"
                    : "border-border/80 bg-surface hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {getThemeIcon(option.value, "h-4 w-4 text-foreground/85")}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function applyTheme(theme: string) {
  if (!themePreferences.includes(theme as ThemePreference)) {
    return;
  }

  const root = document.documentElement;
  root.classList.remove(...themePreferences.map((preference) => `theme-${preference}`));
  root.classList.add(`theme-${theme}`);
}
