# Production Database Clearing Guide

## ⚠️ Important Safety Notice

**These scripts will delete data from your PRODUCTION database!**  
**Always backup important data before running these commands.**

## Available Scripts

### 1. Complete Database Reset (Recommended)
```bash
./clear-production-db.sh
```
**What it does:**
- Completely resets the production database
- Removes all data AND schema
- Reapplies fresh migrations
- Multiple confirmation steps for safety

**Use when:**
- You want to start completely fresh
- You have migration conflicts
- You want to clear both data and schema

### 2. Quick Data Clear (Keep Schema)
```bash
./quick-clear-prod.sh
```
**What it does:**
- Removes all data but keeps the database schema
- Faster than full reset
- Single confirmation step

**Use when:**
- You want to clear data but keep the same schema
- You want to quickly remove test data
- You don't have migration issues

### 3. Selective Cleanup
```bash
./selective-cleanup.sh
```
**What it does:**
- Interactive menu to choose what to clear
- Options to clear only games, only members, or everything
- Shows available tables for manual cleanup

**Use when:**
- You only want to clear specific data
- You want to see what tables exist
- You need custom cleanup operations

## Safety Features

All scripts include:
✅ **Multiple confirmations** - Prevents accidental deletion  
✅ **Environment switching** - Temporarily switches to production, then back to local  
✅ **Clear warnings** - Explains exactly what will be deleted  
✅ **Error handling** - Shows if operations succeed or fail  

## Manual Database Clearing

If you prefer to clear the database manually:

### Method 1: Using Prisma
```bash
# Switch to production environment
./switch-env.sh production

# Clear all data (keeps schema)
npx prisma db execute --stdin <<EOF
DELETE FROM game_participants;
DELETE FROM games;
DELETE FROM members;
EOF

# Or reset everything (removes schema too)
npx prisma migrate reset --force

# Switch back to local
./switch-env.sh local
```

### Method 2: Direct SQL
```bash
# Switch to production
./switch-env.sh production

# Connect and run SQL
npx prisma db execute --stdin <<EOF
TRUNCATE TABLE game_participants, games, members RESTART IDENTITY CASCADE;
EOF

# Switch back to local
./switch-env.sh local
```

## After Clearing the Database

Once you've cleared your production database:

1. **Deploy your app** - Vercel will automatically apply migrations
   ```bash
   git push
   ```

2. **Or manually apply migrations**:
   ```bash
   ./switch-env.sh production
   npx prisma migrate deploy
   ./switch-env.sh local
   ```

3. **Create fresh production data** as needed through your application

## Verification

To verify the database was cleared:

```bash
# Switch to production temporarily
./switch-env.sh production

# Check if tables are empty
npx prisma db execute --stdin <<EOF
SELECT 
  (SELECT COUNT(*) FROM members) as members_count,
  (SELECT COUNT(*) FROM games) as games_count,
  (SELECT COUNT(*) FROM game_participants) as participants_count;
EOF

# Switch back to local
./switch-env.sh local
```

## Best Practices

1. **Always backup** important data before clearing
2. **Use local environment** for testing these scripts first
3. **Verify the environment** before running clearing commands
4. **Switch back to local** immediately after clearing production
5. **Test your application** after clearing to ensure everything works

## Emergency Recovery

If you accidentally clear data and need to recover:

1. **Check your database provider's backup options** (Neon, Vercel Postgres, etc.)
2. **Restore from a recent backup** if available
3. **Re-import data** from any exports you might have
4. **Contact your database provider** for assistance with data recovery
