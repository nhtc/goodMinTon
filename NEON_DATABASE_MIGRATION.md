# Neon Database Migration Guide for Vercel Deployment

This guide will help you apply your Prisma schema changes to your Neon PostgreSQL database when deploying to Vercel.

## Prerequisites

- Your Badminton Manager app is deployed on Vercel
- You have access to the Neon database dashboard
- You have your Neon database connection string

## Step 1: Access Your Neon Database Connection String

1. Log in to your Neon dashboard at https://console.neon.tech/
2. Select your project
3. Go to the "Connection Details" tab
4. Copy your connection string (it should look like `postgres://username:password@db.neon.tech/dbname?sslmode=require`)

## Step 2: Set Up Environment Variables

Make sure your Vercel project has the following environment variables:

- `DATABASE_URL`: Your Neon database connection string
- `JWT_SECRET`: Your JWT secret key
- `NEXTAUTH_SECRET`: Your Next.js Auth secret

You can check these in the Vercel dashboard under your project settings > Environment Variables.

## Step 3: Apply Migrations to Production

### Option 1: Using the Deployment Script

1. On your local machine, open a terminal
2. Navigate to your project directory
3. Set the DATABASE_URL environment variable to your Neon connection string:
   ```bash
   export DATABASE_URL="postgres://username:password@db.neon.tech/dbname?sslmode=require"
   ```
4. Run the deployment script:
   ```bash
   ./deploy-migrations.sh
   ```

### Option 2: Apply Migrations Manually

1. Set your DATABASE_URL:
   ```bash
   export DATABASE_URL="postgres://username:password@db.neon.tech/dbname?sslmode=require"
   ```
2. Apply the migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Step 4: Verify the Migration

After applying the migrations, verify that the database schema has been updated correctly:

1. Pull the updated schema to check it:
   ```bash
   npx prisma db pull
   ```
2. Connect to your Neon database using a PostgreSQL client and check if the `prePaidCategory` column exists:
   ```sql
   \d game_participants
   ```

## Step 5: Redeploy Your Vercel Project (if needed)

If your Vercel project is not automatically deploying:

1. Go to your Vercel dashboard
2. Select your project
3. Click on "Deployments"
4. Click "Redeploy" on your most recent deployment

## Common Issues and Troubleshooting

### Connection Issues

If you have trouble connecting to your Neon database:

1. Make sure you're using the correct connection string format
2. Check that your IP is allowed in Neon's IP restrictions (if enabled)
3. Verify that your database is active and not in a suspended state

### Migration Failures

If your migrations fail:

1. Check the error message for specific issues
2. Verify that your `prisma/schema.prisma` file is valid
3. Make sure your database user has the necessary permissions

### Testing the Changes

After migration, test that your new features work:

1. Create a new game with a pre-paid category
2. Verify that the pre-paid amount and category are saved correctly
3. Check that the UI displays the pre-paid information as expected

## Maintaining Database Security

- Regularly rotate your database passwords
- Use environment variables for all sensitive information
- Keep your Prisma schema and migrations in version control
- Backup your database before applying major schema changes
