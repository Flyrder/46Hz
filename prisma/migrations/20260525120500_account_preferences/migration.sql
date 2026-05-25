ALTER TABLE "User"
ADD COLUMN "displayName" TEXT,
ADD COLUMN "accountEmail" TEXT,
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "themePreference" TEXT NOT NULL DEFAULT 'system';

CREATE UNIQUE INDEX "User_accountEmail_key" ON "User"("accountEmail");
