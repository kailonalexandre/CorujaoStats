-- AlterTable
ALTER TABLE "raffle_history" ADD COLUMN "drawId" TEXT;

-- CreateIndex
CREATE INDEX "raffle_history_drawId_idx" ON "raffle_history"("drawId");
