"use client";

import { updatePreferencesAction } from "@/app/actions/preferences";
import type { Locale } from "@/lib/i18n";
import { themePreferences, type ThemePreference } from "@/lib/theme";

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
  const isCompact = variant === "compact";
  const formClassName = isCompact
    ? "flex items-center gap-2"
    : "mt-5 rounded-lg border border-border bg-surface p-5 shadow-soft";
  const labelClassName = isCompact ? "sr-only" : "mt-4 block text-sm font-semibold";
  const selectClassName = isCompact
    ? "h-9 rounded-lg border border-border bg-surface px-2 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
    : "mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (event.currentTarget.name === "theme") {
      applyTheme(event.currentTarget.value);
    }

    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form action={updatePreferencesAction} className={formClassName}>
      {!isCompact && title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      <label className={labelClassName} htmlFor={`${variant}-locale`}>
        {localeLabel}
      </label>
      <select
        id={`${variant}-locale`}
        name="locale"
        defaultValue={locale}
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
        defaultValue={theme}
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
