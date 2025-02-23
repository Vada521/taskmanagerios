/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DailyBonusLog` table. All the data in the column will be lost.
  - Added the required column `goldAmount` to the `DailyBonusLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xpAmount` to the `DailyBonusLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Habit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_userId_fkey";

-- DropIndex
DROP INDEX "Todo_archived_idx";

-- DropIndex
DROP INDEX "Todo_date_idx";

-- AlterTable
ALTER TABLE "DailyBonusLog" DROP COLUMN "createdAt",
ADD COLUMN     "goldAmount" INTEGER NOT NULL,
ADD COLUMN     "xpAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
