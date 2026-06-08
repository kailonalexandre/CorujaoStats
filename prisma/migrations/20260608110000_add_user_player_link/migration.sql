-- AlterTable
ALTER TABLE `users` ADD COLUMN `playerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_playerId_key` ON `users`(`playerId`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
