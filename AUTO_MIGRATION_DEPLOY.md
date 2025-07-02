# Deploying with Automatic Prisma Migrations

This guide will help you push your changes to Vercel and ensure the migration runs automatically during the build process.

## Prerequisites

Before pushing your code, make sure you've fixed your database migration history by running the migration fix script. If you haven't done this yet:

```bash
# Uncomment and use your production DATABASE_URL
# export DATABASE_URL="postgres://3b2de1267c3b4b0c5e7a0a3055363e8e92854f1a85a3e3fb8ab247a40c577c2b:sk_tfxkyoxfBMMDhFkcPyLiR@db.prisma.io:5432/?sslmode=require"
./migrate-data.sh
```

This script creates the Prisma migration history table in your database and marks your existing migrations as applied.

## Step 1: Update Your Build Configuration

I've already updated these files for you:

1. **vercel.json** - Now includes the `prisma migrate deploy` command in the build process
2. **package.json** - The `vercel-build` script now includes the migration step

## Step 2: Commit and Push Your Changes

```bash
# Add all changed files
git add .

# Commit your changes
git commit -m "Enable automatic Prisma migrations in build process"

# Push to your repository
git push
```

## Step 3: Monitor Your Vercel Deployment

1. Go to your Vercel dashboard
2. Monitor the deployment logs
3. Look for the Prisma migration steps in the build logs

You should see output similar to:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.prisma.io:5432"
2 migrations found in prisma/migrations
The following migration(s) have been applied:
- 20250627060446_init
- 20250628000000_add_prepaid_category
```

## Step 4: Verify Your Database Changes

After deployment completes successfully, verify that your database has the new `prePaidCategory` field:

1. Check that the feature works in your application
2. You can also connect to your database directly to verify the schema change

## Troubleshooting

If you encounter any issues:

1. **Migration Already Applied**: If Vercel says the migration is already applied, this is normal if you ran the fix script.

2. **Missing Migration Table**: If you see the P3005 error again, you may need to run the migration fix script with the correct DATABASE_URL.

3. **Permission Issues**: Make sure your database user has permission to create and modify tables.

## For Future Migrations

For future schema changes:

1. Create a new migration locally:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. Commit and push the new migration files

3. Vercel will automatically apply the new migration during deployment

## Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
