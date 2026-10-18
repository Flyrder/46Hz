import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";

/** Legacy timestamp columns store UTC without an explicit timezone suffix. */
export function databaseDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const text = value.replace(" ", "T");
  return new Date(/(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(text) ? text : `${text}Z`);
}

/** Convert a Date or timestamp string into a canonical UTC TimestampString<3>. */
export function toTimestamp(value: Date | string = new Date()): TimestampString<3> {
  return databaseDate(value).toISOString().slice(0, -1) as TimestampString<3>;
}
