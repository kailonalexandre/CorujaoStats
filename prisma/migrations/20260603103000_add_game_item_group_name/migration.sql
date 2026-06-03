ALTER TABLE "game_items" ADD COLUMN "groupName" TEXT;

CREATE INDEX "game_items_gameId_type_groupName_active_idx" ON "game_items"("gameId", "type", "groupName", "active");
