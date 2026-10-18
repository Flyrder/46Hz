import postgres, { type PostgresClient } from "@prisma/orm-postgres/runtime";
import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import { Pool } from "pg";
import type { Contract, Models } from "@/prisma/contract";
import contractJson from "@/prisma/contract.json" with { type: "json" };

export type Database = PostgresClient<Contract>;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DatabaseScope = Pick<Database, "orm" | "sql">;

// Model types come from the emitted contract; relations exist only when included.
export type User = Scalars<Models.public_User>;
export type Letter = Scalars<Models.public_Letter>;
export type Reply = Scalars<Models.public_Reply>;
export type Match = Scalars<Models.public_Match>;
export type Feedback = Scalars<Models.public_Feedback>;
export type ModerationEvent = Scalars<Models.public_ModerationEvent>;
export type SupportResource = Scalars<Models.public_SupportResource>;
export type LetterComment = Scalars<Models.public_LetterComment>;

const DEFAULT_DATABASE_URL =
  "postgresql://46hz:46hz@localhost:5432/46hz_letterbox?schema=public";

type PostgresPoolBinding = NonNullable<Parameters<typeof postgres<Contract>>[0]["pg"]>;

/** Construct a typed, lazy client. The caller owns the supplied pool. */
export function createDatabase(pool: Pool): Database {
  return postgres<Contract>({
    contractJson,
    pg: pool as unknown as PostgresPoolBinding
  });
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function createDatabaseState() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
    max: positiveInteger(process.env.DATABASE_POOL_MAX, 10),
    idleTimeoutMillis: positiveInteger(process.env.DATABASE_IDLE_TIMEOUT_MS, 30_000),
    connectionTimeoutMillis: positiveInteger(process.env.DATABASE_CONNECT_TIMEOUT_MS, 5_000)
  });

  // Idle socket errors must not become unhandled EventEmitter errors. Do not log
  // connection strings, query parameters, or users' letter content.
  pool.on("error", () => console.error("[database] An idle PostgreSQL connection failed."));

  return { pool, client: createDatabase(pool), closing: undefined as Promise<void> | undefined };
}

const globalForDatabase = globalThis as typeof globalThis & {
  __46hzPrisma8?: ReturnType<typeof createDatabaseState>;
};

// Reuse the pool and native client across Next.js development reloads.
const state = globalForDatabase.__46hzPrisma8 ??= createDatabaseState();
export const db = state.client;

/** A real connectivity probe; constructing a Prisma 8 client is deliberately lazy. */
export async function pingDatabase(): Promise<void> {
  const plan = db.raw.sql`SELECT 1 AS ok`.returnsRow({ ok: "pg/int4@1" }).build();
  await db.runtime().query(plan);
}

/** For one-off scripts only. Never close the shared pool after an HTTP request. */
export async function disconnectDatabase(): Promise<void> {
  state.closing ??= (async () => {
    try {
      await db.close();
    } finally {
      await state.pool.end();
      if (globalForDatabase.__46hzPrisma8 === state) {
        delete globalForDatabase.__46hzPrisma8;
      }
    }
  })();
  await state.closing;
}
