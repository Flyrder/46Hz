import postgres from "@prisma/orm-postgres/runtime";
import { and, or, not } from "@prisma/orm-postgres/orm-client";
import contractJson from "../prisma/contract.json" with { type: "json" };
import pg from "pg";

export type AgeRange = "UNDER_18" | "ADULT";
export type ReplyType = "COMFORT" | "ADVICE" | "SIMILAR_EXPERIENCES" | "JUST_BEING_HEARD";
export type RiskLevel = "NORMAL" | "SENSITIVE" | "HIGH" | "BLOCKED";
export type LetterStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "ROUTED_TO_SUPPORT";
export type ReplyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MatchStatus = "OFFERED" | "RESPONDED" | "SKIPPED" | "EXPIRED";
export type ModerationTargetType = "LETTER" | "REPLY" | "USER" | "SUPPORT_RESOURCE";

export interface User {
  id: string;
  anonymousHandle: string;
  migrationCode: string | null;
  language: string;
  themePreference: string;
  ageRange: AgeRange;
  preferredReplyType: ReplyType;
  trustScore: number;
  recentIps: any;
  suspendedAt: Date | null;
  createdAt: Date;
  letters: Letter[];
  replies: Reply[];
  matches: Match[];
  feedback: Feedback[];
  comments: LetterComment[];
  _count: {
    letters: number;
    replies: number;
    matches: number;
    comments: number;
    feedback: number;
  };
}

export interface Letter {
  id: string;
  authorId: string;
  author: User;
  rawText: string;
  processedText: string;
  emotionTags: string[];
  situationTags: string[];
  desiredReplyType: ReplyType;
  riskLevel: RiskLevel;
  language: string;
  status: LetterStatus;
  maxReplies: number;
  createdAt: Date;
  updatedAt: Date;
  replies: Reply[];
  matches: Match[];
  comments: LetterComment[];
  _count: {
    replies: number;
    matches: number;
    comments: number;
  };
}

export interface Reply {
  id: string;
  letterId: string;
  letter: Letter;
  responderId: string;
  responder: User;
  rawText: string;
  coachedText: string;
  status: ReplyStatus;
  createdAt: Date;
  updatedAt: Date;
  feedback: Feedback[];
  _count: {
    feedback: number;
  };
}

export interface Match {
  id: string;
  letterId: string;
  letter: Letter;
  responderId: string;
  responder: User;
  status: MatchStatus;
  matchReason: string;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feedback {
  id: string;
  replyId: string;
  reply: Reply;
  fromUserId: string;
  userId: string;
  user: User;
  fromUser: User;
  feltUnderstood: boolean;
  helpful: boolean;
  tooJudgmental: boolean;
  tooMuchAdvice: boolean;
  qualityScore: number;
  feedbackContent: string | null;
  reportReason: string | null;
  createdAt: Date;
}

export interface ModerationEvent {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  action: string;
  reason: string | null;
  previousStatus: string | null;
  newStatus: string | null;
  createdAt: Date;
}

export interface SupportResource {
  id: string;
  title: string;
  description: string;
  region: string;
  language: string;
  url: string | null;
  phone: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LetterComment {
  id: string;
  letterId: string;
  letter: Letter;
  authorId: string;
  author: User;
  selectedText: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export namespace Prisma {
  export type LetterWhereInput = Record<string, any>;
  export type ReplyWhereInput = Record<string, any>;
  export type UserWhereInput = Record<string, any>;
  export type MatchWhereInput = Record<string, any>;
  export type FeedbackWhereInput = Record<string, any>;
  export type ModerationEventWhereInput = Record<string, any>;
  export type SupportResourceWhereInput = Record<string, any>;
  export type LetterCommentWhereInput = Record<string, any>;
}

export interface PrismaClient {
  user: ReturnType<typeof createModelDelegate<User>>;
  letter: ReturnType<typeof createModelDelegate<Letter>>;
  reply: ReturnType<typeof createModelDelegate<Reply>>;
  match: ReturnType<typeof createModelDelegate<Match>>;
  feedback: ReturnType<typeof createModelDelegate<Feedback>>;
  moderationEvent: ReturnType<typeof createModelDelegate<ModerationEvent>>;
  supportResource: ReturnType<typeof createModelDelegate<SupportResource>>;
  letterComment: ReturnType<typeof createModelDelegate<LetterComment>>;
  $transaction: {
    <T extends readonly unknown[] | []>(arg: readonly [...T]): Promise<{ [K in keyof T]: Awaited<T[K]> }>;
    <T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T>;
  };
  $queryRaw: (strings: TemplateStringsArray | string[] | string, ...values: any[]) => Promise<any[]>;
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
  prisma8Db?: any;
};

const pool =
  globalForPrisma.pgPool ??
  new pg.Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://46hz:46hz@localhost:5432/46hz_letterbox?schema=public",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

const db =
  globalForPrisma.prisma8Db ??
  postgres({
    contractJson,
    pg: pool as any
  });

function parseUtcDate(val: any): Date {
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    if (!val.endsWith("Z") && !val.includes("+") && !val.includes("-", 10)) {
      return new Date(val.replace(" ", "T") + "Z");
    }
    return new Date(val);
  }
  return new Date(val);
}

function normalizeRow(row: any): any {
  if (!row || typeof row !== "object") return row;
  if (Array.isArray(row)) return row.map(normalizeRow);
  const result: any = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === undefined) {
      result[k] = v;
    } else if (k === "createdAt" || k === "updatedAt" || k === "lockedUntil" || k === "suspendedAt") {
      result[k] = parseUtcDate(v);
    } else if (Array.isArray(v)) {
      result[k] = v.map(normalizeRow);
    } else if (typeof v === "object" && !(v instanceof Date)) {
      result[k] = normalizeRow(v);
    } else {
      result[k] = v;
    }
  }

  // Populate relationship aliases and count helper
  if (result.user && !result.fromUser) {
    result.fromUser = result.user;
  } else if (result.fromUser && !result.user) {
    result.user = result.fromUser;
  }
  if (result.userId && !result.fromUserId) {
    result.fromUserId = result.userId;
  } else if (result.fromUserId && !result.userId) {
    result.userId = result.fromUserId;
  }

  if ("emotionTags" in result && !Array.isArray(result.emotionTags)) {
    result.emotionTags = [];
  }
  if ("situationTags" in result && !Array.isArray(result.situationTags)) {
    result.situationTags = [];
  }

  if (result.replies === undefined) result.replies = [];
  if (result.matches === undefined) result.matches = [];
  if (result.comments === undefined) result.comments = [];
  if (result.feedback === undefined) result.feedback = [];
  if (result.letters === undefined) result.letters = [];

  if (!result._count) {
    result._count = {
      replies: Array.isArray(result.replies) ? result.replies.length : 0,
      letters: Array.isArray(result.letters) ? result.letters.length : 0,
      matches: Array.isArray(result.matches) ? result.matches.length : 0,
      comments: Array.isArray(result.comments) ? result.comments.length : 0,
      feedback: Array.isArray(result.feedback) ? result.feedback.length : 0
    };
  }

  return result;
}

const SCALAR_AND_RELATION_OPS = new Set([
  "equals",
  "not",
  "in",
  "notIn",
  "lt",
  "lte",
  "gt",
  "gte",
  "contains",
  "startsWith",
  "endsWith",
  "has",
  "hasSome",
  "hasEvery",
  "isEmpty",
  "some",
  "none",
  "every",
  "is",
  "isNot"
]);

function isPlainObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date);
}

function isCompoundUniqueFilter(key: string, val: unknown): val is Record<string, any> {
  if (!key.includes("_") || !isPlainObject(val)) return false;
  const keys = Object.keys(val);
  return keys.length > 0 && !keys.some((k) => SCALAR_AND_RELATION_OPS.has(k));
}

function resolveAccessorMember(m: any, key: string): any {
  if (!m) return undefined;
  try {
    const member = m[key];
    if (member !== undefined) return member;
  } catch {
    // ModelAccessor proxy throws ORM.FIELD_UNKNOWN when key is not on the model
  }
  if (key === "user") {
    try {
      return m["fromUser"];
    } catch {
      return undefined;
    }
  }
  if (key === "userId") {
    try {
      return m["fromUserId"];
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function isRelationAccessor(target: any): boolean {
  return Boolean(
    target &&
      typeof target.some === "function" &&
      typeof target.none === "function" &&
      typeof target.every === "function"
  );
}

function buildFieldExpr(m: any, key: string, val: any, tools?: any): any {
  const target = resolveAccessorMember(m, key);
  if (!target) return undefined;

  // Relation filter accessor (some / none / every / is / isNot)
  if (isRelationAccessor(target)) {
    if (val === null) {
      return target.none();
    }
    if (!isPlainObject(val)) {
      return undefined;
    }

    const relExprs: any[] = [];
    if (val.some !== undefined) {
      if (!isPlainObject(val.some) || Object.keys(val.some).length === 0) {
        relExprs.push(target.some());
      } else {
        relExprs.push(
          target.some((rel: any, relTools: any) => buildWhereExpr(rel, val.some, relTools))
        );
      }
    }
    if (val.none !== undefined) {
      if (!isPlainObject(val.none) || Object.keys(val.none).length === 0) {
        relExprs.push(target.none());
      } else {
        relExprs.push(
          target.none((rel: any, relTools: any) => buildWhereExpr(rel, val.none, relTools))
        );
      }
    }
    if (val.every !== undefined) {
      relExprs.push(
        target.every((rel: any, relTools: any) => buildWhereExpr(rel, val.every, relTools))
      );
    }
    if (val.is !== undefined) {
      if (val.is === null) {
        relExprs.push(target.none());
      } else if (isPlainObject(val.is)) {
        relExprs.push(
          target.some((rel: any, relTools: any) => buildWhereExpr(rel, val.is, relTools))
        );
      }
    }
    if (val.isNot !== undefined) {
      if (val.isNot === null) {
        relExprs.push(target.some());
      } else if (isPlainObject(val.isNot)) {
        relExprs.push(
          target.none((rel: any, relTools: any) => buildWhereExpr(rel, val.isNot, relTools))
        );
      }
    }

    if (
      relExprs.length === 0 &&
      val.some === undefined &&
      val.none === undefined &&
      val.every === undefined &&
      val.is === undefined &&
      val.isNot === undefined
    ) {
      relExprs.push(target.some((rel: any, relTools: any) => buildWhereExpr(rel, val, relTools)));
    }

    if (relExprs.length === 0) return undefined;
    return relExprs.length === 1 ? relExprs[0] : and(...relExprs);
  }

  // Scalar field accessor
  if (isPlainObject(val)) {
    const ops = val as Record<string, any>;
    const fieldExprs: any[] = [];

    if (ops.equals !== undefined) {
      fieldExprs.push(ops.equals === null ? target.isNull() : target.eq(ops.equals));
    }
    if (ops.gte !== undefined) fieldExprs.push(target.gte(ops.gte));
    if (ops.lte !== undefined) fieldExprs.push(target.lte(ops.lte));
    if (ops.gt !== undefined) fieldExprs.push(target.gt(ops.gt));
    if (ops.lt !== undefined) fieldExprs.push(target.lt(ops.lt));
    if (ops.in !== undefined) fieldExprs.push(target.in(ops.in));
    if (ops.notIn !== undefined) fieldExprs.push(target.notIn(ops.notIn));
    if (ops.not !== undefined) {
      if (ops.not === null) {
        fieldExprs.push(target.isNotNull());
      } else if (isPlainObject(ops.not)) {
        const nested = buildFieldExpr(m, key, ops.not, tools);
        if (nested) fieldExprs.push(not(nested));
      } else {
        fieldExprs.push(target.neq(ops.not));
      }
    }
    if (ops.contains !== undefined && typeof target.like === "function") {
      fieldExprs.push(target.like(`%${ops.contains}%`));
    }
    if (ops.startsWith !== undefined && typeof target.like === "function") {
      fieldExprs.push(target.like(`${ops.startsWith}%`));
    }
    if (ops.endsWith !== undefined && typeof target.like === "function") {
      fieldExprs.push(target.like(`%${ops.endsWith}`));
    }
    if (ops.has !== undefined && tools?.fns?.raw) {
      fieldExprs.push(tools.fns.raw`${ops.has} = ANY(${target})`.returns("pg/bool@1"));
    }
    if (ops.hasSome !== undefined && Array.isArray(ops.hasSome) && tools?.fns?.raw) {
      const someExprs = ops.hasSome.map((item: any) =>
        tools.fns.raw`${item} = ANY(${target})`.returns("pg/bool@1")
      );
      if (someExprs.length === 1) fieldExprs.push(someExprs[0]);
      else if (someExprs.length > 1) fieldExprs.push(or(...someExprs));
    }
    if (ops.hasEvery !== undefined && Array.isArray(ops.hasEvery) && tools?.fns?.raw) {
      const everyExprs = ops.hasEvery.map((item: any) =>
        tools.fns.raw`${item} = ANY(${target})`.returns("pg/bool@1")
      );
      if (everyExprs.length === 1) fieldExprs.push(everyExprs[0]);
      else if (everyExprs.length > 1) fieldExprs.push(and(...everyExprs));
    }

    if (fieldExprs.length === 0) return undefined;
    return fieldExprs.length === 1 ? fieldExprs[0] : and(...fieldExprs);
  }

  if (val === null) return target.isNull();
  return target.eq(val);
}

function buildWhereExpr(m: any, where: Record<string, any>, tools?: any): any {
  if (!where || typeof where !== "object") return undefined;
  const exprs: any[] = [];

  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;

    if (key === "AND") {
      const items = Array.isArray(val) ? val : [val];
      for (const item of items) {
        if (!item) continue;
        const sub = buildWhereExpr(m, item, tools);
        if (sub) exprs.push(sub);
      }
      continue;
    }

    if (key === "OR" && Array.isArray(val)) {
      const subExprs = val
        .filter(Boolean)
        .map((item) => buildWhereExpr(m, item, tools))
        .filter(Boolean);
      if (subExprs.length === 1) exprs.push(subExprs[0]);
      else if (subExprs.length > 1) exprs.push(or(...subExprs));
      continue;
    }

    if (key === "NOT") {
      const items = Array.isArray(val) ? val : [val];
      const subExprs = items
        .filter(Boolean)
        .map((item) => buildWhereExpr(m, item, tools))
        .filter(Boolean);
      if (subExprs.length === 1) exprs.push(not(subExprs[0]));
      else if (subExprs.length > 1) exprs.push(not(and(...subExprs)));
      continue;
    }

    if (isCompoundUniqueFilter(key, val)) {
      const sub = buildWhereExpr(m, val, tools);
      if (sub) exprs.push(sub);
      continue;
    }

    const fieldExpr = buildFieldExpr(m, key, val, tools);
    if (fieldExpr) exprs.push(fieldExpr);
  }

  if (exprs.length === 0) return undefined;
  return exprs.length === 1 ? exprs[0] : and(...exprs);
}

function applyWhere(col: any, where?: any) {
  if (!where || typeof where !== "object") return col;
  const hasActiveEntries = Object.values(where).some((v) => v !== undefined);
  if (!hasActiveEntries) return col;

  return col.where((m: any, tools: any) => buildWhereExpr(m, where, tools));
}

function applyOrderBy(col: any, orderBy?: any) {
  if (!orderBy) return col;
  let current = col;
  const list = Array.isArray(orderBy) ? orderBy : [orderBy];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    for (const [field, dir] of Object.entries(item)) {
      current = current.orderBy((m: any) => (dir === "asc" ? m[field].asc() : m[field].desc()));
    }
  }
  return current;
}

function applyIncludes(col: any, include?: any, select?: any) {
  const effectiveInclude =
    include || (select && typeof select === "object" && select._count ? { _count: select._count } : undefined);
  if (!effectiveInclude) return col;
  let current = col;
  for (const [rel, val] of Object.entries(effectiveInclude)) {
    if (!val) continue;

    if (rel === "_count") {
      if (val && typeof val === "object" && (val as any).select) {
        for (const [subRel, subVal] of Object.entries((val as any).select)) {
          if (subVal && !effectiveInclude[subRel]) {
            const actualSubRel = subRel === "user" ? "fromUser" : subRel;
            current = current.include(actualSubRel, (nested: any) => {
              let n = nested;
              if (typeof subVal === "object" && (subVal as any).where) {
                n = applyWhere(n, (subVal as any).where);
              }
              return n;
            });
          }
        }
      }
      continue;
    }

    const actualRel = rel === "user" ? "fromUser" : rel;
    if (typeof val === "object") {
      current = current.include(actualRel, (nested: any) => {
        let n = nested;
        if ((val as any).where) n = applyWhere(n, (val as any).where);
        if ((val as any).orderBy) n = applyOrderBy(n, (val as any).orderBy);
        if ((val as any).take !== undefined) n = n.limit((val as any).take);
        if ((val as any).skip !== undefined) n = n.offset((val as any).skip);
        if ((val as any).include || (val as any).select) {
          n = applyIncludes(n, (val as any).include, (val as any).select);
        }
        return n;
      });
    } else {
      current = current.include(actualRel);
    }
  }
  return current;
}

function createModelDelegate<T, C = any, U = any>(collectionGetter: () => any) {
  return {
    fields: new Proxy({} as Record<string, string>, {
      get: (_target, prop) => String(prop)
    }),
    async findUnique(args: { where: any; include?: any; select?: any }): Promise<T | null> {
      let col = collectionGetter();
      col = applyWhere(col, args?.where);
      col = applyIncludes(col, args?.include, args?.select);
      const row = await col.first();
      return normalizeRow(row);
    },
    async findFirst(args?: { where?: any; include?: any; select?: any; orderBy?: any }): Promise<T | null> {
      let col = collectionGetter();
      col = applyWhere(col, args?.where);
      col = applyOrderBy(col, args?.orderBy);
      col = applyIncludes(col, args?.include, args?.select);
      const row = await col.first();
      return normalizeRow(row);
    },
    async findMany(args?: { where?: any; include?: any; select?: any; orderBy?: any; take?: number; skip?: number }): Promise<T[]> {
      let col = collectionGetter();
      col = applyWhere(col, args?.where);
      col = applyOrderBy(col, args?.orderBy);
      if (args?.take !== undefined) col = col.limit(args.take);
      if (args?.skip !== undefined) col = col.offset(args.skip);
      col = applyIncludes(col, args?.include, args?.select);
      const rows = await col.all();
      return (rows || []).map(normalizeRow);
    },
    async create(args: { data: C; include?: any; select?: any }): Promise<T> {
      const col = collectionGetter();
      const created = await col.create(args.data);
      if (args?.include && created?.id) {
        return (await this.findUnique({ where: { id: created.id }, include: args.include })) as T;
      }
      return normalizeRow(created);
    },
    async createMany(args: { data: C[] | C }): Promise<{ count: number }> {
      const col = collectionGetter();
      const rows = Array.isArray(args.data) ? args.data : [args.data];
      const created = await col.createAll(rows);
      return { count: created?.length ?? rows.length };
    },
    async update(args: { where: any; data: U; include?: any; select?: any }): Promise<T> {
      let col = collectionGetter();
      col = applyWhere(col, args.where);
      const updated = await col.update(args.data);
      if (args?.include && updated?.id) {
        return (await this.findUnique({ where: { id: updated.id }, include: args.include })) as T;
      }
      return normalizeRow(updated);
    },
    async updateMany(args: { where?: any; data: U }): Promise<{ count: number }> {
      let col = collectionGetter();
      col = applyWhere(col, args?.where);
      const res = await col.updateAll(args.data);
      return { count: Array.isArray(res) ? res.length : (res?.count ?? 0) };
    },
    async delete(args: { where: any }): Promise<T> {
      let col = collectionGetter();
      col = applyWhere(col, args.where);
      const deleted = await col.delete();
      return normalizeRow(deleted);
    },
    async deleteMany(args?: { where?: any }): Promise<{ count: number }> {
      let col = collectionGetter();
      if (args?.where) {
        col = applyWhere(col, args.where);
      }
      const count = await col.deleteAndCount();
      return { count: typeof count === "number" ? count : (count?.affectedRows ?? 0) };
    },
    async count(args?: { where?: any }): Promise<number> {
      let col = collectionGetter();
      if (args?.where) {
        col = applyWhere(col, args.where);
      }
      const res = await col.aggregate((a: any) => ({ count: a.count() }));
      return res?.count ?? 0;
    },
    async upsert(args: { where: any; create: C; update: U; include?: any }): Promise<T> {
      let flatWhere = args.where;
      for (const [k, v] of Object.entries(args.where || {})) {
        if (k.includes("_") && typeof v === "object" && v !== null) {
          flatWhere = v;
          break;
        }
      }
      const existing = await applyWhere(collectionGetter(), flatWhere).first();
      if (existing) {
        return this.update({ where: flatWhere, data: args.update, include: args.include });
      } else {
        return this.create({ data: args.create, include: args.include });
      }
    }
  };
}

async function $queryRaw(strings: TemplateStringsArray | string[] | string, ...values: any[]) {
  if (typeof strings === "string") {
    const res = await pool.query(strings, values);
    return res.rows;
  }
  let queryText = "";
  for (let i = 0; i < strings.length; i++) {
    queryText += strings[i];
    if (i < values.length) {
      queryText += `$${i + 1}`;
    }
  }
  const res = await pool.query(queryText, values);
  return res.rows;
}

async function $connect() {
  await db.connect();
}

async function $disconnect() {
  await pool.end().catch(() => void 0);
}

export function createPrismaClient(runtimeDb: any = db): PrismaClient {
  const orm = runtimeDb.orm.public;
  const $transaction: PrismaClient["$transaction"] = (async (arg: any): Promise<any> => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === "function") {
      return await runtimeDb.transaction(async (txCtx: any) => {
        return await arg(createPrismaClient(txCtx));
      });
    }
    throw new Error("Invalid $transaction argument");
  }) as PrismaClient["$transaction"];

  return {
    user: createModelDelegate<User>(() => orm.User),
    letter: createModelDelegate<Letter>(() => orm.Letter),
    reply: createModelDelegate<Reply>(() => orm.Reply),
    match: createModelDelegate<Match>(() => orm.Match),
    feedback: createModelDelegate<Feedback>(() => orm.Feedback),
    moderationEvent: createModelDelegate<ModerationEvent>(() => orm.ModerationEvent),
    supportResource: createModelDelegate<SupportResource>(() => orm.SupportResource),
    letterComment: createModelDelegate<LetterComment>(() => orm.LetterComment),
    $transaction,
    $queryRaw,
    $connect,
    $disconnect
  };
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient(db);

globalForPrisma.prisma = prisma;
globalForPrisma.pgPool = pool;
globalForPrisma.prisma8Db = db;
