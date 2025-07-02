# Using Prisma with Vercel Deployments

This guide explains how to manage Prisma migrations with Vercel deployments, allowing you to keep your database schema in sync with your application code.

## Approach 1: Automatic Migrations During Deployment

With this approach, Prisma migrations will automatically run during the Vercel build process.

### Setup

1. Your `vercel.json` file has been updated to include the migration step:
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "prisma generate && prisma migrate deploy && next build",
     "installCommand": "npm install",
     "functions": {
       "src/app/api/**/*.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

2. Push your code to your repository:
   ```bash
   git add .
   git commit -m "Add Prisma migration for prePaidCategory"
   git push
   ```

3. Vercel will automatically deploy your app and run the Prisma migrations during the build process.

### Pros & Cons

**Pros:**
- Automatic synchronization between code and database schema
- No manual intervention needed after code push
- Migrations are applied at the same time as code changes

**Cons:**
- If migration fails, the entire deployment fails
- Less control over the migration timing
- Can increase build times

## Approach 2: Manual Migrations Using Vercel CLI

With this approach, you manually run migrations using Vercel's environment variables.

### Setup

1. Make sure you have Vercel CLI installed:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel CLI:
   ```bash
   vercel login
   ```

3. Use the provided script to run migrations:
   ```bash
   ./vercel-prisma-deploy.sh
   ```
   
4. Follow the prompts to choose whether to apply migrations to production or preview environment.

### Pros & Cons

**Pros:**
- More control over when migrations are applied
- Can separate database schema changes from code deployments
- Can test migrations in preview environments first

**Cons:**
- Requires manual intervention
- Possibility of application/database schema mismatch if migrations aren't applied

## Approach 3: Direct Database Connection

For situations where you need to apply migrations directly:

1. Get your database connection string from Vercel:
   ```bash
   vercel env pull --environment production .env.vercel
   ```

2. Apply migrations directly:
   ```bash
   DATABASE_URL=$(grep DATABASE_URL .env.vercel | cut -d '=' -f2- | tr -d '"')
   DATABASE_URL=$DATABASE_URL npx prisma migrate deploy
   ```

## Best Practices

1. **Always test migrations locally** before deploying to production
2. **Use a staging environment** to test both code and migrations
3. **Back up your database** before running significant migrations
4. **Monitor deployment logs** to ensure migrations ran successfully
5. **Include migration status checks** in your application startup

## Troubleshooting

### Failed Migrations

If a migration fails during deployment:

1. Check Vercel deployment logs for specific error messages
2. Fix the migration issues locally
3. If necessary, manually connect to the database and fix the schema
4. Redeploy with the corrected migration

### Database Connection Issues

If you have trouble connecting to your database:

1. Verify your DATABASE_URL environment variable in Vercel
2. Check network access and firewall settings
3. Ensure your database service is running

### Schema Drift

If your application code expects a different schema than what's in the database:

1. Run `prisma db pull` to see the current database schema
2. Compare with your Prisma schema
3. Create a new migration to bring them in sync

## Security Considerations

- Never commit database credentials to your repository
- Use Vercel environment variables for all sensitive information
- Restrict database access to only necessary IP addresses
- Consider using Vercel's integration with your database provider for improved security
