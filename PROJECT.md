# Simple Cruise Parking - Project Documentation

## 🚢 Project Overview

**Simple Cruise Parking** is a transactional booking platform for Southampton-based cruise terminal parking service. It provides secure off-site parking with shuttle transfers to all Southampton cruise terminals.

**Live Frontend:** https://simple-cruise-parking-517503713272.us-west1.run.app/

---

## 🎯 Business Model

### Core Service
- **Service Type:** Park and Ride
- **Location:** Southampton, UK
- **Pricing:** £12.50/day (minimum £45)
- **Transfer Time:** 10 minutes to all cruise terminals
- **Security:** CCTV monitored, gated facility

### Add-On Services
- EV Charging: £35
- Exterior Wash: £15
- Full Valet: £45

### Supported Cruise Lines
- **P&O Cruises:** Iona, Arvia, Britannia, Ventura, Arcadia, Aurora
- **Cunard:** Queen Mary 2, Queen Victoria, Queen Anne
- **Royal Caribbean**
- **MSC Cruises**
- **Princess Cruises**
- **Celebrity Cruises**

### Terminals Served
- Ocean Terminal
- Mayflower Terminal
- City Cruise Terminal
- QEII Terminal
- Horizon Cruise Terminal

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7 (BrowserRouter)
- **Icons:** Lucide React
- **PDF Generation:** jsPDF

### Backend Stack
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **APIs:** Supabase Edge Functions
- **Payment Gateway:** Stripe (Payment Intents API)
- **Email Service:** Mailgun
- **Real-time:** Supabase Realtime

### Project Structure
```
simple-cruise-website/
├── pages/
│   ├── admin/
│   │   └── AdminDashboard/
│   └── client/
│       ├── Home/
│       ├── BookingFlow/
│       ├── ManageBooking/
│       └── [other pages]/
├── components/
│   └── client/
│       ├── Layout/
│       ├── Header/
│       ├── Footer/
│       ├── Button/
│       └── [other components]/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── schemas/
│   └── seed/
├── types.ts
├── constants.ts
└── index.css
```

---

## 📊 Key Features

### Customer Features
- [x] View services and pricing
- [x] Calculate instant quotes
- [ ] Real-time availability checking
- [ ] Secure online booking
- [ ] Stripe payment (Card, Apple Pay, Google Pay)
- [ ] Email confirmation
- [ ] Booking management (view/edit/cancel)
- [ ] Apply promo codes
- [ ] Select add-on services
- [ ] Review system

### Admin Features
- [x] Dashboard overview (mock data)
- [ ] Authentication system
- [ ] View all bookings
- [ ] Filter by date/status
- [ ] Search by registration/name
- [ ] Daily arrivals/departures view
- [ ] Export CSV reports
- [ ] Add internal notes
- [ ] Manual booking creation
- [ ] Capacity management
- [ ] Override capacity
- [ ] Pricing configuration
- [ ] Promo code management

---

## 🔐 Security & Compliance

### Requirements
- ✅ HTTPS only
- ✅ GDPR compliant data storage
- [ ] PCI DSS compliance (via Stripe)
- [ ] Row Level Security (RLS) in Supabase
- [ ] Encrypted database connections
- [ ] Secure environment variables
- [ ] Webhook signature verification
- [ ] CSRF protection
- [ ] Input validation and sanitization
- [ ] Rate limiting
- [ ] reCAPTCHA on forms

---

## 💳 Payment Integration (Stripe)

### Implementation Requirements
- Use Payment Intents API
- Support Apple Pay and Google Pay
- Create payment intent server-side
- Confirm payment client-side
- Use webhooks for:
  - Successful payment confirmation
  - Failed payment handling
  - Refund event logging
- **NEVER** confirm booking without webhook validation
- All pricing logic server-side only

### Payment Flow
1. Customer completes booking form
2. Server creates Stripe Payment Intent
3. Client confirms payment with Stripe
4. Stripe webhook confirms success
5. Server updates booking status to "confirmed"
6. Mailgun sends confirmation email

---

## 📧 Email Integration (Mailgun)

### Email Types

#### 1. Booking Confirmation (Immediate)
- Booking reference
- Drop-off & return dates/times
- Facility address
- Arrival instructions
- Selected add-ons
- Total paid
- Manage booking link

#### 2. Reminder Email (24hrs before drop-off)
- Booking details
- Directions
- Contact number

#### 3. Review Request (24hrs after return)
- Thank you message
- Review link
- Feedback form

#### 4. Cancellation Confirmation
- Cancellation details
- Refund information

---

## 📦 Database Schema (PostgreSQL/Supabase)

### Core Tables

#### `bookings`
```sql
id (UUID, PK)
booking_reference (VARCHAR, UNIQUE)
customer_id (UUID, FK)
first_name (VARCHAR)
last_name (VARCHAR)
email (VARCHAR)
phone (VARCHAR)
vehicle_registration (VARCHAR)
vehicle_make (VARCHAR)
cruise_line (VARCHAR)
ship_name (VARCHAR)
terminal (VARCHAR)
drop_off_datetime (TIMESTAMPTZ)
return_datetime (TIMESTAMPTZ)
number_of_passengers (INTEGER)
parking_type (VARCHAR)
add_ons (JSONB)
subtotal (INTEGER) -- in pence
vat (INTEGER) -- in pence
total (INTEGER) -- in pence
stripe_payment_intent_id (VARCHAR)
status (ENUM: pending, confirmed, checked_in, completed, cancelled)
cancellation_reason (TEXT)
internal_notes (TEXT)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

#### `customers` (Optional - for accounts)
```sql
id (UUID, PK)
email (VARCHAR, UNIQUE)
first_name (VARCHAR)
last_name (VARCHAR)
phone (VARCHAR)
created_at (TIMESTAMPTZ)
```

#### `capacity_config`
```sql
id (UUID, PK)
date (DATE, UNIQUE)
max_capacity (INTEGER)
current_bookings (INTEGER)
override_capacity (INTEGER, NULL)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

#### `pricing_rules`
```sql
id (UUID, PK)
name (VARCHAR)
price_per_day (INTEGER) -- in pence
minimum_charge (INTEGER) -- in pence
start_date (DATE, NULL) -- for seasonal pricing
end_date (DATE, NULL)
is_active (BOOLEAN)
created_at (TIMESTAMPTZ)
```

#### `add_ons`
```sql
id (UUID, PK)
name (VARCHAR)
description (TEXT)
price (INTEGER) -- in pence
icon (VARCHAR)
is_active (BOOLEAN)
display_order (INTEGER)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

#### `promo_codes`
```sql
id (UUID, PK)
code (VARCHAR, UNIQUE)
discount_type (ENUM: percentage, fixed)
discount_value (INTEGER)
minimum_spend (INTEGER, NULL) -- in pence
max_uses (INTEGER, NULL)
current_uses (INTEGER)
valid_from (TIMESTAMPTZ)
valid_until (TIMESTAMPTZ)
is_active (BOOLEAN)
created_at (TIMESTAMPTZ)
```

#### `admin_users`
```sql
id (UUID, PK)
email (VARCHAR, UNIQUE)
role (ENUM: admin, manager, staff)
last_login (TIMESTAMPTZ)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

#### `audit_logs`
```sql
id (UUID, PK)
user_id (UUID, FK)
action (VARCHAR)
table_name (VARCHAR)
record_id (UUID)
old_values (JSONB)
new_values (JSONB)
ip_address (INET)
created_at (TIMESTAMPTZ)
```

---

## 🔌 API Endpoints (Supabase Edge Functions)

### Public Endpoints
```
POST   /api/bookings/calculate-price
POST   /api/bookings/create
GET    /api/bookings/:reference
PUT    /api/bookings/update
POST   /api/bookings/cancel
GET    /api/availability/check
POST   /api/promo-codes/validate
```

### Webhook Endpoints
```
POST   /api/webhooks/stripe
POST   /api/webhooks/mailgun
```

### Admin Endpoints (Protected)
```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/bookings
GET    /api/admin/bookings/:id
POST   /api/admin/bookings/create
PUT    /api/admin/bookings/:id
DELETE /api/admin/bookings/:id
GET    /api/admin/capacity
PUT    /api/admin/capacity
GET    /api/admin/analytics
GET    /api/admin/export/csv
POST   /api/admin/promo-codes
PUT    /api/admin/promo-codes/:id
```

---

## 🚦 Booking Flow

### Step 1: Trip Details
- Drop-off date & time (08:00-15:00)
- Return date & time (06:00-11:00)
- Cruise line selection
- Ship name (filtered by cruise line)
- Number of passengers (1-8)

### Step 2: Parking & Add-ons
- Park and Ride (included)
- Optional add-ons:
  - EV Charging (£35)
  - Exterior Wash (£15)
  - Full Valet (£45)
- Live price calculation

### Step 3: Your Details
- Vehicle registration & make/model
- First name & last name
- Email & mobile
- Optional promo code

### Step 4: Payment
- Payment method:
  - Card (Stripe Elements)
  - Google Pay (Stripe)
  - Apple Pay (Stripe)
- Terms & conditions acceptance

### Step 5: Confirmation
- Booking reference (e.g., SCP-1234)
- Confirmation email sent
- Return to home

---

## 📈 Capacity Management

### Logic
- Set maximum capacity per day
- Track total active bookings per day
- Calculate based on drop-off and return date overlap
- Block bookings when capacity reached
- Admin can override capacity
- Consider:
  - Drop-off date counts as occupied
  - Return date still counts as occupied (until pickup)
  - Overlap calculation critical

### Example
```
Capacity: 100 spaces
Date: 2026-03-15

Bookings on this date:
- Arriving: 30
- Departing: 20
- Already parked: 45
Total: 95/100 (5 spaces available)
```

---

## 🎯 Pricing Logic

### Base Calculation
```javascript
days = Math.ceil((return_date - drop_off_date) / (1000 * 60 * 60 * 24))
base_price = max(days * 1250, 4500) // £12.50/day, min £45

add_ons_total = sum(selected_add_ons.map(a => a.price))
subtotal = base_price + add_ons_total

vat = subtotal * 0.20
total = subtotal + vat
```

### Seasonal Pricing (Future)
- Peak season multiplier
- Special event pricing
- Dynamic yield pricing

---

## 🔄 Cancellation Policy

### Rules
- Free cancellation up to 48 hours before drop-off
- After 48 hours: 50% refund
- Within 24 hours: No refund
- Admin can override

### Refund Process
1. Customer requests cancellation
2. System checks policy eligibility
3. Calculate refund amount
4. Create Stripe refund
5. Update booking status
6. Send cancellation confirmation email

---

## 🎨 Design System

### Colors
- **Primary:** #00A9FE (bright blue)
- **Primary Dark:** #0095E5
- **Brand Dark:** #001848 (navy)
- **Neutral Light:** #F4F4F4

### Typography
- **Font:** Poppins (400, 500, 600, 700)

### Shadows
- **Light:** 0 2px 4px rgba(0,0,0,0.08)
- **Medium:** 0 4px 10px rgba(0,0,0,0.12)

---

## 🚀 Development Phases

### Phase 1: Database Setup ✅ (Week 1)
- [x] Create Supabase project
- [ ] Design database schema
- [ ] Create migrations
- [ ] Set up RLS policies
- [ ] Seed initial data

### Phase 2: Core APIs (Week 2)
- [ ] Booking creation API
- [ ] Price calculation API
- [ ] Availability check API
- [ ] Stripe integration
- [ ] Webhook handlers

### Phase 3: Email Integration (Week 2)
- [ ] Mailgun setup
- [ ] Email templates
- [ ] Confirmation emails
- [ ] Reminder emails
- [ ] Review request emails

### Phase 4: Admin Dashboard (Week 3)
- [ ] Admin authentication
- [ ] Booking management
- [ ] Capacity management
- [ ] Analytics dashboard
- [ ] CSV export

### Phase 5: Customer Features (Week 4)
- [ ] Manage booking page
- [ ] Booking amendments
- [ ] Cancellation flow
- [ ] Promo code system

### Phase 6: Testing & Deployment (Week 5)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit
- [ ] Production deployment

---

## 📝 Environment Variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_URL=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Mailgun
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=

# Application
APP_URL=
ADMIN_JWT_SECRET=

# Google Analytics
GA4_MEASUREMENT_ID=
```

---

## 🐛 Known Issues & Bottlenecks

### Critical Blockers
- ❌ No backend database (all mock data)
- ❌ No authentication system
- ❌ No payment processing
- ❌ No email system
- ❌ No capacity management
- ❌ No data persistence

### High Priority
- ⚠️ Admin dashboard completely public
- ⚠️ No booking validation
- ⚠️ No real-time availability
- ⚠️ No webhook handling

### Medium Priority
- ⚠️ No customer accounts
- ⚠️ No booking amendments
- ⚠️ No analytics tracking
- ⚠️ No error logging

---

## 📚 Important Rules

1. **NO payment logic in frontend** - Always server-side
2. **NO booking confirmation without Stripe webhook**
3. **NO plaintext storage of sensitive data**
4. **ALL prices calculated server-side**
5. **ALL dates stored in UTC**
6. **ALL money stored in pence/cents (integer)**
7. **NEVER trust client-side calculations**
8. **ALWAYS validate capacity before confirming**
9. **ALWAYS verify webhook signatures**
10. **ALWAYS use parameterized queries**

---

## 🔮 Future Enhancements

- SMS notifications (Twilio)
- Live shuttle tracking
- Loyalty points system
- Referral codes
- Dynamic yield pricing
- Multi-yard support
- Mobile native app
- Customer accounts
- Automated cruise schedule integration
- Advanced analytics

---

## 📞 Support & Contact

For technical issues or questions, refer to:
- **Frontend Repo:** [Current project]
- **Backend Docs:** `/supabase/README.md`
- **API Docs:** `/supabase/docs/API.md`

---

**Last Updated:** February 21, 2026
**Version:** 1.0.0
**Status:** Development
