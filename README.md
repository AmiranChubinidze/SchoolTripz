# SchoolTripz — School Trips Booking Platform

A full-stack, production-ready school trips booking platform. Built with Next.js (App Router), NestJS, MongoDB, and JWT auth.

---

## Architecture Overview

```
SchoolTripz/
├── backend/          # NestJS REST API
│   └── src/
│       ├── auth/             # JWT + RBAC
│       ├── users/            # User management
│       ├── trips/            # Trip CRUD
│       ├── bookings/         # Booking workflow
│       ├── availability/     # Date/capacity management
│       ├── pricing/          # Server-side price calculator
│       ├── analytics/        # Dashboard stats
│       └── common/           # Guards, decorators
└── frontend/         # Next.js 14 App Router
    ├── app/
    │   ├── page.tsx          # Landing page
    │   ├── trips/            # Public catalog + trip detail
    │   ├── login/ register/  # Auth pages
    │   ├── dashboard/        # Client portal
    │   │   ├── page.tsx      # Overview
    │   │   ├── trips/        # Trip browser
    │   │   ├── builder/      # Trip price builder
    │   │   └── bookings/     # Booking management
    │   └── admin/            # Admin panel
    │       ├── page.tsx      # Dashboard
    │       ├── bookings/     # Kanban pipeline
    │       ├── trips/        # Trip CRUD
    │       ├── users/        # User management
    │       ├── availability/ # Capacity calendar
    │       └── analytics/    # Charts & stats
    ├── components/
    │   ├── ui/               # shadcn/ui components
    │   ├── layout/           # Nav, DashboardLayout, AdminLayout
    │   └── admin/            # Admin-specific components
    └── lib/
        ├── api.ts            # Axios API client
        ├── store.ts          # Zustand auth store
        └── utils.ts          # Helpers
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** 6+ (local or Atlas)
- **npm** or **yarn**

---

## Quick Start

### 1. Clone & Navigate

```bash
cd SchoolTripz
```

### 2. Set Up Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env:
# MONGODB_URI=mongodb://localhost:27017/schooltripz
# JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
# PORT=3001
# CORS_ORIGIN=http://localhost:3000
```

### 3. Seed the Database

```bash
# Still in /backend
npm run seed
```

This creates 3 users and 5 trips. Output:
```
Admin:  admin@schooltripz.com  / Admin123!
Client: sarah@greenviewschool.com / Client123!
Client: mark@stpeterscollege.edu  / Client123!
```

### 4. Start Backend

```bash
npm run start:dev
# API running at http://localhost:3001/api
```

### 5. Set Up Frontend

```bash
cd ../frontend
npm install

# Copy environment file
cp .env.local.example .env.local

# .env.local contains:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 6. Start Frontend

```bash
npm run dev
# App running at http://localhost:3000
```

---

## User Flow

```
Browse (public) → Login/Register → Build Trip → Request Booking
→ Admin Reviews → Admin Approves → Client Confirms → Confirmed
```

**No auto-confirmation.** Every booking goes through admin review.

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Authenticated |

### Trips
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/trips | Public |
| GET | /api/trips/categories | Public |
| GET | /api/trips/slug/:slug | Public |
| GET | /api/trips/:id/pricing | Authenticated |
| GET | /api/trips/admin/all | Admin |
| POST | /api/trips | Admin |
| PATCH | /api/trips/:id | Admin |
| DELETE | /api/trips/:id | Admin |

### Bookings
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/bookings | Client |
| GET | /api/bookings/my | Client |
| GET | /api/bookings/my/:id | Client |
| PATCH | /api/bookings/my/:id/confirm | Client |
| PATCH | /api/bookings/my/:id/cancel | Client |
| GET | /api/bookings/kanban | Admin |
| GET | /api/bookings | Admin |
| GET | /api/bookings/:id | Admin |
| PATCH | /api/bookings/:id/status | Admin |

### Pricing
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/pricing/quote | Authenticated |
| GET | /api/pricing/rules | Admin |
| POST | /api/pricing/rules | Admin |
| PATCH | /api/pricing/rules/:id | Admin |
| DELETE | /api/pricing/rules/:id | Admin |

### Availability
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/availability/trips/:tripId | Authenticated |
| POST | /api/availability/trips/:tripId | Admin |
| POST | /api/availability/trips/:tripId/bulk | Admin |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/users | Admin |
| GET | /api/users/profile | Authenticated |
| PATCH | /api/users/profile | Authenticated |
| GET | /api/users/:id | Admin |
| PATCH | /api/users/:id | Admin |
| DELETE | /api/users/:id | Admin |

### Analytics
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/analytics/dashboard | Admin |

---

## Database Schemas

### User
```
name, email (unique), password (hashed), role (client|admin),
school, phone, isActive
```

### Trip
```
title, slug (unique), description, destination, country,
durationDays, images[], highlights[], includedItems[], excludedItems[],
priceConfig { basePerStudent, basePerAdult, mealPerPersonPerDay, transportSurcharge, extras },
availableTransport[], availableExtras{}, minStudents, maxStudents,
isActive, isFeatured, category, tags[]
```

### Booking
```
client (ref User), trip (ref Trip),
config { students, adults, startDate, mealsPerDay, transportType, selectedExtras[] },
priceBreakdown { baseStudents, baseAdults, meals, transport, extras, total, perStudent },
status (pending|approved|confirmed|cancelled|rejected),
clientNotes, adminNotes, reviewedBy, reviewedAt, confirmedAt, cancelledAt
```

### Availability
```
trip (ref Trip), date, totalCapacity, bookedCount, isAvailable
```

### PricingRule
```
trip (ref Trip, optional), name, ruleType, discountType,
discountValue, minStudents, maxStudents, validFrom, validTo,
daysBeforeTrip, isActive
```

---

## Booking Status Flow

```
PENDING → APPROVED → CONFIRMED
         ↓           ↓
       REJECTED    CANCELLED
```

- Admin can approve/reject PENDING bookings
- Client confirms APPROVED bookings
- Either party can cancel

---

## Design System

- **Style**: Minimalist SaaS
- **Colors**: Slate neutrals + Indigo accent (`#6366f1`)
- **Typography**: Inter (Google Fonts)
- **Icons**: Lucide React (SVG, 24px grid)
- **Components**: shadcn/ui
- **Mobile-first**, accessible, WCAG AA compliant

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/schooltripz
JWT_SECRET=your-32-char-minimum-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Production Deployment

### Backend
```bash
cd backend
npm run build
# Deploy dist/ to your Node.js server
# Set NODE_ENV=production
# Use MongoDB Atlas for database
# Use a strong JWT_SECRET
```

### Frontend
```bash
cd frontend
npm run build
# Deploy .next/ or use Vercel/Netlify
```

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- All admin routes protected with RolesGuard
- Server-side price calculation (client cannot manipulate prices)
- Input validation via class-validator
- Rate limiting via @nestjs/throttler
