/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `DailyBonusLog` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DailyBonusLog_date_idx";

-- DropIndex
DROP INDEX "DailyBonusLog_userId_idx";

-- AlterTable
ALTER TABLE "DailyBonusLog" ALTER COLUMN "date" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "DailyBonusLog_userId_date_key" ON "DailyBonusLog"("userId", "date");
