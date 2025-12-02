# 🚀 Vercel Deployment Guide

This guide will walk you through deploying your Next.js application to Vercel.

## ⚠️ Important: Database Migration Required

**Your application currently uses SQLite, which does NOT work on Vercel's serverless platform.**

You **MUST** switch to PostgreSQL before deploying to Vercel. SQLite requires a file system, which is not available in Vercel's serverless functions.

## 📋 Pre-Deployment Checklist

- [ ] Switch database from SQLite to PostgreSQL
- [ ] Set up Vercel Postgres or external PostgreSQL database
- [ ] Update Prisma schema
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Test locally with PostgreSQL

## 🗄️ Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)
2. **Create a new project** (you can do this later, but you need the project to add Postgres)
3. **Add Vercel Postgres:**
   - Go to your Vercel project dashboard
   - Click on the **Storage** tab
   - Click **Create Database** → Select **Postgres**
   - Choose a name for your database
   - Select a region (e.g., `bom1` for Mumbai)
   - Click **Create**
   - Copy the **Connection String** (you'll need this for `DATABASE_URL`)

### Option B: External PostgreSQL Provider

You can use any PostgreSQL provider:
- **Supabase** (free tier available): [supabase.com](https://supabase.com)
- **Neon** (free tier available): [neon.tech](https://neon.tech)
- **Railway** (free tier available): [railway.app](https://railway.app)
- **Render** (free tier available): [render.com](https://render.com)

Get your PostgreSQL connection string from your provider.

## 🔧 Step 2: Update Prisma Schema

Update `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // For local development with SQLite, you can use:
  // provider = "sqlite"
  // url      = env("DATABASE_URL")
}
```

**Note:** For local development, you can keep SQLite. Just switch the provider when deploying.

## 🔄 Step 3: Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Push schema to your PostgreSQL database
npm run db:push

# Or create a migration
npm run db:migrate
```

## 📦 Step 4: Push Code to Git

Vercel requires your code to be in a Git repository (GitHub, GitLab, or Bitbucket).

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Create a repository on GitHub/GitLab/Bitbucket, then:
git remote add origin <your-repository-url>
git push -u origin main
```

## 🚀 Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. **Import your Git repository**
   - Connect your GitHub/GitLab/Bitbucket account if needed
   - Select your repository
4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `prisma generate && npm run build` (already configured in vercel.json)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
5. **Add Environment Variables** (see Step 6 below)
6. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

## 🔐 Step 6: Configure Environment Variables

In your Vercel project settings, go to **Settings** → **Environment Variables** and add:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/dbname?sslmode=require` |
| `NEXT_PUBLIC_APP_URL` | Your production URL | `https://your-app.vercel.app` |

### Optional Variables (Payment Gateways)

These can also be configured via the admin dashboard after deployment:

| Variable | Description |
|----------|-------------|
| `PHONEPE_MERCHANT_ID` | PhonePe merchant ID |
| `PHONEPE_SALT_KEY` | PhonePe salt key |
| `PHONEPE_SALT_INDEX` | PhonePe salt index (default: "1") |
| `PHONEPE_BASE_URL` | PhonePe API base URL |
| `PAYU_KEY` | PayU merchant key |
| `PAYU_SALT` | PayU salt |
| `PAYU_BASE_URL` | PayU base URL |

### Optional Variables (Google Sheets)

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account email |
| `GOOGLE_PRIVATE_KEY` | Google service account private key (with `\n` for newlines) |

### Optional Variables (Admin)

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_USERNAME` | Admin username | `vjsdoctordreams` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | (set via admin dashboard) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) |
| `RATE_LIMIT_MAX_ATTEMPTS` | Max login attempts per window | `5` |
| `PAYMENT_TEST_MODE` | Enable test mode for payments | `false` |

**Important:** 
- Set environment variables for **Production**, **Preview**, and **Development** environments as needed
- For `GOOGLE_PRIVATE_KEY`, replace actual newlines with `\n` in the environment variable value
- Never commit `.env` files to Git

## ✅ Step 7: Verify Deployment

After deployment:

1. **Check Build Logs:**
   - Go to your project → **Deployments** tab
   - Click on the latest deployment
   - Check for any build errors

2. **Test Your Application:**
   - Visit your production URL: `https://your-app.vercel.app`
   - Test the admin dashboard: `https://your-app.vercel.app/admin`
   - Default credentials: username: `vjsdoctordreams`, password: `abc123*#$`
   - **⚠️ Change the default password immediately!**

3. **Test Database Connection:**
   - Try accessing admin features that require database
   - Check Vercel function logs if there are any database errors

## 🔄 Step 8: Continuous Deployment

Vercel automatically deploys when you push to your Git repository:
- **Production:** Every push to `main` branch
- **Preview:** Every push to other branches (creates preview URLs)

## 🛠️ Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
- Solution: The build command includes `prisma generate`, but if it fails, check that `DATABASE_URL` is set correctly

**Error: Database connection failed**
- Solution: Verify `DATABASE_URL` is correct and includes SSL parameters (`?sslmode=require`)
- Check that your database allows connections from Vercel IPs

### Runtime Errors

**Error: Cannot find module '@prisma/client'**
- Solution: Ensure `postinstall` script runs: `"postinstall": "prisma generate"` (already added)

**Error: Database query failed**
- Solution: Check database connection string format
- Verify database is accessible from Vercel's network
- Check Vercel function logs for detailed error messages

### Payment Gateway Issues

**Payments not working**
- Verify `NEXT_PUBLIC_APP_URL` matches your production URL exactly
- Check that payment gateway credentials are set correctly
- Test with sandbox/test credentials first

## 📝 Post-Deployment Tasks

- [ ] Change default admin password
- [ ] Configure payment gateway credentials
- [ ] Set up Google Sheets integration (if needed)
- [ ] Test payment flows end-to-end
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)
- [ ] Set up monitoring and error tracking (optional)

## 🔒 Security Best Practices

1. **Change default admin credentials** immediately
2. **Use strong passwords** for admin access
3. **Enable Vercel's security features** (DDoS protection, etc.)
4. **Regularly update dependencies** for security patches
5. **Never commit sensitive data** to Git
6. **Use environment variables** for all secrets
7. **Enable Vercel's password protection** for preview deployments (optional)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

**Need Help?** Check the build logs in Vercel dashboard for detailed error messages.

Happy deploying! 🚀

