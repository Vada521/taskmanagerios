-- CreateTable
CREATE TABLE "DailyBonusLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpAmount" INTEGER NOT NULL,
    "goldAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyBonusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyBonusLog_userId_idx" ON "DailyBonusLog"("userId");

-- CreateIndex
CREATE INDEX "DailyBonusLog_date_idx" ON "DailyBonusLog"("date");

-- AddForeignKey
ALTER TABLE "DailyBonusLog" ADD CONSTRAINT "DailyBonusLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
