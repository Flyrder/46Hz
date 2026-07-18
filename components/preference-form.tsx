"use client";

import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { useEffect, useState, useRef, useTransition, type MouseEvent as ReactMouseEvent } from "react";
import { updatePreferencesAction } from "@/app/actions/preferences";
import type { Locale } from "@/lib/i18n";
import { themePreferences, type ThemePreference } from "@/lib/theme";
import { Sun, Moon, Monitor, Languages, Check, Loader2 } from "lucide-react";
=======
import { useEffect, useState, type ChangeEvent } from "react";
import { updatePreferencesAction } from "@/app/actions/preferences";
import type { Locale } from "@/lib/i18n";
import { themePreferences, type ThemePreference } from "@/lib/theme";
>>>>>>> 2f3e05a24ebe43c1ec467468bc42a74b5966e785

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
<<<<<<< HEAD
  const [localeValue, setLocaleValue] = useState<Locale>(locale);
  const [themeValue, setThemeValue] = useState<ThemePreference>(theme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCompact = variant === "compact";
=======
  const [localeValue, setLocaleValue] = useState(locale);
  const [themeValue, setThemeValue] = useState(theme);
  const isCompact = variant === "compact";
  const formClassName = isCompact
    ? "flex items-center gap-2"
    : "mt-5 rounded-lg border border-border bg-surface p-5 shadow-soft";
  const labelClassName = isCompact ? "sr-only" : "mt-4 block text-sm font-semibold";
  const selectClassName = isCompact
    ? "h-9 rounded-lg border border-border bg-surface px-2 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
    : "mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
>>>>>>> 2f3e05a24ebe43c1ec467468bc42a74b5966e785

  useEffect(() => {
    setLocaleValue(locale);
  }, [locale]);

  useEffect(() => {
    setThemeValue(theme);
  }, [theme]);

<<<<<<< HEAD
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
    const themeIndex = themePreferences.indexOf(themeValue);

    return (
      <div className="flex items-center gap-2 relative">
        {/* Language Picker Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={localeLabel}
            aria-expanded={menuOpen}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-full border border-border bg-surface text-xs font-medium hover:bg-muted/50 active:scale-95 transition-all select-none"
          >
            <Languages className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{getLangCode(localeValue)}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-border bg-surface p-1 shadow-soft z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {localeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handlePreferenceChange(option.value, themeValue);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-medium hover:bg-muted/50 transition-colors text-foreground"
                >
                  <span>{option.label}</span>
                  {localeValue === option.value && (
                    <Check className="h-3 w-3 text-accent" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Segmented Toggle */}
        <div className="relative flex items-center bg-muted/40 border border-border/70 p-0.5 rounded-full h-8 w-24 overflow-hidden select-none">
          {/* Sliding Pill Background Highlight */}
          <div
            className="absolute top-0.5 bottom-0.5 rounded-full bg-surface shadow-sm transition-all duration-200 ease-out"
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
                onClick={() => handlePreferenceChange(localeValue, pref)}
                aria-label={pref}
                className={`relative flex-1 grid place-items-center h-full rounded-full transition-colors z-10 ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {getThemeIcon(pref, "h-3.5 w-3.5")}
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
    <div className="mt-5 rounded-lg border border-border bg-surface p-5 shadow-soft">
      {title && (
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
        </div>
      )}

      {/* Language Section */}
      <div>
        <label className="text-sm font-semibold block text-foreground mb-2">
          {localeLabel}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {localeOptions.map((option) => {
            const isActive = localeValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePreferenceChange(option.value, themeValue)}
                className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  isActive
                    ? "border-accent bg-accent/5 text-foreground ring-1 ring-accent/20"
                    : "border-border bg-surface hover:border-border/80 hover:bg-muted/10 text-muted-foreground hover:text-foreground"
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
      <div className="mt-5">
        <label className="text-sm font-semibold block text-foreground mb-2">
          {themeLabel}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const isActive = themeValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePreferenceChange(localeValue, option.value)}
                className={`relative flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? "border-accent bg-accent/5 text-foreground ring-1 ring-accent/20"
                    : "border-border bg-surface hover:border-border/80 hover:bg-muted/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {getThemeIcon(option.value, "h-4 w-4 text-foreground/80")}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
=======
  async function handleSubmit(formData: FormData) {
    await updatePreferencesAction(formData);
    router.refresh();
  }

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.currentTarget.value;

    if (event.currentTarget.name === "locale") {
      setLocaleValue(value as Locale);
    }

    if (event.currentTarget.name === "theme") {
      setThemeValue(value as ThemePreference);
      applyTheme(value);
    }

    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form action={handleSubmit} className={formClassName}>
      {!isCompact && title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      <label className={labelClassName} htmlFor={`${variant}-locale`}>
        {localeLabel}
      </label>
      <select
        id={`${variant}-locale`}
        name="locale"
        value={localeValue}
        className={selectClassName}
        onChange={handleChange}
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className={labelClassName} htmlFor={`${variant}-theme`}>
        {themeLabel}
      </label>
      <select
        id={`${variant}-theme`}
        name="theme"
        value={themeValue}
        className={selectClassName}
        onChange={handleChange}
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
>>>>>>> 2f3e05a24ebe43c1ec467468bc42a74b5966e785
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
