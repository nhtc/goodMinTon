# Database Backups

This directory contains CSV backups of your database. Each backup is timestamped and contains:

- `members.csv` - All member records
- `games.csv` - All game records
- `game_participants.csv` - All game participant records
- `personal_events.csv` - All personal event records
- `personal_event_participants.csv` - All personal event participant records
- `backup_summary.json` - Summary of the backup including record counts

## Note

Backup files are automatically ignored by git to prevent committing sensitive data.
Keep your backups in a secure location and consider backing them up to cloud storage.
