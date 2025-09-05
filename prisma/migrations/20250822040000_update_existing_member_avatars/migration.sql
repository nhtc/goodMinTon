-- Add avatar column and update existing members with generated avatars
-- This migration will be run automatically during deployment

-- First, the column was already added in the previous migration
-- Now we need to update existing members with avatars

-- We'll use a simple approach: generate avatar URLs based on member names
-- Since we can't use TypeScript functions in SQL, we'll create a simple avatar URL pattern

-- Update all members that don't have avatars with DiceBear avatar URLs
UPDATE members 
SET avatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || encode(name::bytea, 'base64') || '&backgroundColor=6366f1&size=200'
WHERE avatar IS NULL OR avatar = '';
