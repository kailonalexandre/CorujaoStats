ALTER TABLE "matches" ADD COLUMN "groupId" TEXT;
ALTER TABLE "raffle_history" ADD COLUMN "groupId" TEXT;

INSERT INTO "groups" ("id", "name", "createdAt", "updatedAt")
VALUES ('default-group', 'Grupo Principal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "matches"
SET "groupId" = 'default-group'
WHERE "groupId" IS NULL;

UPDATE "raffle_history"
SET "groupId" = 'default-group'
WHERE "groupId" IS NULL;

CREATE INDEX "matches_groupId_idx" ON "matches"("groupId");
CREATE INDEX "raffle_history_groupId_idx" ON "raffle_history"("groupId");

ALTER TABLE "matches" ADD CONSTRAINT "matches_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "raffle_history" ADD CONSTRAINT "raffle_history_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
