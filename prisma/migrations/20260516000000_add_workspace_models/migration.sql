-- AlterTable: Add workspace fields to users
ALTER TABLE "users" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "checkinStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "lastCheckinDate" TEXT;

-- CreateTable: PointLedger
CREATE TABLE "point_ledgers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT,
    "relatedId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DailyCheckIn
CREATE TABLE "daily_check_ins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserTask
CREATE TABLE "user_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "category" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: point_ledgers
CREATE INDEX "point_ledgers_userId_idx" ON "point_ledgers"("userId");
CREATE INDEX "point_ledgers_type_idx" ON "point_ledgers"("type");
CREATE INDEX "point_ledgers_createdAt_idx" ON "point_ledgers"("createdAt");

-- CreateIndex: daily_check_ins
CREATE UNIQUE INDEX "daily_check_ins_userId_dateKey_key" ON "daily_check_ins"("userId", "dateKey");
CREATE INDEX "daily_check_ins_userId_idx" ON "daily_check_ins"("userId");
CREATE INDEX "daily_check_ins_dateKey_idx" ON "daily_check_ins"("dateKey");

-- CreateIndex: user_tasks
CREATE INDEX "user_tasks_userId_idx" ON "user_tasks"("userId");
CREATE INDEX "user_tasks_status_idx" ON "user_tasks"("status");
CREATE INDEX "user_tasks_dueDate_idx" ON "user_tasks"("dueDate");

-- AddForeignKey
ALTER TABLE "point_ledgers" ADD CONSTRAINT "point_ledgers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_check_ins" ADD CONSTRAINT "daily_check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
