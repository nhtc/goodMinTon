-- Add prePaidCategory field to game_participants table (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_participants' AND column_name = 'prePaidCategory') THEN
        ALTER TABLE "game_participants" ADD COLUMN "prePaidCategory" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;
