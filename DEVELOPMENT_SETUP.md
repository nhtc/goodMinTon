# Development Environment Setup

## Overview
This project now supports separate local and production databases to ensure safe development practices. Your local changes will no longer affect the production database.

## Quick Setup (First Time)

### 1. Set up local PostgreSQL database
```bash
./setup-local-db.sh
```

### 2. Initialize local database schema
```bash
./setup-local-schema.sh
```

### 3. Start development
```bash
npm run dev
```

Your app will now run on `http://localhost:3000` using a completely separate local database.

## Environment Management

### Switch to Local Database (Default & Recommended)
```bash
./switch-env.sh local
```

### Switch to Production Database (⚠️ Use with extreme caution!)
```bash
./switch-env.sh production
```

## Database Commands

### Local Development (Safe)
```bash
# Create a new migration (only affects local database)
npx prisma migrate dev --name your_migration_name

# View local database in Prisma Studio
npx prisma studio

# Reset local database (safe to do anytime)
npx prisma migrate reset

# Seed local database with test data
npx prisma db seed
```

### Production Deployment (Automatic via Vercel)
```bash
# Migrations are applied automatically when you deploy to Vercel
git push
```

## File Structure
- `.env` - Current active environment (local by default)
- `.env.local` - Local development configuration template
- `.env.production` - Production configuration template
- `setup-local-db.sh` - Sets up local PostgreSQL database
- `setup-local-schema.sh` - Initializes local database schema
- `switch-env.sh` - Switches between environments

## Safety Features
✅ **Local database by default** - Your development won't affect production  
✅ **Confirmation prompts** - Warns you before switching to production  
✅ **Clear environment indicators** - Always know which database you're using  
✅ **Separate database URLs** - No accidental production modifications  

## Development Workflow

### Daily Development
1. Ensure you're using local environment: `./switch-env.sh local`
2. Start development: `npm run dev`
3. Make changes and test locally
4. When ready, commit and push to deploy to production

### Schema Changes
1. Make changes to `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name describe_your_change`
3. Test locally with your new schema
4. Commit and push - Vercel will apply migrations to production automatically

### Testing Production Issues
1. **Only when necessary**: `./switch-env.sh production`
2. Debug production issues (read-only operations recommended)
3. **Always switch back**: `./switch-env.sh local`

## Troubleshooting

### Local Database Issues
```bash
# Restart PostgreSQL
brew services restart postgresql@14

# Recreate local database
dropdb badminton_manager_dev
./setup-local-db.sh
./setup-local-schema.sh
```

### Migration Issues
```bash
# Reset local migrations (safe)
npx prisma migrate reset

# Check current migration status
npx prisma migrate status
```

### Environment Confusion
```bash
# Check which database you're currently using
./switch-env.sh

# Force switch to local (safe)
./switch-env.sh local
```

## Benefits of This Setup

🚀 **Faster Development** - No network latency to production database  
🔒 **Safe Experimentation** - Break things locally without affecting users  
🧪 **Realistic Testing** - Use real PostgreSQL locally (same as production)  
📊 **Clean Data** - Reset and seed fresh data anytime  
🚀 **Easy Deployment** - Push code and migrations deploy automatically  

Your production users will thank you for this setup! 🎉
