# 🔐 Vercel Environment Variables - Complete List

## ⚠️ Status: No Environment Variables Set Yet

You need to set these environment variables in your Vercel Dashboard before the application will work properly in production.

---

## 🔴 CRITICAL - Must Set Immediately

These are **REQUIRED** for the application to work:

### 1. Application URL
```env
NEXT_PUBLIC_APP_URL=https://vjsdoctordreams-bc8hoq1lz-mohammed-mubaraks-projects-99442544.vercel.app
```
**⚠️ IMPORTANT:** Replace with your actual production URL after deployment
- **Where to find it:** Vercel Dashboard → Your Project → Settings → Domains
- **What it does:** Used for payment redirects, callbacks, and API calls
- **Without this:** Payment gateways won't redirect correctly

### 2. Node Environment
```env
NODE_ENV=production
```
**What it does:** Tells the app it's in production mode
- **Default:** Usually set automatically by Vercel, but set it explicitly

### 3. Database URL (REQUIRED for Production)
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```
**⚠️ CRITICAL:** SQLite won't work on Vercel! You MUST use PostgreSQL
- **How to get:** 
  1. Vercel Dashboard → Your Project → Storage → Create Database → Postgres
  2. Copy the connection string
- **Without this:** Database operations will fail

---

## 🟡 PAYMENT GATEWAYS - Required if Using Payments

### PhonePe Configuration (If using PhonePe)

```env
PHONEPE_MERCHANT_ID=your_merchant_id_here
PHONEPE_SALT_KEY=your_salt_key_here
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com
```

**Where to get:**
- Login to PhonePe Merchant Dashboard
- Go to API Keys section
- Copy Merchant ID, Salt Key, and Salt Index

**Note:** 
- Use `https://api.phonepe.com` for production
- Use `https://api-preprod.phonepe.com` for testing

### PayU Configuration (If using PayU)

```env
PAYU_KEY=your_payu_key_here
PAYU_SALT=your_payu_salt_here
PAYU_BASE_URL=https://secure.payu.in
```

**Where to get:**
- Login to PayU Merchant Dashboard
- Go to API Credentials section
- Copy Merchant Key and Salt

**Note:**
- Use `https://secure.payu.in` for production
- Use `https://test.payu.in` for testing

### Payment Test Mode (Optional - for testing)

```env
PAYMENT_TEST_MODE=false
```
- Set to `true` to enable test mode (no real payments)
- Set to `false` or remove for production

---

## 🟢 OPTIONAL - Admin Configuration

These can be set via environment variables OR configured in the admin dashboard:

### Admin Authentication

```env
ADMIN_USERNAME=vjsdoctordreams
ADMIN_PASSWORD_HASH=bcrypt_hash_of_password
```

**Default Username:** `vjsdoctordreams`  
**Default Password:** `abc123*#$` (change this!)

**To generate password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10))"
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_ATTEMPTS=5
```

**Defaults:**
- Window: 900000ms (15 minutes)
- Max Attempts: 5

---

## 🔵 OPTIONAL - Google Sheets Integration

Only needed if you want to save application data to Google Sheets:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Where to get:**
1. Go to Google Cloud Console
2. Create a Service Account
3. Download JSON key file
4. Extract `client_email` and `private_key`
5. Replace `\n` with actual newlines in `GOOGLE_PRIVATE_KEY`

**Note:** Replace actual newlines with `\n` in the environment variable value

---

## 📋 Quick Setup Checklist

### Step 1: Critical Variables (Do First)
- [ ] Set `NEXT_PUBLIC_APP_URL` = Your Vercel production URL
- [ ] Set `NODE_ENV` = `production`
- [ ] Set `DATABASE_URL` = PostgreSQL connection string from Vercel Postgres

### Step 2: Payment Gateway (Choose One)
- [ ] **Option A:** Set PhonePe variables (if using PhonePe)
- [ ] **Option B:** Set PayU variables (if using PayU)
- [ ] **Option C:** Set `PAYMENT_TEST_MODE=true` for testing

### Step 3: Optional Configuration
- [ ] Set admin credentials (or use defaults)
- [ ] Set Google Sheets credentials (if using)
- [ ] Set rate limiting (or use defaults)

---

## 🚀 How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: `vjsdoctordreams`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key:** Variable name (e.g., `NEXT_PUBLIC_APP_URL`)
   - **Value:** Variable value
   - **Environment:** Select `Production`, `Preview`, and/or `Development`
6. Click **Save**
7. **Redeploy** your application for changes to take effect

### Method 2: Via Vercel CLI

```bash
# Set a single variable
vercel env add NEXT_PUBLIC_APP_URL production

# Set multiple variables
vercel env add DATABASE_URL production
vercel env add PHONEPE_MERCHANT_ID production
# ... etc
```

---

## 📝 Environment Variable Reference Table

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | None | Production URL for redirects |
| `NODE_ENV` | ✅ Yes | `production` | Environment mode |
| `DATABASE_URL` | ✅ Yes | None | PostgreSQL connection string |
| `PHONEPE_MERCHANT_ID` | ⚠️ If using PhonePe | None | PhonePe merchant ID |
| `PHONEPE_SALT_KEY` | ⚠️ If using PhonePe | None | PhonePe salt key |
| `PHONEPE_SALT_INDEX` | ⚠️ If using PhonePe | `1` | PhonePe salt index |
| `PHONEPE_BASE_URL` | ⚠️ If using PhonePe | Auto-detected | PhonePe API URL |
| `PAYU_KEY` | ⚠️ If using PayU | None | PayU merchant key |
| `PAYU_SALT` | ⚠️ If using PayU | None | PayU salt |
| `PAYU_BASE_URL` | ⚠️ If using PayU | Auto-detected | PayU API URL |
| `PAYMENT_TEST_MODE` | ❌ No | `false` | Enable test mode |
| `ADMIN_USERNAME` | ❌ No | `vjsdoctordreams` | Admin username |
| `ADMIN_PASSWORD_HASH` | ❌ No | None | Admin password hash |
| `RATE_LIMIT_WINDOW_MS` | ❌ No | `900000` | Rate limit window |
| `RATE_LIMIT_MAX_ATTEMPTS` | ❌ No | `5` | Max login attempts |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ❌ No | None | Google service account email |
| `GOOGLE_PRIVATE_KEY` | ❌ No | None | Google service account key |

---

## ⚠️ Important Notes

1. **After setting environment variables, you MUST redeploy:**
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger redeployment

2. **Environment-specific variables:**
   - Set variables for `Production`, `Preview`, and `Development` as needed
   - Production variables are used for live site
   - Preview variables are used for preview deployments

3. **Sensitive data:**
   - Never commit environment variables to Git
   - Use Vercel's environment variables feature
   - Keep credentials secure

4. **Payment Gateway URLs:**
   - Must register callback URLs in payment gateway dashboards:
     - PhonePe: `https://your-app.vercel.app/api/payment/callback`
     - PayU: `https://your-app.vercel.app/payment/success` and `/payment/failure`

---

## 🔍 Verify Environment Variables Are Set

After setting variables, verify they're loaded:

1. **Check in Vercel Dashboard:**
   - Settings → Environment Variables
   - Should see all your variables listed

2. **Check in deployment logs:**
   - Go to Deployments → Latest → View Function Logs
   - Look for any warnings about missing variables

3. **Test the application:**
   - Visit your production URL
   - Try submitting the form
   - Check if payment redirects work

---

## 🆘 Troubleshooting

### Issue: Payment redirects not working
**Solution:** Check `NEXT_PUBLIC_APP_URL` is set correctly and matches your Vercel URL exactly

### Issue: Database connection failed
**Solution:** 
- Verify `DATABASE_URL` is correct PostgreSQL connection string
- Check database is accessible from Vercel
- Ensure SSL mode is enabled (`?sslmode=require`)

### Issue: Payment gateway errors
**Solution:**
- Verify all payment gateway credentials are correct
- Check callback URLs are registered in gateway dashboards
- Ensure production URLs are used (not test URLs)

---

**Last Updated:** December 2024  
**Status:** Ready for configuration

