/*
  Warnings:

  - You are about to drop the column `goldAmount` on the `DailyBonusLog` table. All the data in the column will be lost.
  - You are about to drop the column `xpAmount` on the `DailyBonusLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyBonusLog" DROP COLUMN "goldAmount",
DROP COLUMN "xpAmount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
