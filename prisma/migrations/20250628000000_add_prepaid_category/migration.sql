-- Add prePaidCategory field to game_participants table
ALTER TABLE "game_participants" ADD COLUMN "prePaidCategory" TEXT NOT NULL DEFAULT '';
