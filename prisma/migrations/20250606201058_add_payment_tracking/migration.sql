-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "hasPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    CONSTRAINT "GameParticipant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameParticipant_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameParticipant" ("gameId", "id", "memberId") SELECT "gameId", "id", "memberId" FROM "GameParticipant";
DROP TABLE "GameParticipant";
ALTER TABLE "new_GameParticipant" RENAME TO "GameParticipant";
CREATE UNIQUE INDEX "GameParticipant_gameId_memberId_key" ON "GameParticipant"("gameId", "memberId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
