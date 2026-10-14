#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8ac3d376ace8a2ca09dc596cb04b6d0d96966f3884129778f7dd801c4bdad535/contract';
import endContract from '../../snapshots/8ac3d376ace8a2ca09dc596cb04b6d0d96966f3884129778f7dd801c4bdad535/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'AgeRange',
        members: ['UNDER_18', 'ADULT'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'LetterStatus',
        members: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ROUTED_TO_SUPPORT'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'MatchStatus',
        members: ['OFFERED', 'RESPONDED', 'SKIPPED', 'EXPIRED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'ModerationTargetType',
        members: ['LETTER', 'REPLY', 'USER', 'SUPPORT_RESOURCE'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'ReplyStatus',
        members: ['PENDING', 'APPROVED', 'REJECTED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'ReplyType',
        members: ['COMFORT', 'ADVICE', 'SIMILAR_EXPERIENCES', 'JUST_BEING_HEARD'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'RiskLevel',
        members: ['NORMAL', 'SENSITIVE', 'HIGH', 'BLOCKED'],
      }),
      this.createTable({
        schema: 'public',
        table: 'Feedback',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('feltUnderstood', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('fromUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('helpful', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('replyId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reportReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tooJudgmental', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('tooMuchAdvice', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Letter',
        columns: [
          col('authorId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('desiredReplyType', '"ReplyType"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'ReplyType' } },
          }),
          col('emotionTags', 'text[]', { codecRef: { codecId: 'pg/text@1', many: true } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('language', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('maxReplies', 'int4', {
            notNull: true,
            default: lit(7),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('processedText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('rawText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('riskLevel', '"RiskLevel"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'RiskLevel' } },
          }),
          col('situationTags', 'text[]', { codecRef: { codecId: 'pg/text@1', many: true } }),
          col('status', '"LetterStatus"', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'LetterStatus' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'LetterComment',
        columns: [
          col('authorId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('letterId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('selectedText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Match',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('letterId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('matchReason', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('responderId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', '"MatchStatus"', {
            notNull: true,
            default: lit('OFFERED'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'MatchStatus' } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ModerationEvent',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('newStatus', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('previousStatus', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('targetId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('targetType', '"ModerationTargetType"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'ModerationTargetType' } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Reply',
        columns: [
          col('coachedText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('letterId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('rawText', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('responderId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', '"ReplyStatus"', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'ReplyStatus' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'SupportResource',
        columns: [
          col('active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('language', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('region', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('ageRange', '"AgeRange"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'AgeRange' } },
          }),
          col('anonymousHandle', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('language', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('migrationCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('preferredReplyType', '"ReplyType"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'ReplyType' } },
          }),
          col('recentIps', 'jsonb', {
            notNull: true,
            default: lit([]),
            codecRef: { codecId: 'pg/jsonb@1' },
          }),
          col('suspendedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('themePreference', 'text', {
            notNull: true,
            default: lit('system'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('trustScore', 'int4', {
            notNull: true,
            default: lit(50),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Feedback',
        index: 'Feedback_replyId_fromUserId_key',
        columns: ['replyId', 'fromUserId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Feedback',
        index: 'Feedback_reportReason_idx',
        columns: ['reportReason'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Letter',
        index: 'Letter_authorId_createdAt_idx',
        columns: ['authorId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Letter',
        index: 'Letter_status_riskLevel_maxReplies_createdAt_idx',
        columns: ['status', 'riskLevel', 'maxReplies', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LetterComment',
        index: 'LetterComment_authorId_createdAt_idx',
        columns: ['authorId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LetterComment',
        index: 'LetterComment_letterId_createdAt_idx',
        columns: ['letterId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Match',
        index: 'Match_letterId_responderId_key',
        columns: ['letterId', 'responderId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Match',
        index: 'Match_responderId_status_idx',
        columns: ['responderId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ModerationEvent',
        index: 'ModerationEvent_createdAt_idx',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ModerationEvent',
        index: 'ModerationEvent_targetType_targetId_createdAt_idx',
        columns: ['targetType', 'targetId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Reply',
        index: 'Reply_letterId_status_idx',
        columns: ['letterId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Reply',
        index: 'Reply_responderId_createdAt_idx',
        columns: ['responderId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Reply',
        index: 'Reply_status_createdAt_idx',
        columns: ['status', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SupportResource',
        index: 'SupportResource_active_language_region_idx',
        columns: ['active', 'language', 'region'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_anonymousHandle_key',
        columns: ['anonymousHandle'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_migrationCode_key',
        columns: ['migrationCode'],
        extras: { unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Feedback',
        foreignKey: {
          name: 'Feedback_replyId_fkey',
          columns: ['replyId'],
          references: { schema: 'public', table: 'Reply', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Feedback',
        foreignKey: {
          name: 'Feedback_fromUserId_fkey',
          columns: ['fromUserId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Letter',
        foreignKey: {
          name: 'Letter_authorId_fkey',
          columns: ['authorId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LetterComment',
        foreignKey: {
          name: 'LetterComment_letterId_fkey',
          columns: ['letterId'],
          references: { schema: 'public', table: 'Letter', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LetterComment',
        foreignKey: {
          name: 'LetterComment_authorId_fkey',
          columns: ['authorId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Match',
        foreignKey: {
          name: 'Match_letterId_fkey',
          columns: ['letterId'],
          references: { schema: 'public', table: 'Letter', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Match',
        foreignKey: {
          name: 'Match_responderId_fkey',
          columns: ['responderId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Reply',
        foreignKey: {
          name: 'Reply_letterId_fkey',
          columns: ['letterId'],
          references: { schema: 'public', table: 'Letter', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Reply',
        foreignKey: {
          name: 'Reply_responderId_fkey',
          columns: ['responderId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
