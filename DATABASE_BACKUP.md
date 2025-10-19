# Database Backup System - Quick Reference

## ✅ Backup System Installed

Your GoodMinTon application now has a comprehensive database backup and restore system.

## 🚀 Quick Commands

### Create a Backup
```bash
npm run db:backup
```

### List Backups
```bash
npm run db:list-backups
```

### Restore from Backup
```bash
npm run db:restore -- ./backups/[TIMESTAMP]
```

## 📖 Full Documentation

For complete instructions, best practices, and troubleshooting, see **[BACKUP_GUIDE.md](./BACKUP_GUIDE.md)**

## 🎯 Before Deployment Checklist

1. **Create a backup**
   ```bash
   npm run db:backup
   ```

2. **Verify backup created**
   ```bash
   npm run db:list-backups
   ```

3. **Deploy with confidence**
   ```bash
   git push
   vercel deploy
   ```

## 📁 What Gets Backed Up

All database tables are exported to CSV files:
- ✅ Members (with avatars and status)
- ✅ Games (with all cost calculations)
- ✅ Game Participants (with payment status)
- ✅ Personal Events (custom events)
- ✅ Personal Event Participants (with custom amounts)

## 🔒 Security

- Backups are stored in `backups/` directory
- Automatically ignored by git (sensitive data protection)
- Keep backups in secure cloud storage
- Test restores periodically

## ⚡ Key Features

- **Timestamped Backups** - Never overwrite previous backups
- **CSV Format** - Universal, human-readable, and easy to inspect
- **Preserves IDs** - Maintains all relationships and references
- **Complete Summary** - JSON summary with record counts
- **Safe Restore** - Handles foreign keys automatically

## 🆘 Emergency Recovery

If deployment goes wrong:

```bash
# 1. Find your last backup
npm run db:list-backups

# 2. Restore immediately
npm run db:restore -- ./backups/[LAST_GOOD_BACKUP]

# 3. Verify data integrity
# Check your application
```

---

**Created:** October 17, 2025  
**Status:** ✅ Ready to use  
**Documentation:** [BACKUP_GUIDE.md](./BACKUP_GUIDE.md)
