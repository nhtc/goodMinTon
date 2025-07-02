# Vercel Deployment and Database Migration Guide

This guide will help you deploy your Badminton Manager application to Vercel and update your production database schema with the latest changes.

## Deploying Code Changes to Vercel

1. Make sure all your code changes are committed to your Git repository:
   ```bash
   git add .
   git commit -m "Add prePaidCategory field and UI improvements"
   git push
   ```

2. If your repository is connected to Vercel, your changes will automatically deploy.
   - If not, log in to Vercel and manually deploy your project.

## Updating Your Production Database Schema

When you've made changes to your Prisma schema (like adding the `prePaidCategory` field), you need to apply these changes to your production database.

### Option 1: Using the Deployment Script (Recommended)

1. Get your Vercel production database URL from your Vercel project settings under "Environment Variables".

2. Run the deployment script with your production DATABASE_URL:
   ```bash
   export DATABASE_URL="your_production_database_url"
   ./deploy-migrations.sh
   ```

### Option 2: Manual Migration

1. Set your production database URL:
   ```bash
   export DATABASE_URL="your_production_database_url"
   ```

2. Apply the migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Generate the updated Prisma client:
   ```bash
   npx prisma generate
   ```

## Verifying Your Deployment

After deploying your code and updating your database schema:

1. Visit your production site and check if the new features are working correctly:
   - Make sure the homepage UI improvements are visible
   - Test the payment flow with the new prePaid functionality
   - Verify that the prePaidCategory field is working correctly

2. If you encounter any issues, check your Vercel logs for errors.

## Troubleshooting

If you face any issues with the database migration:

1. Check if the `prePaidCategory` column was actually added to your production database:
   ```bash
   export DATABASE_URL="your_production_database_url"
   npx prisma db pull
   ```

2. If the column is missing, you can manually add it through a SQL query:
   ```bash
   export DATABASE_URL="your_production_database_url"
   npx prisma db execute --file=./prisma/migrations/20250628000000_add_prepaid_category/migration.sql
   ```

3. Make sure your Prisma client is up to date:
   ```bash
   npx prisma generate
   ```

## Best Practices for Future Schema Changes

1. Always use `prisma migrate dev` to create proper migration files
2. Test migrations locally before deploying to production
3. Keep your migration history consistent by avoiding manual schema modifications
4. Back up your production database before applying migrations
