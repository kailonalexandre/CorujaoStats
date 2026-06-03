-- CreateTable
CREATE TABLE `groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `players` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `photoUrl` VARCHAR(191) NULL,
    `coverUrl` VARCHAR(191) NULL,
    `groupId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `players_groupId_idx`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `games` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `games_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `game_items` (
    `id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('team', 'character', 'map', 'class', 'weapon', 'other') NOT NULL,
    `groupName` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `game_items_gameId_type_active_idx`(`gameId`, `type`, `active`),
    INDEX `game_items_gameId_type_groupName_active_idx`(`gameId`, `type`, `groupName`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `externalRef` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `matches_externalRef_key`(`externalRef`),
    INDEX `matches_groupId_idx`(`groupId`),
    INDEX `matches_gameId_date_idx`(`gameId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_players` (
    `id` VARCHAR(191) NOT NULL,
    `matchId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `selectedItemId` VARCHAR(191) NULL,
    `teamName` VARCHAR(191) NULL,
    `result` ENUM('win', 'loss', 'draw') NULL,
    `score` INTEGER NULL,
    `kills` INTEGER NULL,
    `deaths` INTEGER NULL,
    `assists` INTEGER NULL,
    `goals` INTEGER NULL,
    `goalsAgainst` INTEGER NULL,
    `knifeKills` INTEGER NULL,
    `headshots` INTEGER NULL,
    `damage` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `match_players_matchId_idx`(`matchId`),
    INDEX `match_players_playerId_idx`(`playerId`),
    INDEX `match_players_selectedItemId_idx`(`selectedItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raffle_history` (
    `id` VARCHAR(191) NOT NULL,
    `drawId` VARCHAR(191) NULL,
    `groupId` VARCHAR(191) NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NULL,
    `itemId` VARCHAR(191) NULL,
    `groupName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `raffle_history_drawId_idx`(`drawId`),
    INDEX `raffle_history_groupId_idx`(`groupId`),
    INDEX `raffle_history_gameId_createdAt_idx`(`gameId`, `createdAt`),
    INDEX `raffle_history_playerId_idx`(`playerId`),
    INDEX `raffle_history_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pes_game_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'PES',
    `gameId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `useRepechage` BOOLEAN NOT NULL DEFAULT false,
    `matchIdCounter` INTEGER NOT NULL DEFAULT 1,
    `championPlayerId` VARCHAR(191) NULL,
    `repechageChampionPlayerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pes_game_sessions_gameId_active_idx`(`gameId`, `active`),
    INDEX `pes_game_sessions_groupId_active_idx`(`groupId`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pes_game_groups` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `stateGroupId` VARCHAR(191) NOT NULL,
    `letter` VARCHAR(191) NOT NULL,
    `groupIndex` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pes_game_groups_sessionId_groupIndex_idx`(`sessionId`, `groupIndex`),
    UNIQUE INDEX `pes_game_groups_sessionId_stateGroupId_key`(`sessionId`, `stateGroupId`),
    UNIQUE INDEX `pes_game_groups_sessionId_letter_key`(`sessionId`, `letter`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pes_game_participants` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `teamItemId` VARCHAR(191) NULL,
    `groupLetter` VARCHAR(191) NOT NULL,
    `groupIndex` INTEGER NOT NULL,
    `position` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pes_game_participants_sessionId_groupLetter_idx`(`sessionId`, `groupLetter`),
    INDEX `pes_game_participants_playerId_idx`(`playerId`),
    INDEX `pes_game_participants_teamItemId_idx`(`teamItemId`),
    UNIQUE INDEX `pes_game_participants_sessionId_playerId_key`(`sessionId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pes_game_matches` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `stage` ENUM('group', 'final', 'repechage') NOT NULL,
    `round` INTEGER NOT NULL,
    `stateGroupId` VARCHAR(191) NULL,
    `groupLetter` VARCHAR(191) NULL,
    `groupIndex` INTEGER NULL,
    `matchIndex` INTEGER NOT NULL,
    `player1Id` VARCHAR(191) NULL,
    `player2Id` VARCHAR(191) NULL,
    `player1Name` VARCHAR(191) NOT NULL,
    `player2Name` VARCHAR(191) NOT NULL,
    `goals1` INTEGER NULL,
    `goals2` INTEGER NULL,
    `pen1` INTEGER NULL,
    `pen2` INTEGER NULL,
    `winnerPlayerId` VARCHAR(191) NULL,
    `draw` BOOLEAN NOT NULL DEFAULT false,
    `isFinished` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pes_game_matches_sessionId_stage_round_matchIndex_idx`(`sessionId`, `stage`, `round`, `matchIndex`),
    INDEX `pes_game_matches_player1Id_idx`(`player1Id`),
    INDEX `pes_game_matches_player2Id_idx`(`player2Id`),
    INDEX `pes_game_matches_winnerPlayerId_idx`(`winnerPlayerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pes_game_standings` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `groupLetter` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `wins` INTEGER NOT NULL DEFAULT 0,
    `draws` INTEGER NOT NULL DEFAULT 0,
    `losses` INTEGER NOT NULL DEFAULT 0,
    `goalsFor` INTEGER NOT NULL DEFAULT 0,
    `goalsAgainst` INTEGER NOT NULL DEFAULT 0,
    `goalDifference` INTEGER NOT NULL DEFAULT 0,
    `qualified` BOOLEAN NOT NULL DEFAULT false,
    `repechageEligible` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `pes_game_standings_sessionId_groupLetter_position_idx`(`sessionId`, `groupLetter`, `position`),
    INDEX `pes_game_standings_playerId_idx`(`playerId`),
    UNIQUE INDEX `pes_game_standings_sessionId_playerId_key`(`sessionId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `players` ADD CONSTRAINT `players_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `game_items` ADD CONSTRAINT `game_items_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_players` ADD CONSTRAINT `match_players_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_players` ADD CONSTRAINT `match_players_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_players` ADD CONSTRAINT `match_players_selectedItemId_fkey` FOREIGN KEY (`selectedItemId`) REFERENCES `game_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raffle_history` ADD CONSTRAINT `raffle_history_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raffle_history` ADD CONSTRAINT `raffle_history_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raffle_history` ADD CONSTRAINT `raffle_history_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raffle_history` ADD CONSTRAINT `raffle_history_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `game_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_sessions` ADD CONSTRAINT `pes_game_sessions_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_sessions` ADD CONSTRAINT `pes_game_sessions_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_sessions` ADD CONSTRAINT `pes_game_sessions_championPlayerId_fkey` FOREIGN KEY (`championPlayerId`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_sessions` ADD CONSTRAINT `pes_game_sessions_repechageChampionPlayerId_fkey` FOREIGN KEY (`repechageChampionPlayerId`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_groups` ADD CONSTRAINT `pes_game_groups_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `pes_game_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_participants` ADD CONSTRAINT `pes_game_participants_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `pes_game_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_participants` ADD CONSTRAINT `pes_game_participants_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_participants` ADD CONSTRAINT `pes_game_participants_teamItemId_fkey` FOREIGN KEY (`teamItemId`) REFERENCES `game_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_matches` ADD CONSTRAINT `pes_game_matches_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `pes_game_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_matches` ADD CONSTRAINT `pes_game_matches_player1Id_fkey` FOREIGN KEY (`player1Id`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_matches` ADD CONSTRAINT `pes_game_matches_player2Id_fkey` FOREIGN KEY (`player2Id`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_matches` ADD CONSTRAINT `pes_game_matches_winnerPlayerId_fkey` FOREIGN KEY (`winnerPlayerId`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_standings` ADD CONSTRAINT `pes_game_standings_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `pes_game_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pes_game_standings` ADD CONSTRAINT `pes_game_standings_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
