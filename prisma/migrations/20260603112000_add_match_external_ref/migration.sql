ALTER TABLE "matches" ADD COLUMN "externalRef" TEXT;

CREATE UNIQUE INDEX "matches_externalRef_key" ON "matches"("externalRef");
