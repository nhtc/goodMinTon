/*
  Warnings:

  - You are about to drop the `_GameMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `maxPlayers` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerPlayer` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Member` table. All the data in the column will be lost.
  - Added the required column `costPerGame` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_GameMembers_B_index";

-- DropIndex
DROP INDEX "_GameMembers_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_GameMembers";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GameParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "GameParticipant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameParticipant_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "costPerGame" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Game" ("createdAt", "date", "id", "location", "updatedAt") SELECT "createdAt", "date", "id", "location", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Member" ("createdAt", "id", "name", "phone", "updatedAt") SELECT "createdAt", "id", "name", "phone", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "GameParticipant_gameId_memberId_key" ON "GameParticipant"("gameId", "memberId");
