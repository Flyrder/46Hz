import { databaseDate } from "@/lib/dates";

export type ClassValue =
  | ClassValue[]
  | Record<string, boolean | number | string | null | undefined>
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Minimalist, zero-dependency class name joining utility.
 * Recursively flattens strings, booleans, objects, and arrays.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}

export function formatDate(value: Date | string, locale = "ko-KR"): string {
  const normalized =
    locale === "ko_KR"
      ? "ko-KR"
      : locale === "zh_CN"
        ? "zh-CN"
        : locale === "en_US"
          ? "en-US"
          : locale;
  return new Intl.DateTimeFormat(normalized, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(databaseDate(value));
}

export function excerpt(text: string, length = 160): string {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length).trim()}...`;
}
