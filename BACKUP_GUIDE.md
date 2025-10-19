# Database Backup & Restore Guide

This guide explains how to backup and restore your GoodMinTon database to/from CSV files.

## 📋 Table of Contents

- [Why Backup?](#why-backup)
- [Quick Start](#quick-start)
- [Backup Database](#backup-database)
- [Restore Database](#restore-database)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Why Backup?

Creating regular backups protects your data:
- **Before deployments** - Safeguard data before deploying new features
- **Before migrations** - Protect against schema changes
- **Regular snapshots** - Create restore points for disaster recovery
- **Data portability** - CSV format is universal and easy to inspect

## 🚀 Quick Start

### Create a Backup

```bash
npm run db:backup
```

This creates a timestamped backup in the `backups/` directory with all your data exported to CSV files.

### Restore from Backup

```bash
npm run db:restore -- ./backups/2025-10-17_15-30-00
```

Replace the timestamp with your actual backup folder name.

### List Available Backups

```bash
npm run db:list-backups
```

## 📦 Backup Database

### Command

```bash
npm run db:backup
```

### What It Does

1. Creates a new timestamped directory in `backups/`
2. Exports all tables to CSV files:
   - `members.csv`
   - `games.csv`
   - `game_participants.csv`
   - `personal_events.csv`
   - `personal_event_participants.csv`
3. Creates a `backup_summary.json` with metadata

### Example Output

```
🚀 Starting database backup...

📁 Backup directory: /path/to/backups/2025-10-17_15-30-00

📦 Backing up Members...
✅ Exported 25 members

📦 Backing up Games...
✅ Exported 150 games

📦 Backing up Game Participants...
✅ Exported 1200 game participants

📦 Backing up Personal Events...
✅ Exported 10 personal events

📦 Backing up Personal Event Participants...
✅ Exported 80 personal event participants

==================================================
✨ Backup completed successfully!
==================================================

📊 Summary:
   Members: 25
   Games: 150
   Game Participants: 1200
   Personal Events: 10
   Personal Event Participants: 80
   Total Records: 1465

📁 Location: /path/to/backups/2025-10-17_15-30-00
```

## 🔄 Restore Database

### Command

```bash
npm run db:restore -- ./backups/[TIMESTAMP]
```

### Example

```bash
npm run db:restore -- ./backups/2025-10-17_15-30-00
```

### ⚠️ WARNING

**Restoring will DELETE all current data and replace it with the backup!**

Make sure you have a backup of your current data before restoring.

### What It Does

1. Validates the backup directory exists
2. Shows backup summary
3. Deletes all existing data (in correct order to respect foreign keys)
4. Imports data from CSV files
5. Preserves all IDs and relationships

### Example Output

```
🔄 Starting database restore...

📁 Restoring from: /path/to/backups/2025-10-17_15-30-00

📊 Backup Summary:
   Created: 10/17/2025, 3:30:00 PM
   Total Records: 1465

⚠️  WARNING: This will DELETE all existing data and replace it with backup data!
   Make sure you have a backup of current data if needed.

🗑️  Deleting existing data...
   ✅ Personal Event Participants deleted
   ✅ Personal Events deleted
   ✅ Game Participants deleted
   ✅ Games deleted
   ✅ Members deleted

📥 Restoring Members...
   ✅ Restored 25 members

📥 Restoring Games...
   ✅ Restored 150 games

📥 Restoring Game Participants...
   ✅ Restored 1200 game participants

📥 Restoring Personal Events...
   ✅ Restored 10 personal events

📥 Restoring Personal Event Participants...
   ✅ Restored 80 personal event participants

==================================================
✨ Database restored successfully!
==================================================
```

## 🎯 Best Practices

### When to Backup

1. **Before Deployments**
   ```bash
   # Create backup before deploying
   npm run db:backup
   git add .
   git commit -m "Deploy new feature"
   git push
   ```

2. **Before Schema Changes**
   ```bash
   # Backup before running migrations
   npm run db:backup
   npx prisma migrate dev
   ```

3. **Regular Snapshots**
   - Daily backups for active development
   - Weekly backups for production
   - Before major changes

### Backup Storage

1. **Local Backups**
   - Keep in `backups/` directory (gitignored)
   - Won't be committed to repository

2. **Remote Backups** (Recommended)
   ```bash
   # Copy to cloud storage
   cp -r backups/2025-10-17_15-30-00 ~/Dropbox/goodminton-backups/
   
   # Or use cloud CLI
   aws s3 sync backups/ s3://my-bucket/goodminton-backups/
   ```

3. **Backup Rotation**
   ```bash
   # Keep only last 7 backups
   cd backups
   ls -t | tail -n +8 | xargs rm -rf
   ```

### Testing Restores

Periodically test your backups:

```bash
# 1. Create a test backup
npm run db:backup

# 2. Make some changes
# ... do something ...

# 3. Restore from backup
npm run db:restore -- ./backups/[LATEST]

# 4. Verify data is correct
```

## 🔧 Troubleshooting

### "Backup directory not found"

Make sure the backup path is correct:

```bash
# List available backups
npm run db:list-backups

# Use exact folder name
npm run db:restore -- ./backups/2025-10-17_15-30-00
```

### "Foreign key constraint failed"

The restore script handles foreign keys automatically. If you see this error:

1. Make sure you're using the restore script (not manual imports)
2. Check that all CSV files are present in the backup directory
3. Verify the backup wasn't corrupted

### "Permission denied"

```bash
# Make sure scripts are accessible
chmod +x scripts/*.ts

# Or run with explicit ts-node
npx ts-node ./scripts/backup-to-csv.ts
```

### CSV Files Are Too Large

For very large databases, consider:

1. **Compression**
   ```bash
   cd backups
   tar -czf backup-2025-10-17.tar.gz 2025-10-17_15-30-00/
   ```

2. **Split Backups**
   - Backup only changed data
   - Use database-specific backup tools for very large datasets

### Restore Takes Too Long

For large datasets:

1. **Batch Operations** - The script already uses individual inserts for data integrity
2. **Database Optimization** - Temporarily disable indexes (advanced)
3. **Use Native DB Tools** - For millions of records, consider `pg_dump`/`pg_restore`

## 📝 Advanced Usage

### Selective Restore

If you only need to restore specific tables, you can modify the restore script or manually import CSVs.

### Automated Backups

Add to your deployment pipeline:

```bash
# In your CI/CD pipeline
- name: Backup Database
  run: npm run db:backup
  
- name: Deploy
  run: npm run build && vercel deploy
```

### Backup Verification

Check backup integrity:

```bash
# View backup summary
cat backups/2025-10-17_15-30-00/backup_summary.json

# Count lines in CSV (subtract 1 for header)
wc -l backups/2025-10-17_15-30-00/*.csv
```

## 🆘 Emergency Recovery

If something goes wrong during deployment:

1. **Stop the application**
   ```bash
   # Stop development server
   # Or rollback deployment
   ```

2. **Find last good backup**
   ```bash
   npm run db:list-backups
   ```

3. **Restore immediately**
   ```bash
   npm run db:restore -- ./backups/[LAST_GOOD_BACKUP]
   ```

4. **Verify data**
   - Check member count
   - Verify recent games
   - Test application functionality

## 📞 Support

For issues or questions:
- Check Prisma documentation: https://www.prisma.io/docs
- Review error messages in console
- Verify database connection in `.env`

---

**Remember:** Always backup before making changes! 🔒
