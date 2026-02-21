# API Documentation - Simple Cruise Parking

## Base URL
```
Production: https://rsrfvklwthdubufpqjhq.supabase.co/functions/v1
Local: http://localhost:54321/functions/v1
```

---

## Authentication

### Public Endpoints
No authentication required:
- Booking creation
- Price calculation
- Availability check
- Promo code validation

### Admin Endpoints
Require JWT token in Authorization header:
```http
Authorization: Bearer <jwt_token>
```

---

## Public Endpoints

### 1. Calculate Price
Calculate booking price with add-ons and promo codes.

**Endpoint:** `POST /booking-calculate`

**Request:**
```json
{
  "dropOffDate": "2026-03-15T10:00:00Z",
  "returnDate": "2026-03-22T10:00:00Z",
  "addOns": ["ev-charging", "exterior-wash"],
  "promoCode": "FIRST10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "days": 7,
    "basePrice": 8750,
    "addOns": [
      {
        "id": "uuid",
        "name": "EV Charging",
        "price": 3500
      },
      {
        "id": "uuid",
        "name": "Exterior Wash",
        "price": 1500
      }
    ],
    "addOnsTotal": 5000,
    "subtotal": 13750,
    "discount": 1375,
    "vat": 2475,
    "total": 14850,
    "promoCodeApplied": {
      "code": "FIRST10",
      "discountType": "percentage",
      "discountValue": 10
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATES",
    "message": "Return date must be after drop-off date"
  }
}
```

---

### 2. Check Availability
Check if parking is available for given dates.

**Endpoint:** `GET /availability-check`

**Query Parameters:**
- `startDate` (required): ISO 8601 date
- `endDate` (required): ISO 8601 date

**Example:**
```http
GET /availability-check?startDate=2026-03-15&endDate=2026-03-22
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "capacity": 100,
    "dailyBreakdown": {
      "2026-03-15": { "booked": 85, "remaining": 15 },
      "2026-03-16": { "booked": 90, "remaining": 10 },
      "2026-03-17": { "booked": 88, "remaining": 12 }
    },
    "minRemaining": 10,
    "warningThreshold": 20
  }
}
```

---

### 3. Create Booking
Create a new booking and initiate payment.

**Endpoint:** `POST /booking-create`

**Request:**
```json
{
  "customer": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@example.com",
    "phone": "+44 7700 900000"
  },
  "vehicle": {
    "registration": "AB12 CDE",
    "make": "Toyota Corolla"
  },
  "trip": {
    "dropOffDate": "2026-03-15T10:00:00Z",
    "returnDate": "2026-03-22T10:00:00Z",
    "cruiseLine": "P&O Cruises",
    "shipName": "Iona",
    "terminal": "Ocean Terminal",
    "passengers": 2
  },
  "addOns": ["ev-charging"],
  "promoCode": "FIRST10",
  "pricing": {
    "subtotal": 9875,
    "vat": 1975,
    "total": 11850,
    "discount": 1375
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "SCP-1234",
    "bookingId": "uuid",
    "status": "pending",
    "stripeClientSecret": "pi_xxx_secret_xxx",
    "expiresAt": "2026-02-21T12:00:00Z"
  }
}
```

**Flow:**
1. Validate all input data
2. Check availability
3. Create Stripe Payment Intent
4. Create booking record (status: pending)
5. Return client secret for payment
6. Frontend confirms payment
7. Webhook updates status to confirmed

---

### 4. Validate Promo Code
Validate a promotional code.

**Endpoint:** `POST /promo-validate`

**Request:**
```json
{
  "code": "FIRST10",
  "subtotal": 10000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "code": "FIRST10",
    "discountType": "percentage",
    "discountValue": 10,
    "discountAmount": 1000,
    "minimumSpend": null,
    "remainingUses": 45
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROMO_CODE",
    "message": "Promo code has expired"
  }
}
```

---

### 5. Get Booking
Retrieve booking details.

**Endpoint:** `GET /booking-get`

**Query Parameters:**
- `reference` (required): Booking reference (e.g., SCP-1234)
- `email` (required): Customer email

**Example:**
```http
GET /booking-get?reference=SCP-1234&email=john@example.com
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "SCP-1234",
    "status": "confirmed",
    "customer": {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "phone": "+44 7700 900000"
    },
    "vehicle": {
      "registration": "AB12 CDE",
      "make": "Toyota Corolla"
    },
    "trip": {
      "dropOffDate": "2026-03-15T10:00:00Z",
      "returnDate": "2026-03-22T10:00:00Z",
      "cruiseLine": "P&O Cruises",
      "shipName": "Iona",
      "terminal": "Ocean Terminal"
    },
    "addOns": [
      {
        "name": "EV Charging",
        "price": 3500
      }
    ],
    "pricing": {
      "subtotal": 9875,
      "vat": 1975,
      "total": 11850,
      "discount": 1375
    },
    "canCancel": true,
    "cancellationDeadline": "2026-03-13T10:00:00Z",
    "createdAt": "2026-02-20T14:30:00Z",
    "confirmedAt": "2026-02-20T14:35:00Z"
  }
}
```

---

### 6. Update Booking
Update booking details (before drop-off).

**Endpoint:** `PUT /booking-update`

**Request:**
```json
{
  "bookingReference": "SCP-1234",
  "email": "john@example.com",
  "updates": {
    "vehicle": {
      "registration": "XY99 ZZZ",
      "make": "Honda Civic"
    },
    "customer": {
      "phone": "+44 7700 900001"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "SCP-1234",
    "updated": true,
    "message": "Booking updated successfully"
  }
}
```

---

### 7. Cancel Booking
Cancel a booking and process refund.

**Endpoint:** `POST /booking-cancel`

**Request:**
```json
{
  "bookingReference": "SCP-1234",
  "email": "john@example.com",
  "reason": "Change of plans"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "SCP-1234",
    "cancelled": true,
    "refundAmount": 11850,
    "refundProcessed": true,
    "expectedRefundDate": "2026-02-25",
    "message": "Booking cancelled and refund processed"
  }
}
```

**Refund Rules:**
- > 48 hours before drop-off: 100% refund
- 24-48 hours before: 50% refund
- < 24 hours: No refund
- Admin can override

---

## Webhook Endpoints

### 1. Stripe Webhook
Handle Stripe payment events.

**Endpoint:** `POST /stripe-webhook`

**Headers:**
```
Stripe-Signature: xxx
```

**Events Handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Example Event (payment_intent.succeeded):**
```json
{
  "id": "evt_xxx",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 11850,
      "metadata": {
        "bookingReference": "SCP-1234"
      }
    }
  }
}
```

**Processing:**
1. Verify webhook signature
2. Find booking by payment intent ID
3. Update booking status to "confirmed"
4. Update confirmed_at timestamp
5. Send confirmation email
6. Return 200 OK

---

## Admin Endpoints

### 1. Admin Login
Authenticate admin user.

**Endpoint:** `POST /admin-login`

**Request:**
```json
{
  "email": "admin@simplecruiseparking.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "email": "admin@simplecruiseparking.com",
      "role": "admin"
    }
  }
}
```

---

### 2. Get All Bookings (Admin)
Retrieve all bookings with filters.

**Endpoint:** `GET /admin-bookings`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): pending, confirmed, checked_in, completed, cancelled
- `date` (optional): Filter by drop-off date (YYYY-MM-DD)
- `search` (optional): Search by name, email, or registration
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50)

**Example:**
```http
GET /admin-bookings?status=confirmed&date=2026-03-15&page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "bookingReference": "SCP-1234",
        "status": "confirmed",
        "customer": {
          "name": "John Smith",
          "email": "john@example.com",
          "phone": "+44 7700 900000"
        },
        "vehicle": {
          "registration": "AB12 CDE",
          "make": "Toyota Corolla"
        },
        "trip": {
          "dropOffDate": "2026-03-15T10:00:00Z",
          "returnDate": "2026-03-22T10:00:00Z",
          "shipName": "Iona"
        },
        "total": 11850,
        "createdAt": "2026-02-20T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 234,
      "pages": 5
    }
  }
}
```

---

### 3. Update Capacity (Admin)
Update daily capacity.

**Endpoint:** `PUT /admin-capacity`

**Request:**
```json
{
  "date": "2026-03-15",
  "maxCapacity": 120,
  "notes": "Expanded overflow area available"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-15",
    "maxCapacity": 120,
    "currentBookings": 95,
    "remaining": 25
  }
}
```

---

### 4. Export Bookings CSV (Admin)
Export bookings as CSV.

**Endpoint:** `GET /admin-export`

**Query Parameters:**
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD
- `status` (optional): Filter by status

**Response:**
```csv
Reference,Customer Name,Email,Vehicle Reg,Ship,Drop Off,Return,Status,Total
SCP-1234,John Smith,john@example.com,AB12 CDE,Iona,2026-03-15,2026-03-22,confirmed,£118.50
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_DATES` | 400 | Invalid date range |
| `NOT_AVAILABLE` | 409 | No capacity available |
| `INVALID_PROMO_CODE` | 400 | Promo code invalid or expired |
| `BOOKING_NOT_FOUND` | 404 | Booking reference not found |
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `PAYMENT_FAILED` | 402 | Stripe payment failed |
| `CANCELLATION_NOT_ALLOWED` | 403 | Outside cancellation window |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

**Public Endpoints:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Admin Endpoints:**
- 1000 requests per minute

**Exceeded:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 60 seconds."
  }
}
```

---

## Testing

### Local Testing with Supabase CLI
```bash
bun install -g supabase
supabase functions serve
```

### Test with curl
```bash
curl -X POST http://localhost:54321/functions/v1/booking-calculate \
  -H "Content-Type: application/json" \
  -d '{
    "dropOffDate": "2026-03-15T10:00:00Z",
    "returnDate": "2026-03-22T10:00:00Z"
  }'
```

---

**Last Updated:** February 21, 2026
