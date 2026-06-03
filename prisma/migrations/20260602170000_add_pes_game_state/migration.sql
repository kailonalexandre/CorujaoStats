-- CreateEnum
CREATE TYPE "PesMatchStage" AS ENUM ('group', 'final', 'repechage');

-- CreateTable
CREATE TABLE "pes_game_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'PES',
    "gameId" TEXT NOT NULL,
    "groupId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "useRepechage" BOOLEAN NOT NULL DEFAULT false,
    "matchIdCounter" INTEGER NOT NULL DEFAULT 1,
    "championPlayerId" TEXT,
    "repechageChampionPlayerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pes_game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pes_game_groups" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stateGroupId" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "groupIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pes_game_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pes_game_participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamItemId" TEXT,
    "groupLetter" TEXT NOT NULL,
    "groupIndex" INTEGER NOT NULL,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pes_game_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pes_game_matches" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stage" "PesMatchStage" NOT NULL,
    "round" INTEGER NOT NULL,
    "stateGroupId" TEXT,
    "groupLetter" TEXT,
    "groupIndex" INTEGER,
    "matchIndex" INTEGER NOT NULL,
    "player1Id" TEXT,
    "player2Id" TEXT,
    "player1Name" TEXT NOT NULL,
    "player2Name" TEXT NOT NULL,
    "goals1" INTEGER,
    "goals2" INTEGER,
    "pen1" INTEGER,
    "pen2" INTEGER,
    "winnerPlayerId" TEXT,
    "draw" BOOLEAN NOT NULL DEFAULT false,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pes_game_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pes_game_standings" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "groupLetter" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "repechageEligible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pes_game_standings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pes_game_sessions_gameId_active_idx" ON "pes_game_sessions"("gameId", "active");
CREATE INDEX "pes_game_sessions_groupId_active_idx" ON "pes_game_sessions"("groupId", "active");
CREATE UNIQUE INDEX "pes_game_groups_sessionId_stateGroupId_key" ON "pes_game_groups"("sessionId", "stateGroupId");
CREATE UNIQUE INDEX "pes_game_groups_sessionId_letter_key" ON "pes_game_groups"("sessionId", "letter");
CREATE INDEX "pes_game_groups_sessionId_groupIndex_idx" ON "pes_game_groups"("sessionId", "groupIndex");
CREATE UNIQUE INDEX "pes_game_participants_sessionId_playerId_key" ON "pes_game_participants"("sessionId", "playerId");
CREATE INDEX "pes_game_participants_sessionId_groupLetter_idx" ON "pes_game_participants"("sessionId", "groupLetter");
CREATE INDEX "pes_game_participants_playerId_idx" ON "pes_game_participants"("playerId");
CREATE INDEX "pes_game_participants_teamItemId_idx" ON "pes_game_participants"("teamItemId");
CREATE INDEX "pes_game_matches_sessionId_stage_round_matchIndex_idx" ON "pes_game_matches"("sessionId", "stage", "round", "matchIndex");
CREATE INDEX "pes_game_matches_player1Id_idx" ON "pes_game_matches"("player1Id");
CREATE INDEX "pes_game_matches_player2Id_idx" ON "pes_game_matches"("player2Id");
CREATE INDEX "pes_game_matches_winnerPlayerId_idx" ON "pes_game_matches"("winnerPlayerId");
CREATE UNIQUE INDEX "pes_game_standings_sessionId_playerId_key" ON "pes_game_standings"("sessionId", "playerId");
CREATE INDEX "pes_game_standings_sessionId_groupLetter_position_idx" ON "pes_game_standings"("sessionId", "groupLetter", "position");
CREATE INDEX "pes_game_standings_playerId_idx" ON "pes_game_standings"("playerId");

-- AddForeignKey
ALTER TABLE "pes_game_sessions" ADD CONSTRAINT "pes_game_sessions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pes_game_sessions" ADD CONSTRAINT "pes_game_sessions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pes_game_sessions" ADD CONSTRAINT "pes_game_sessions_championPlayerId_fkey" FOREIGN KEY ("championPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pes_game_sessions" ADD CONSTRAINT "pes_game_sessions_repechageChampionPlayerId_fkey" FOREIGN KEY ("repechageChampionPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pes_game_groups" ADD CONSTRAINT "pes_game_groups_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pes_game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pes_game_participants" ADD CONSTRAINT "pes_game_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pes_game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pes_game_participants" ADD CONSTRAINT "pes_game_participants_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pes_game_participants" ADD CONSTRAINT "pes_game_participants_teamItemId_fkey" FOREIGN KEY ("teamItemId") REFERENCES "game_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pes_game_matches" ADD CONSTRAINT "pes_game_matches_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pes_game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pes_game_matches" ADD CONSTRAINT "pes_game_matches_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pes_game_matches" ADD CONSTRAINT "pes_game_matches_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pes_game_matches" ADD CONSTRAINT "pes_game_matches_winnerPlayerId_fkey" FOREIGN KEY ("winnerPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pes_game_standings" ADD CONSTRAINT "pes_game_standings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "pes_game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pes_game_standings" ADD CONSTRAINT "pes_game_standings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
