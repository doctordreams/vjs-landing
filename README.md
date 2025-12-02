# 🎓 Vaidya Jyothi Scholarship - Doctor Dreams Landing Page

A modern, full-featured scholarship application platform for Vaidya Jyothi Scholarship (VJS) program, built with Next.js 15. This application enables students to apply for MBBS scholarships with integrated payment processing, admin dashboard, and Google Sheets data management.

## 🌟 Overview

The Vaidya Jyothi Scholarship application is a comprehensive platform that allows students to:
- Submit scholarship applications online
- Pay application fees securely through multiple payment gateways
- Track application status
- Access admin dashboard for managing applications and settings

## ✨ Key Features

### 🎯 Student Features
- **Multi-section Application Form** with comprehensive data collection
  - Personal information (student, father, mother details)
  - Contact information (mobile numbers, email)
  - Address details (full address, pincode, taluk, district)
  - Academic information (college, 10th percentage, DD representative)
  - MBBS preferences (country, budget, college, facilities)
- **Dual Payment Gateway Support** (PhonePe & PayU)
- **Payment Success/Failure Pages** with transaction details
- **Responsive Design** optimized for mobile and desktop
- **Form Validation** with real-time error feedback
- **Test Payment Mode** for development and testing

### 🔐 Admin Features
- **Secure Admin Dashboard** with session-based authentication
- **Settings Management** for payment gateways and integrations
- **Payment Gateway Configuration** (PhonePe & PayU)
- **Google Sheets Integration** for data storage
- **Email Configuration** (SMTP settings)
- **General Settings** management
- **Theme Switcher** (Light, Dark, Bold Tech themes)

### 💳 Payment Integration
- **PhonePe Integration** - Complete payment flow with SHA256 hash verification
- **PayU Integration** - Secure payment processing with hash verification
- **Test Mode** - Mock payment flow for development
- **Transaction Tracking** - Automatic transaction ID generation
- **Callback Handling** - Secure payment verification

## 🛠️ Technology Stack

### Frontend
- **⚡ Next.js 15.3.5** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first CSS framework
- **🧩 shadcn/ui** - 50+ accessible UI components
- **🎯 Lucide React** - Icon library
- **🌈 Framer Motion** - Animation library
- **🎨 Next Themes** - Dark/light theme support

### Backend
- **🗄️ Prisma** - Next-generation ORM
- **💾 SQLite** - Database (PostgreSQL required for Vercel deployment)
- **🔐 Session-based Auth** - Admin authentication
- **📡 Next.js API Routes** - Serverless API endpoints

### Integrations
- **💳 PhonePe** - Payment gateway
- **💳 PayU** - Payment gateway
- **📊 Google Sheets API** - Data storage and management
- **📧 SMTP** - Email configuration (ready for implementation)

### Development Tools
- **📦 npm** - Package manager
- **🔄 Nodemon** - Auto-reload development server
- **✅ ESLint** - Code quality
- **🚀 Vercel** - Deployment platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git (for version control)

### Installation

```bash
# Clone the repository
git clone https://github.com/doctordreams/vjs-landing.git
cd vjs-landing

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema (for SQLite)
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
vjsdoctordreams/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── dashboard/    # Admin dashboard
│   │   │   └── page.tsx      # Admin login
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin APIs
│   │   │   ├── payment/       # Payment APIs
│   │   │   └── scholarship/   # Scholarship APIs
│   │   ├── payment/           # Payment pages
│   │   │   ├── success/       # Payment success page
│   │   │   └── failure/       # Payment failure page
│   │   └── page.tsx           # Main landing page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── theme/            # Theme components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── db.ts             # Database client
│   │   ├── phonepe.ts        # PhonePe integration
│   │   ├── payu.ts           # PayU integration
│   │   └── google-sheets.ts  # Google Sheets integration
│   └── middleware.ts         # Next.js middleware
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── vercel.json              # Vercel configuration
└── package.json             # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (SQLite for local, PostgreSQL for production)
DATABASE_URL="file:./db/custom.db"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Payment Gateways (Optional - can be configured via admin dashboard)
PHONEPE_MERCHANT_ID=""
PHONEPE_SALT_KEY=""
PHONEPE_SALT_INDEX="1"
PHONEPE_BASE_URL="https://api.phonepe.com"

PAYU_KEY=""
PAYU_SALT=""
PAYU_BASE_URL="https://test.payu.in"

# Google Sheets (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=""
GOOGLE_PRIVATE_KEY=""

# Admin (Optional)
ADMIN_USERNAME="vjsdoctordreams"
ADMIN_PASSWORD_HASH=""

# Payment Test Mode
PAYMENT_TEST_MODE="true"
```

**Note:** Most settings can be configured via the admin dashboard after deployment.

## 🔐 Admin Access

### Default Credentials
- **Username:** `vjsdoctordreams`
- **Password:** `abc123*#$`

**⚠️ Important:** Change the default password immediately after deployment!

### Admin Dashboard Features
- Payment gateway configuration (PhonePe/PayU)
- Google Sheets integration settings
- Email/SMTP configuration
- General application settings
- Theme management

Access the admin dashboard at: `/admin`

## 💳 Payment Integration

### Supported Payment Gateways
1. **PhonePe** - Indian payment gateway
2. **PayU** - International payment gateway

### Payment Flow
1. Student submits scholarship application form
2. Application fee (₹250) payment initiated
3. Redirect to selected payment gateway
4. Payment processing
5. Callback verification
6. Success/failure page display

### Test Mode
Enable test mode by setting `PAYMENT_TEST_MODE="true"` in environment variables. This allows testing the payment flow without actual transactions.

## 📊 Data Management

### Google Sheets Integration
- Automatic data storage to Google Sheets
- Configurable spreadsheet ID
- Service account authentication
- Graceful error handling

### Database
- **Local Development:** SQLite database
- **Production:** PostgreSQL (required for Vercel deployment)

## 🚀 Deployment

### Deploy to Vercel

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Set up PostgreSQL:**
   - Add Vercel Postgres from Storage tab
   - Update `DATABASE_URL` environment variable
   - Update Prisma schema to use PostgreSQL
   - Run migrations: `npm run db:push`

📖 **Detailed deployment guide:** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server with auto-reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database

# Code Quality
npm run lint         # Run ESLint

# Deployment
npm run deploy       # Deploy to Vercel production
```

## 🎨 Theming

The application supports three theme modes:
- **Light** - Default light theme
- **Dark** - Dark mode
- **Bold Tech** - High contrast tech theme

Theme preference is saved in localStorage and persists across sessions.

## 🔒 Security Features

- Session-based admin authentication
- Secure payment hash generation
- API key masking in admin dashboard
- Input validation and sanitization
- Rate limiting on admin login
- HTTPS-ready configuration

## 📚 Documentation

- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete Vercel deployment guide
- **[FEATURES_LIST.md](./FEATURES_LIST.md)** - Comprehensive features documentation
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** - Admin dashboard setup guide
- **[THEME_GUIDE.md](./THEME_GUIDE.md)** - Theme customization guide

## 🐛 Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Run `npm run db:generate` before building
- Check Node.js version (18+ required)

### Database Issues
- For Vercel deployment, use PostgreSQL (not SQLite)
- Verify `DATABASE_URL` format
- Run `npm run db:push` after schema changes

### Payment Gateway Issues
- Verify payment gateway credentials in admin dashboard
- Check `NEXT_PUBLIC_APP_URL` matches production URL
- Test with test mode first

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For issues and questions:
- **Email:** doctordreamsdr2@gmail.com
- **GitHub Issues:** [Create an issue](https://github.com/doctordreams/vjs-landing/issues)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Payment integration with PhonePe and PayU

---

**Made with ❤️ for Vaidya Jyothi Scholarship Program**

*Last Updated: December 2024*
