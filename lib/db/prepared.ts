import { db, type User } from "@/lib/db";

let preparedGetUserPromise: ReturnType<typeof initPreparedGetUser> | undefined;

function initPreparedGetUser() {
  return db.prepare({ id: "pg/text@1" }, (params) =>
    db.sql.public.User
      .select(
        "id",
        "anonymousHandle",
        "migrationCode",
        "language",
        "themePreference",
        "ageRange",
        "preferredReplyType",
        "trustScore",
        "suspendedAt",
        "createdAt",
        "recentIps"
      )
      .where((f, fns) => fns.eq(f.id, params.id))
      .limit(1)
      .build()
  );
}

/**
 * Pre-compiled prepared statement for user session retrieval.
 * Eliminates query AST building and compilation overhead on every authenticated request.
 */
export async function getPreparedGetUser() {
  return (preparedGetUserPromise ??= initPreparedGetUser());
}
