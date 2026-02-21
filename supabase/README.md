# Supabase Backend - Simple Cruise Parking

This directory contains all backend infrastructure for the Simple Cruise Parking platform.

## 📁 Directory Structure

```
supabase/
├── migrations/          # Database schema migrations
│   └── 001_initial_schema.sql
├── functions/           # Edge Functions (API endpoints)
│   ├── booking-create/
│   ├── booking-calculate/
│   ├── stripe-webhook/
│   └── mailgun-integration/
├── schemas/            # Database schema documentation
│   └── database-schema.sql
├── seed/               # Seed data for development
│   └── seed-data.sql
├── docs/               # API documentation
│   ├── API.md
│   └── WEBHOOKS.md
└── tests/              # Backend tests
    └── api.test.ts
```

---

## 🚀 Quick Start

### 1. Install Supabase CLI
```bash
bun install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to Project
```bash
supabase link --project-ref rsrfvklwthdubufpqjhq
```

### 4. Pull Remote Schema (if exists)
```bash
supabase db pull
```

### 5. Run Migrations Locally
```bash
supabase db reset
```

---

## 🗄️ Database Management

### Create New Migration
```bash
supabase migration new migration_name
```

### Apply Migrations
```bash
# Local
supabase db reset

# Production
supabase db push
```

### View Database
```bash
supabase db branch list
```

---

## ⚡ Edge Functions

### Create New Function
```bash
supabase functions new function-name
```

### Deploy Function
```bash
supabase functions deploy function-name
```

### Test Function Locally
```bash
supabase functions serve
```

### View Logs
```bash
supabase functions logs function-name
```

---

## 🔐 Environment Variables

### Local Development
Create `.env.local` in root:
```bash
SUPABASE_URL=https://rsrfvklwthdubufpqjhq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mg.yourdomain.com
```

### Production
Set in Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add environment variables
3. Redeploy functions

---

## 📊 Database Schema Overview

### Core Tables
- `bookings` - All booking records
- `customers` - Customer information (optional)
- `capacity_config` - Daily capacity management
- `pricing_rules` - Pricing configuration
- `add_ons` - Available add-on services
- `promo_codes` - Promotional codes
- `admin_users` - Admin authentication
- `audit_logs` - System audit trail

### Key Relationships
```
customers (1) ─────< (n) bookings
capacity_config (1) ─────< (n) bookings (by date)
pricing_rules (1) ─────< (n) bookings
```

---

## 🔒 Row Level Security (RLS)

### Bookings Table Policies

**Public Access:**
- ✅ CREATE: Anyone can create bookings
- ✅ READ: Users can read their own bookings (by reference + email)
- ❌ UPDATE: Only via specific API endpoints
- ❌ DELETE: Admin only

**Admin Access:**
- ✅ Full CRUD on all tables

### Example Policy
```sql
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (
  email = current_setting('request.jwt.claims')::json->>'email'
  OR
  auth.role() = 'admin'
);
```

---

## 🔌 API Endpoints

### Public APIs

#### Calculate Price
```http
POST /api/bookings/calculate-price
Content-Type: application/json

{
  "dropOffDate": "2026-03-15T10:00:00Z",
  "returnDate": "2026-03-22T10:00:00Z",
  "addOns": ["ev-charging", "exterior-wash"],
  "promoCode": "SUMMER10"
}

Response: {
  "days": 7,
  "basePrice": 8750,
  "addOnsTotal": 5000,
  "subtotal": 13750,
  "vat": 2750,
  "total": 16500,
  "discount": 1375
}
```

#### Create Booking
```http
POST /api/bookings/create
Content-Type: application/json

{
  "customer": { ... },
  "trip": { ... },
  "vehicle": { ... },
  "addOns": [],
  "promoCode": "",
  "total": 16500
}

Response: {
  "bookingReference": "SCP-1234",
  "stripeClientSecret": "pi_xxx_secret_xxx",
  "status": "pending"
}
```

#### Check Availability
```http
GET /api/availability/check?start=2026-03-15&end=2026-03-22

Response: {
  "available": true,
  "capacity": 100,
  "booked": 85,
  "remaining": 15
}
```

### Webhook Endpoints

#### Stripe Webhook
```http
POST /api/webhooks/stripe
Stripe-Signature: xxx

Handles:
- payment_intent.succeeded
- payment_intent.failed
- charge.refunded
```

### Admin APIs

#### Get All Bookings
```http
GET /api/admin/bookings?status=confirmed&date=2026-03-15
Authorization: Bearer <admin_jwt>

Response: {
  "bookings": [...],
  "total": 45,
  "page": 1
}
```

---

## 📧 Email Templates (Mailgun)

### Template Structure
```
/supabase/functions/mailgun-integration/
├── templates/
│   ├── booking-confirmation.html
│   ├── booking-reminder.html
│   ├── booking-cancelled.html
│   └── review-request.html
```

### Sending Emails
```typescript
await sendEmail({
  to: customer.email,
  template: 'booking-confirmation',
  variables: {
    bookingReference: 'SCP-1234',
    customerName: 'John Smith',
    dropOffDate: '15 March 2026',
    // ...
  }
});
```

---

## 🧪 Testing

### Run Tests
```bash
npm run test:supabase
```

### Test Coverage
- [ ] Booking creation flow
- [ ] Price calculation accuracy
- [ ] Capacity validation
- [ ] Stripe webhook handling
- [ ] Email sending
- [ ] Promo code validation
- [ ] Admin authentication

---

## 📈 Monitoring & Logging

### View Logs
```bash
# Edge Function logs
supabase functions logs function-name

# Database logs
supabase logs db
```

### Error Tracking
- All errors logged to `audit_logs` table
- Critical errors trigger admin notifications
- Stripe webhook failures retry automatically

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy-supabase.yml
name: Deploy Supabase

on:
  push:
    branches: [main]
    paths:
      - 'supabase/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy migrations
        run: supabase db push
      - name: Deploy functions
        run: supabase functions deploy --all
```

---

## 📊 Capacity Management Logic

### Algorithm
```typescript
function checkAvailability(startDate, endDate) {
  // Get all bookings that overlap with date range
  const overlapping = bookings.filter(b =>
    (b.drop_off_date <= endDate && b.return_date >= startDate)
  );

  // Calculate daily occupancy
  const dailyOccupancy = {};
  for (let date = startDate; date <= endDate; date++) {
    dailyOccupancy[date] = overlapping.filter(b =>
      b.drop_off_date <= date && b.return_date >= date
    ).length;
  }

  // Find maximum occupancy in range
  const maxOccupancy = Math.max(...Object.values(dailyOccupancy));

  // Check against capacity
  const capacity = getCapacity(startDate, endDate);
  return maxOccupancy < capacity;
}
```

---

## 🚨 Important Notes

1. **Never bypass webhook verification** - Always validate Stripe signatures
2. **Always use transactions** - For booking + capacity updates
3. **Store prices in pence** - Avoid floating point issues
4. **UTC everywhere** - All timestamps in UTC
5. **Rate limit public APIs** - Prevent abuse
6. **Backup regularly** - Automated daily backups enabled
7. **Monitor webhook health** - Set up alerts for failures
8. **Test webhooks locally** - Use Stripe CLI for testing

---

## 📞 Supabase Support

- **Dashboard:** https://supabase.com/dashboard/project/rsrfvklwthdubufpqjhq
- **Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com

---

## 🔗 Quick Links

- [Database Schema](./schemas/database-schema.sql)
- [API Documentation](./docs/API.md)
- [Webhook Documentation](./docs/WEBHOOKS.md)
- [Main Project Docs](../PROJECT.md)

---

**Last Updated:** February 21, 2026
