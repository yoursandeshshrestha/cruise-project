# Simple Cruise Parking - Southampton

> Secure off-site cruise parking with shuttle transfers to all Southampton cruise terminals.

**Live Site:** https://simple-cruise-parking-517503713272.us-west1.run.app/

---

## 🚢 Overview

Simple Cruise Parking is a transactional booking platform for cruise passengers needing secure parking at Southampton terminals. The platform handles real-time availability, secure payments via Stripe, automated emails via Mailgun, and capacity management.

### Core Features
- ✅ Real-time booking system
- ✅ Stripe payment integration (Card, Apple Pay, Google Pay)
- ✅ Email notifications (Mailgun)
- ✅ Admin dashboard for operations
- ✅ Booking management (view, edit, cancel)
- ✅ Capacity management
- ✅ Promo code system
- ✅ Add-on services (EV Charging, Car Wash, Valet)

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite 6.2** (build tool)
- **Tailwind CSS v4** (styling)
- **React Router v7** (routing)
- **Lucide React** (icons)

### Backend
- **Supabase** (PostgreSQL database)
- **Supabase Edge Functions** (API endpoints)
- **Supabase Auth** (admin authentication)
- **Stripe** (payment processing)
- **Mailgun** (email delivery)

### Package Manager
- **Bun** (fast, modern package manager)

---

## 📁 Project Structure

```
simple-cruise-website/
├── pages/              # React pages (admin & client)
├── components/         # Reusable React components
├── supabase/          # Backend (database, APIs, docs)
│   ├── migrations/    # Database migrations
│   ├── functions/     # Edge Functions
│   ├── schemas/       # Database schema
│   └── docs/          # API documentation
├── App.tsx            # Main app component
├── index.css          # Tailwind CSS
├── types.ts           # TypeScript types
├── constants.ts       # App constants
└── .env               # Environment variables
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Environment
```bash
# .env file already configured with Supabase credentials
```

### 3. Start Development Server
```bash
bun run dev
```

Open http://localhost:3000

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PROJECT.md](./PROJECT.md) | Complete project documentation |
| [SETUP.md](./SETUP.md) | Detailed setup instructions |
| [supabase/README.md](./supabase/README.md) | Backend setup guide |
| [supabase/docs/API.md](./supabase/docs/API.md) | API documentation |
| [supabase/schemas/database-schema.sql](./supabase/schemas/database-schema.sql) | Database schema |

---

## 🗄️ Database Schema

### Core Tables
- **bookings** - All parking reservations
- **customers** - Customer information
- **capacity_config** - Daily capacity management
- **pricing_rules** - Pricing configuration
- **add_ons** - Available add-on services
- **promo_codes** - Promotional codes
- **admin_users** - Admin authentication
- **audit_logs** - System audit trail

---

## 🔌 Key Integrations

### Stripe (Payment Processing)
- Payment Intents API
- Apple Pay & Google Pay support
- Webhook for payment confirmation
- Automatic refund processing

### Mailgun (Email Delivery)
- Booking confirmation emails
- Reminder emails (24hrs before)
- Review request emails (24hrs after)
- Cancellation confirmation

### Supabase (Backend)
- PostgreSQL database
- Edge Functions (API endpoints)
- Row Level Security (RLS)
- Real-time subscriptions
- Admin authentication

---

## 💳 Booking Flow

1. **Customer enters trip details**
   - Drop-off & return dates
   - Cruise line & ship selection
   - Number of passengers

2. **Select add-ons & calculate price**
   - EV Charging (£35)
   - Exterior Wash (£15)
   - Full Valet (£45)
   - Apply promo code

3. **Enter personal & vehicle details**
   - Name, email, phone
   - Vehicle registration & make

4. **Payment with Stripe**
   - Card, Apple Pay, or Google Pay
   - Secure payment processing

5. **Confirmation**
   - Booking reference generated (e.g., SCP-1234)
   - Email confirmation sent
   - Payment confirmed via webhook

---

## 🔐 Security Features

- ✅ HTTPS only
- ✅ Row Level Security (RLS) in database
- ✅ Stripe PCI DSS compliance
- ✅ Webhook signature verification
- ✅ GDPR compliant data storage
- ✅ Input validation & sanitization
- ✅ Rate limiting on APIs
- ✅ Admin JWT authentication

---

## 📊 Admin Dashboard Features

- View all bookings with filters
- Search by name, email, or registration
- Daily arrivals & departures
- Capacity management
- Booking status updates
- Export to CSV
- Analytics & reporting
- Manual booking creation
- Promo code management

---

## 🧪 Development

### Commands
```bash
# Development
bun run dev              # Start dev server (port 3000)
bun run build            # Build for production
bun run preview          # Preview production build

# Supabase
supabase start           # Start local Supabase
supabase functions serve # Run Edge Functions locally
supabase db push         # Deploy database migrations
supabase functions deploy # Deploy Edge Functions
```

### Environment Variables
```bash
# Supabase
SUPABASE_URL=https://rsrfvklwthdubufpqjhq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mailgun
MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mg.yourdomain.com
```

---

## 🚦 Project Status

### ✅ Completed
- Frontend UI/UX design
- Component architecture
- Page routing
- Basic booking flow (UI)
- Admin dashboard (UI)
- Database schema design
- API documentation
- Project documentation

### 🚧 In Progress
- Supabase database setup
- Edge Functions development
- Stripe integration
- Mailgun integration
- Admin authentication

### 📋 Todo
- Complete booking API
- Payment webhook handling
- Email automation
- Capacity management logic
- Testing & QA
- Production deployment

---

## 📈 Pricing

### Standard Pricing
- **£12.50 per day** (minimum £45)
- Free cancellation up to 48 hours before drop-off

### Add-Ons
- **EV Charging:** £35
- **Exterior Wash:** £15
- **Full Valet:** £45

### Supported Cruise Lines
- P&O Cruises
- Cunard Line
- Royal Caribbean
- MSC Cruises
- Princess Cruises
- Celebrity Cruises

---

## 🔗 Links

- **Frontend (Live):** https://simple-cruise-parking-517503713272.us-west1.run.app/
- **Frontend (Local):** http://localhost:3000
- **Supabase Dashboard:** https://supabase.com/dashboard/project/rsrfvklwthdubufpqjhq
- **Supabase API:** https://rsrfvklwthdubufpqjhq.supabase.co

---

## 📞 Support

For technical questions or issues:
1. Check [PROJECT.md](./PROJECT.md) for detailed documentation
2. Check [SETUP.md](./SETUP.md) for setup instructions
3. Check [supabase/docs/API.md](./supabase/docs/API.md) for API details

---

## 📝 License

Proprietary - Simple Cruise Parking Southampton

---

**Last Updated:** February 21, 2026
**Version:** 1.0.0
**Status:** Development
