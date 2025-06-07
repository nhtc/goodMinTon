-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "yardCost" REAL NOT NULL DEFAULT 0,
    "shuttleCockQuantity" INTEGER NOT NULL DEFAULT 0,
    "shuttleCockPrice" REAL NOT NULL DEFAULT 0,
    "otherFees" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "costPerMember" REAL NOT NULL DEFAULT 0,
    "costPerGame" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Game" ("costPerGame", "createdAt", "date", "id", "location", "updatedAt") SELECT "costPerGame", "createdAt", "date", "id", "location", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
