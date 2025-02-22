/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DailyBonusLog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "DailyBonusLog_userId_date_key";

-- AlterTable
ALTER TABLE "DailyBonusLog" DROP COLUMN "createdAt";

-- CreateIndex
CREATE INDEX "DailyBonusLog_userId_idx" ON "DailyBonusLog"("userId");

-- CreateIndex
CREATE INDEX "DailyBonusLog_date_idx" ON "DailyBonusLog"("date");
