# 🚀 Deployment Guide

This guide will help you deploy your Next.js application to Vercel (recommended) or other platforms.

## ⚠️ Important Notes

### Database Migration Required
**Your application currently uses SQLite, which does NOT work on serverless platforms like Vercel.**

You have two options:

1. **Switch to PostgreSQL (Recommended for Vercel)**
   - Use Vercel Postgres or another PostgreSQL provider
   - Update your `prisma/schema.prisma` to use PostgreSQL
   - Update `DATABASE_URL` environment variable

2. **Use a different hosting platform**
   - Platforms like Railway, Render, or DigitalOcean support SQLite
   - These platforms provide persistent file storage

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites
- A GitHub, GitLab, or Bitbucket account
- A Vercel account (free tier available at [vercel.com](https://vercel.com))

### Step 1: Push to Git Repository

```bash
# Add all files
git add .

# Commit changes
git commit -m "Initial commit - ready for deployment"

# Create a repository on GitHub/GitLab/Bitbucket, then:
git remote add origin <your-repository-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. Configure environment variables (see below)
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required
- `DATABASE_URL` - Your PostgreSQL connection string (if using PostgreSQL)
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

#### Optional (can be configured via admin dashboard)
- `PHONEPE_MERCHANT_ID` - PhonePe merchant ID
- `PHONEPE_SALT_KEY` - PhonePe salt key
- `PHONEPE_SALT_INDEX` - PhonePe salt index (default: "1")
- `PHONEPE_BASE_URL` - PhonePe API base URL
- `PAYU_KEY` - PayU key
- `PAYU_SALT` - PayU salt
- `PAYU_BASE_URL` - PayU base URL
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key

### Step 4: Database Setup (If using PostgreSQL)

1. **Add Vercel Postgres:**
   - In your Vercel project, go to Storage tab
   - Click "Create Database" → Select "Postgres"
   - Copy the connection string

2. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run Migrations:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

4. **Add DATABASE_URL to Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string

### Step 5: Access Your Live Site

After deployment, Vercel will provide you with:
- **Production URL**: `https://your-app.vercel.app`
- **Admin Dashboard**: `https://your-app.vercel.app/admin`
  - Default credentials: username: `vjsdoctordreams`, password: `abc123*#$`

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- Every push to `main` → Production deployment
- Every push to other branches → Preview deployment

## 🛠️ Alternative Deployment Options

### Railway
- Supports SQLite out of the box
- Visit [railway.app](https://railway.app)
- Connect your Git repository
- Railway auto-detects Next.js

### Render
- Supports SQLite
- Visit [render.com](https://render.com)
- Create a new Web Service
- Connect your Git repository

### DigitalOcean App Platform
- Supports SQLite
- Visit [digitalocean.com](https://digitalocean.com)
- Create a new App
- Connect your Git repository

## 📝 Post-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` with production URL
- [ ] Configure payment gateway credentials (PhonePe/PayU)
- [ ] Set up Google Sheets integration (if needed)
- [ ] Test payment flows
- [ ] Test admin dashboard access
- [ ] Update admin credentials (change default password)
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic on Vercel)

## 🔒 Security Recommendations

1. **Change default admin credentials** immediately after deployment
2. **Use environment variables** for all sensitive data
3. **Enable Vercel's security features** (DDoS protection, etc.)
4. **Regularly update dependencies** for security patches
5. **Use strong passwords** for admin access

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify database connection string is correct

### Database Connection Issues
- Verify `DATABASE_URL` is correctly formatted
- Check if database provider allows connections from Vercel IPs
- Ensure SSL is enabled for production databases

### Payment Gateway Not Working
- Verify all payment gateway credentials are set
- Check that `NEXT_PUBLIC_APP_URL` matches your production URL
- Test with sandbox/test credentials first

## 📞 Support

For issues specific to:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Next.js**: Check [Next.js Documentation](https://nextjs.org/docs)
- **Prisma**: Check [Prisma Documentation](https://www.prisma.io/docs)

---

Happy deploying! 🚀






