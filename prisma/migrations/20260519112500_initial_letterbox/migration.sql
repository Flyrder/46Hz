CREATE TYPE "AgeRange" AS ENUM ('UNDER_18', 'ADULT');
CREATE TYPE "ReplyType" AS ENUM ('COMFORT', 'ADVICE', 'SIMILAR_EXPERIENCES', 'JUST_BEING_HEARD');
CREATE TYPE "RiskLevel" AS ENUM ('NORMAL', 'SENSITIVE', 'HIGH', 'BLOCKED');
CREATE TYPE "LetterStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ROUTED_TO_SUPPORT');
CREATE TYPE "ReplyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "MatchStatus" AS ENUM ('OFFERED', 'RESPONDED', 'SKIPPED', 'EXPIRED');
CREATE TYPE "ModerationTargetType" AS ENUM ('LETTER', 'REPLY', 'USER', 'SUPPORT_RESOURCE');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "anonymousHandle" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "ageRange" "AgeRange" NOT NULL,
  "preferredReplyType" "ReplyType" NOT NULL,
  "trustScore" INTEGER NOT NULL DEFAULT 50,
  "suspendedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Letter" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "rawText" TEXT NOT NULL,
  "processedText" TEXT NOT NULL,
  "emotionTags" TEXT[],
  "situationTags" TEXT[],
  "desiredReplyType" "ReplyType" NOT NULL,
  "riskLevel" "RiskLevel" NOT NULL,
  "language" TEXT NOT NULL,
  "status" "LetterStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reply" (
  "id" TEXT NOT NULL,
  "letterId" TEXT NOT NULL,
  "responderId" TEXT NOT NULL,
  "rawText" TEXT NOT NULL,
  "coachedText" TEXT NOT NULL,
  "status" "ReplyStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Match" (
  "id" TEXT NOT NULL,
  "letterId" TEXT NOT NULL,
  "responderId" TEXT NOT NULL,
  "status" "MatchStatus" NOT NULL DEFAULT 'OFFERED',
  "matchReason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  "replyId" TEXT NOT NULL,
  "fromUserId" TEXT NOT NULL,
  "feltUnderstood" BOOLEAN NOT NULL DEFAULT false,
  "helpful" BOOLEAN NOT NULL DEFAULT false,
  "tooJudgmental" BOOLEAN NOT NULL DEFAULT false,
  "tooMuchAdvice" BOOLEAN NOT NULL DEFAULT false,
  "reportReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModerationEvent" (
  "id" TEXT NOT NULL,
  "targetType" "ModerationTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "previousStatus" TEXT,
  "newStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ModerationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportResource" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "url" TEXT,
  "phone" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SupportResource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_anonymousHandle_key" ON "User"("anonymousHandle");
CREATE INDEX "Letter_status_riskLevel_createdAt_idx" ON "Letter"("status", "riskLevel", "createdAt");
CREATE INDEX "Letter_authorId_createdAt_idx" ON "Letter"("authorId", "createdAt");
CREATE INDEX "Reply_status_createdAt_idx" ON "Reply"("status", "createdAt");
CREATE INDEX "Reply_letterId_status_idx" ON "Reply"("letterId", "status");
CREATE INDEX "Reply_responderId_createdAt_idx" ON "Reply"("responderId", "createdAt");
CREATE UNIQUE INDEX "Match_letterId_responderId_key" ON "Match"("letterId", "responderId");
CREATE INDEX "Match_responderId_status_idx" ON "Match"("responderId", "status");
CREATE UNIQUE INDEX "Feedback_replyId_fromUserId_key" ON "Feedback"("replyId", "fromUserId");
CREATE INDEX "Feedback_reportReason_idx" ON "Feedback"("reportReason");
CREATE INDEX "ModerationEvent_targetType_targetId_createdAt_idx" ON "ModerationEvent"("targetType", "targetId", "createdAt");
CREATE INDEX "ModerationEvent_createdAt_idx" ON "ModerationEvent"("createdAt");
CREATE INDEX "SupportResource_active_language_region_idx" ON "SupportResource"("active", "language", "region");

ALTER TABLE "Letter" ADD CONSTRAINT "Letter_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
