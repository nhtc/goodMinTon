# Fixed Migration Files for Production Deployment

## What Was Fixed

The original migration files were causing failures in production because they were trying to create tables, indexes, and constraints that might already exist. This is a common issue when applying migrations to an existing database.

## Changes Made

### 1. Init Migration (`20250627060446_init/migration.sql`)

**Before (causing errors):**
```sql
CREATE TABLE "members" (...)
CREATE INDEX "members_name_key" ON "members"("name");
ALTER TABLE "game_participants" ADD CONSTRAINT ...
```

**After (safe for existing databases):**
```sql
CREATE TABLE IF NOT EXISTS "members" (...)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'members_name_key') THEN
        CREATE UNIQUE INDEX "members_name_key" ON "members"("name");
    END IF;
END $$;
```

### 2. Add prePaidCategory Migration (`20250628000000_add_prepaid_category/migration.sql`)

**Before (causing errors):**
```sql
ALTER TABLE "game_participants" ADD COLUMN "prePaidCategory" TEXT NOT NULL DEFAULT '';
```

**After (safe for existing columns):**
```sql
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_participants' AND column_name = 'prePaidCategory') THEN
        ALTER TABLE "game_participants" ADD COLUMN "prePaidCategory" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;
```

## How These Fixes Work

### 1. `CREATE TABLE IF NOT EXISTS`
- Only creates the table if it doesn't already exist
- Safe to run multiple times
- Won't fail if table already exists

### 2. `DO $$ BEGIN ... END $$;` Blocks
PostgreSQL anonymous code blocks that:
- Check if indexes/constraints/columns exist before creating them
- Use system catalogs (`pg_indexes`, `pg_constraint`, `information_schema.columns`)
- Only execute the creation if the object doesn't exist

### 3. Existence Checks
- **Tables**: `CREATE TABLE IF NOT EXISTS`
- **Indexes**: Check `pg_indexes` system catalog
- **Constraints**: Check `pg_constraint` system catalog  
- **Columns**: Check `information_schema.columns`

## Testing the Fixes

Run the test script to verify migrations work:
```bash
./test-migrations.sh
```

This script will:
1. Switch to production environment
2. Test both migration files
3. Verify the database schema
4. Switch back to local environment
5. Report success/failure

## Benefits of These Fixes

✅ **Idempotent** - Safe to run multiple times  
✅ **Non-destructive** - Won't overwrite existing data  
✅ **Production-safe** - Works with existing databases  
✅ **Vercel-compatible** - Will work in automatic deployments  

## Deployment Process

After these fixes:

1. **Commit the changes:**
   ```bash
   git add prisma/migrations/
   git commit -m "Fix migrations to handle existing database objects"
   ```

2. **Push to deploy:**
   ```bash
   git push
   ```

3. **Vercel will automatically:**
   - Apply migrations during build
   - Create missing tables/columns
   - Skip existing objects
   - Complete deployment successfully

## If You Still Have Issues

If migrations continue to fail:

1. **Clear production database** (if acceptable):
   ```bash
   ./clear-production-db.sh
   ```

2. **Or manually mark migrations as applied:**
   ```bash
   ./switch-env.sh production
   npx prisma migrate resolve --applied 20250627060446_init
   npx prisma migrate resolve --applied 20250628000000_add_prepaid_category
   ./switch-env.sh local
   ```

3. **Then deploy normally:**
   ```bash
   git push
   ```

The fixed migrations should now work reliably in all environments!
