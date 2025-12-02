# 💳 Payment Gateway Deployment Checklist

This document provides a comprehensive checklist for deploying payment gateways (PhonePe and PayU) to production on Vercel.

## ⚠️ Critical Pre-Deployment Requirements

### 1. Environment Variables Setup

**MUST be configured in Vercel Dashboard → Settings → Environment Variables:**

#### Required for All Payment Gateways
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### PhonePe Configuration
```env
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com
```

#### PayU Configuration
```env
PAYU_KEY=your_payu_key
PAYU_SALT=your_payu_salt
PAYU_BASE_URL=https://secure.payu.in
```

**⚠️ Important:** 
- Use **production URLs** for payment gateways in production
- PhonePe Production: `https://api.phonepe.com`
- PayU Production: `https://secure.payu.in`
- Test URLs should only be used during development/testing

---

## 🔍 Pre-Deployment Checklist

### ✅ URL Configuration

- [ ] **`NEXT_PUBLIC_APP_URL`** is set to your production Vercel URL
  - Example: `https://your-app.vercel.app`
  - **CRITICAL:** This must match your actual Vercel deployment URL exactly
  - No trailing slash

- [ ] **PhonePe Base URL** is set to production:
  - Production: `https://api.phonepe.com`
  - Test: `https://api-preprod.phonepe.com` (only for testing)

- [ ] **PayU Base URL** is set to production:
  - Production: `https://secure.payu.in`
  - Test: `https://test.payu.in` (only for testing)

### ✅ Payment Gateway Credentials

#### PhonePe
- [ ] Merchant ID obtained from PhonePe dashboard
- [ ] Salt Key obtained from PhonePe dashboard
- [ ] Salt Index (usually "1")
- [ ] Credentials verified with PhonePe support
- [ ] Test transactions completed successfully

#### PayU
- [ ] Merchant Key obtained from PayU dashboard
- [ ] Salt Key obtained from PayU dashboard
- [ ] Credentials verified with PayU support
- [ ] Test transactions completed successfully

### ✅ Callback URLs Configuration

#### PhonePe Callback URLs
- [ ] **Redirect URL:** `https://your-app.vercel.app/payment/success`
- [ ] **Callback URL:** `https://your-app.vercel.app/api/payment/callback`
- [ ] URLs registered in PhonePe merchant dashboard
- [ ] URLs are HTTPS (required for production)

#### PayU Callback URLs
- [ ] **Success URL:** `https://your-app.vercel.app/payment/success`
- [ ] **Failure URL:** `https://your-app.vercel.app/payment/failure`
- [ ] URLs registered in PayU merchant dashboard
- [ ] URLs are HTTPS (required for production)

### ✅ Admin Dashboard Configuration

After deployment, configure via Admin Dashboard (`/admin`):

- [ ] Login to admin dashboard
- [ ] Navigate to Settings
- [ ] **PhonePe Settings Tab:**
  - [ ] Merchant ID entered
  - [ ] Salt Key entered
  - [ ] Salt Index set (default: "1")
  - [ ] Base URL set to production URL
- [ ] **PayU Settings Tab:**
  - [ ] Merchant Key entered
  - [ ] Salt Key entered
  - [ ] Base URL set to production URL
- [ ] **General Settings Tab:**
  - [ ] Site URL set to production URL (`https://your-app.vercel.app`)
  - [ ] Application Fee configured
- [ ] Settings saved successfully

---

## 🧪 Testing Checklist

### Test Mode Verification

Before going live, test with test credentials:

- [ ] **Test Mode Enabled:**
  - Set `PAYMENT_TEST_MODE=true` in environment variables
  - Test payment flow end-to-end
  - Verify redirect URLs work correctly
  - Verify callback handling works

- [ ] **Test Mode Disabled:**
  - Set `PAYMENT_TEST_MODE=false` or remove it
  - Test with real payment gateway credentials
  - Complete a test transaction (if gateway supports test mode)
  - Verify payment success page displays correctly
  - Verify payment failure page displays correctly

### Payment Flow Testing

- [ ] **Form Submission:**
  - [ ] Scholarship form submits successfully
  - [ ] Payment initiation API responds correctly
  - [ ] Redirect to payment gateway works

- [ ] **Payment Gateway:**
  - [ ] Payment page loads correctly
  - [ ] Payment can be completed
  - [ ] Payment can be cancelled
  - [ ] Payment gateway redirects back correctly

- [ ] **Callback Handling:**
  - [ ] Success callback received and processed
  - [ ] Failure callback received and processed
  - [ ] Transaction status updated in Google Sheets (if configured)
  - [ ] Payment status page displays correct information

- [ ] **Success Page:**
  - [ ] Transaction details displayed correctly
  - [ ] Receipt download works
  - [ ] Student information shown correctly

- [ ] **Failure Page:**
  - [ ] Error message displayed
  - [ ] Retry option works
  - [ ] Support contact information shown

---

## 🔒 Security Checklist

- [ ] **HTTPS Enabled:**
  - [ ] All URLs use HTTPS (not HTTP)
  - [ ] Vercel SSL certificate active
  - [ ] No mixed content warnings

- [ ] **Credentials Security:**
  - [ ] Payment gateway credentials stored in environment variables (not code)
  - [ ] Admin dashboard masks sensitive keys
  - [ ] No credentials committed to Git
  - [ ] Credentials rotated regularly

- [ ] **Hash Verification:**
  - [ ] Payment callbacks verify hash signatures
  - [ ] Invalid hashes are rejected
  - [ ] Hash generation matches gateway requirements

- [ ] **Error Handling:**
  - [ ] Payment failures handled gracefully
  - [ ] Error messages don't expose sensitive information
  - [ ] Failed transactions logged for debugging

---

## 📋 Post-Deployment Verification

### Immediate Checks (Within 1 hour)

- [ ] **Environment Variables:**
  - [ ] Verify all environment variables are set correctly in Vercel
  - [ ] Check Vercel deployment logs for any errors
  - [ ] Verify `NEXT_PUBLIC_APP_URL` matches actual deployment URL

- [ ] **Payment Gateway Status:**
  - [ ] PhonePe merchant account is active
  - [ ] PayU merchant account is active
  - [ ] Both gateways are in production mode (not test)

- [ ] **URL Accessibility:**
  - [ ] Success page accessible: `https://your-app.vercel.app/payment/success`
  - [ ] Failure page accessible: `https://your-app.vercel.app/payment/failure`
  - [ ] Callback endpoint accessible: `https://your-app.vercel.app/api/payment/callback`

### First Transaction Test

- [ ] **Complete a Real Transaction:**
  - [ ] Use minimum amount (if possible)
  - [ ] Complete full payment flow
  - [ ] Verify payment is processed correctly
  - [ ] Verify callback is received
  - [ ] Verify transaction appears in payment gateway dashboard
  - [ ] Verify data saved to Google Sheets (if configured)

---

## 🐛 Troubleshooting Common Issues

### Issue: Payment Gateway Not Redirecting

**Symptoms:** After form submission, user doesn't get redirected to payment gateway

**Solutions:**
1. Check `NEXT_PUBLIC_APP_URL` is set correctly
2. Verify payment gateway credentials are correct
3. Check Vercel function logs for errors
4. Verify payment gateway base URL is correct (production vs test)
5. Check if payment gateway account is active

### Issue: Callback Not Received

**Symptoms:** Payment completes but callback is not received

**Solutions:**
1. Verify callback URL is registered in payment gateway dashboard
2. Check callback URL uses HTTPS
3. Verify callback URL matches exactly: `https://your-app.vercel.app/api/payment/callback`
4. Check Vercel function logs for callback attempts
5. Verify payment gateway allows callbacks to your domain

### Issue: Hash Verification Failed

**Symptoms:** Payment gateway rejects callback due to invalid hash

**Solutions:**
1. Verify salt key is correct
2. Check hash generation algorithm matches gateway requirements
3. Verify all parameters are included in hash calculation
4. Check for encoding issues (UTF-8)
5. Verify salt index is correct (for PhonePe)

### Issue: Redirect URLs Not Working

**Symptoms:** After payment, user doesn't reach success/failure page

**Solutions:**
1. Verify success/failure URLs are registered in payment gateway dashboard
2. Check URLs use HTTPS
3. Verify URLs match exactly: `https://your-app.vercel.app/payment/success`
4. Check Vercel deployment is active
5. Verify no trailing slashes in URLs

---

## 📞 Support Contacts

### PhonePe Support
- **Merchant Support:** Available in PhonePe merchant dashboard
- **Documentation:** https://developer.phonepe.com/
- **Status Page:** Check PhonePe status for any outages

### PayU Support
- **Merchant Support:** Available in PayU merchant dashboard
- **Documentation:** https://devguide.payu.in/
- **Status Page:** Check PayU status for any outages

### Vercel Support
- **Documentation:** https://vercel.com/docs
- **Support:** Available in Vercel dashboard

---

## 📝 Production URLs Reference

### PhonePe URLs
- **Production API:** `https://api.phonepe.com`
- **Test API:** `https://api-preprod.phonepe.com`
- **Documentation:** https://developer.phonepe.com/v1/reference/payment-api

### PayU URLs
- **Production API:** `https://secure.payu.in`
- **Test API:** `https://test.payu.in`
- **Documentation:** https://devguide.payu.in/docs/apis/payment-apis

### Your Application URLs (Example)
- **Production:** `https://your-app.vercel.app`
- **Success Page:** `https://your-app.vercel.app/payment/success`
- **Failure Page:** `https://your-app.vercel.app/payment/failure`
- **Callback:** `https://your-app.vercel.app/api/payment/callback`

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables configured in Vercel
- [ ] Payment gateway credentials verified
- [ ] Callback URLs registered in payment gateway dashboards
- [ ] Test transactions completed successfully
- [ ] Admin dashboard configured with production settings
- [ ] HTTPS enabled and working
- [ ] At least one real transaction tested successfully
- [ ] Error handling tested
- [ ] Support contact information updated
- [ ] Monitoring/logging set up

---

## 🚨 Emergency Rollback

If payment gateway issues occur in production:

1. **Disable Payment Gateways:**
   - Set `PAYMENT_TEST_MODE=true` in Vercel environment variables
   - Redeploy application
   - This will enable test mode and prevent real transactions

2. **Contact Payment Gateway Support:**
   - PhonePe: Contact merchant support immediately
   - PayU: Contact merchant support immediately

3. **Check Logs:**
   - Review Vercel function logs
   - Check payment gateway transaction logs
   - Identify root cause

4. **Fix and Redeploy:**
   - Fix identified issues
   - Test thoroughly
   - Redeploy with `PAYMENT_TEST_MODE=false`

---

**Last Updated:** December 2024
**Version:** 1.0

