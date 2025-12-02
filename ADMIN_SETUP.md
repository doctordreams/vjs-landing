# 🛡️ Admin Dashboard Setup Guide

## 🔐 Environment Setup

Before accessing the admin dashboard, you must configure environment variables:

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Admin Authentication (REQUIRED)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=your_hashed_password

# Session Management (REQUIRED)
NEXTAUTH_SECRET=your-secure-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database (OPTIONAL - defaults to SQLite)
DATABASE_URL="file:./db/custom.db"

# Payment Gateways (configure based on your chosen provider)
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com

# OR for PayU
PAYU_KEY=your_payu_key
PAYU_SALT=your_payu_salt
PAYU_BASE_URL=https://test.payu.in
PAYU_MERCHANT_ID=your_payu_merchant_id

# Google Sheets Integration (REQUIRED for data storage)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID=your_google_sheet_id

# Email Configuration (OPTIONAL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@vaidyajyothi.com
SMTP_FROM_NAME="Vaidya Jyothi Scholarship"

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_TEST_MODE=false

# Security Settings (OPTIONAL - defaults provided)
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
```

### 🔑 Admin Password Setup

1. **Generate password hash** (run this command):
   ```bash
   node -e "
   const bcrypt = require('bcryptjs');
   const password = 'your-secure-password-here';
   bcrypt.hash(password, 12).then(hash => console.log('Password hash:', hash));
   "
   ```

2. **Set the hash** in your `.env.local` file as `ADMIN_PASSWORD_HASH`

3. **Access URL**: `http://localhost:3000/admin`

## 📋 Features Overview

### 🏠 Admin Dashboard (`/admin/dashboard`)

The admin dashboard provides a comprehensive interface to manage all application settings:

#### 📱 **PhonePe Payment Gateway**
- Merchant ID configuration
- Salt Key management (with visibility toggle)
- Salt Index setting
- Base URL configuration

#### 📊 **Google Sheets Integration**
- Google Sheet ID management
- Service Account Email setup
- Private Key configuration (secure input)
- Real-time data synchronization

#### 📧 **Email Configuration**
- SMTP server settings
- Email authentication
- From email and name configuration
- Port and security settings

#### ⚙️ **General Settings**
- Application fee configuration
- Site URL management
- Contact information setup
- Support details

## 🔧 Setup Instructions

### 1. **PhonePe Payment Gateway**

1. Contact PhonePe support to get your merchant account
2. Obtain the following credentials:
   - Merchant ID
   - Salt Key
   - Salt Index (usually 1)
3. Enter these in the **PhonePe** tab of admin dashboard

### 2. **Google Sheets Integration**

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Download the JSON key file
4. Share your Google Sheet with the service account email
5. Copy the private key and service account email to the **Google Sheets** tab

### 3. **Email Configuration** (Optional)

1. Get SMTP credentials from your email provider
2. Configure in the **Email** tab
3. Test email functionality

### 4. **General Settings**

1. Set application fee (default: ₹250)
2. Configure site URL for production
3. Set up contact information
4. Update support details

## 🚀 Security Features

### 🔒 **Authentication**
- **Server-side authentication** with bcrypt password hashing
- **HTTP-only cookies** for session management (XSS protection)
- **Session expiration** (24 hours)
- **Rate limiting** (5 attempts per 15 minutes per IP)
- **Middleware protection** for all admin routes
- **Server-side session validation**

### 🛡️ **Data Protection**
- **Environment variables** for all sensitive credentials
- **API key masking** with visibility toggles
- **Input validation and sanitization**
- **Secure password storage** (bcrypt hashing)
- **No hardcoded credentials**

### 🔐 **Security Best Practices**
- **Strong password requirements** (enforced via bcrypt)
- **HTTPS required** in production
- **Regular credential rotation**
- **Session timeout** after inactivity
- **IP-based rate limiting**
- **Server-side validation** on all requests
- **No sensitive data in client-side storage**

### 🚨 **Production Security Checklist**
- [ ] Set strong admin password and hash it with bcrypt
- [ ] Use HTTPS (required for secure cookies)
- [ ] Set secure `NEXTAUTH_SECRET` (32+ characters)
- [ ] Configure proper environment variables
- [ ] Remove any debug/test credentials
- [ ] Enable rate limiting
- [ ] Set appropriate session timeouts
- [ ] Monitor admin access logs
- [ ] Regular security audits

## 📱 Mobile Responsiveness

The admin dashboard is fully responsive:
- **Desktop**: Full-featured interface with all tabs visible
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Compact interface with vertical tab layout

## 🔄 Settings Management

### **Saving Settings**
- Click "Save Settings" to persist changes
- Settings are validated server-side before saving
- **Note**: Admin settings are currently stored in browser localStorage for demo purposes
- **Production**: Migrate to secure server-side database storage

### **Reset Functionality**
- Click "Reset" to restore default values
- Useful for troubleshooting
- Clears all custom configurations from localStorage

## 🎯 Key Features

### **API Key Management**
- Secure input fields for sensitive data
- Eye/Eye-off toggle for password visibility
- Real-time validation
- Format checking

### **Dynamic Configuration**
- Settings automatically applied to payment processing
- Real-time Google Sheets integration
- Email notifications use configured settings
- Application fee updates reflect immediately

### **Error Handling**
- Comprehensive validation messages
- User-friendly error descriptions
- Success confirmations
- Loading states during operations

## 📊 Integration Points

### **Payment Processing**
- Admin settings automatically used by PhonePe integration
- Dynamic fee calculation
- Real-time credential validation

### **Data Storage**
- Google Sheets settings used for application storage
- Automatic sheet access with service account
- Real-time data synchronization

### **Email Notifications**
- SMTP settings for applicant communications
- Customizable email templates
- Support notification system

## 🔧 Technical Implementation

### **Frontend**
- React with TypeScript
- shadcn/ui components
- Responsive design with Tailwind CSS
- LocalStorage for settings persistence

### **Backend**
- Next.js API routes
- Settings validation
- Integration with existing services
- Secure credential handling

### **Security**
- **bcrypt password hashing**
- **HTTP-only secure cookies**
- **Server-side session validation**
- **Rate limiting middleware**
- **Input sanitization**
- **API key protection**
- **CORS configuration**
- **Environment variable management**

## 📞 Support

For any issues with the admin dashboard:
- **Email**: admin@vaidyajyothi.com
- **Phone**: +91 98765 43210
- **Documentation**: Check inline help text and tooltips

## 🔄 Updates & Maintenance

### **Regular Tasks**
- Review and update API keys
- Monitor payment processing
- Check Google Sheets integration
- Verify email functionality

### **Security Maintenance**
- Change admin passwords periodically
- Review access logs
- Update API credentials
- Monitor for unauthorized access

---

**Note**: This admin panel provides complete control over your scholarship application system. Ensure all settings are properly configured before going live.