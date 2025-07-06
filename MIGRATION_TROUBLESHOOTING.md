# Troubleshooting Prisma Migrations

This guide helps resolve common issues with Prisma migrations, particularly when the migration is marked as applied but the actual database changes aren't reflected.

## The Problem: Migration Marked as Applied but Column Not Added

You're experiencing an issue where:
1. The `_prisma_migrations` table was successfully created
2. The migration `20250628000000_add_prepaid_category` is marked as applied
3. But the `prePaidCategory` column wasn't actually added to the `game_participants` table

## Why This Happens

When you run `prisma migrate resolve --applied`, it only:
- Creates the migration history table (`_prisma_migrations`)
- Adds entries to mark specific migrations as "applied"
- **DOES NOT** actually execute the SQL in those migration files

This creates a mismatch between what Prisma thinks has been applied and what's actually in your database schema.

## Solution: Manually Execute the Migration SQL

I've created a script (`apply-migration.sh`) that will:
1. Execute the SQL from your migration file directly against your database
2. Verify that the column was successfully added

### Using the Script

1. Set your production database URL:
   ```bash
   export DATABASE_URL="your_production_database_url"
   ```

2. Run the script:
   ```bash
   ./apply-migration.sh
   ```

3. Follow the prompts to apply the migration.

## Alternative: Manual Steps

If you prefer to do this manually:

1. Set your database URL:
   ```bash
   export DATABASE_URL="your_production_database_url"
   ```

2. Execute the migration SQL directly:
   ```bash
   npx prisma db execute --file=./prisma/migrations/20250628000000_add_prepaid_category/migration.sql
   ```

3. Verify the column was added:
   ```bash
   npx prisma db execute --stdin <<EOF
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name='game_participants' AND column_name='prePaidCategory';
   EOF
   ```

## Prevention for Future Migrations

To avoid this issue in the future:

1. When creating the migration history, use `prisma migrate resolve --applied` AND manually execute the SQL file
2. For new migrations, use `prisma migrate deploy` instead of resolving manually
3. Always verify database changes after running migrations

## Reset and Start Fresh (If Needed)

If you're having persistent issues, you can reset the migration state and start fresh:

1. Delete the entry from the _prisma_migrations table:
   ```sql
   DELETE FROM _prisma_migrations WHERE migration_name = '20250628000000_add_prepaid_category';
   ```

2. Apply the migration properly:
   ```bash
   npx prisma migrate deploy
   ```

This approach ensures that both the migration history and the actual database schema are in sync.
