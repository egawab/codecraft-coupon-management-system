# Kobonz Architecture Documentation

## 🏗️ System Architecture

Kobonz is built using a modern, scalable architecture with clear separation of concerns.

### Technology Stack

```
┌─────────────────────────────────────────────┐
│            Frontend Layer                    │
│  Next.js 14 (App Router) + React 18         │
│  Tailwind CSS + shadcn/ui                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         API Layer (Route Handlers)          │
│  /api/auth, /api/stores, /api/coupons       │
│  Validation (Zod) + Error Handling          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Business Logic Layer               │
│  Service functions + Utilities              │
│  Role-based access control                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            Data Access Layer                │
│         Prisma ORM + PostgreSQL             │
│  Models, Relations, Indexes                 │
└─────────────────────────────────────────────┘
```

## 📁 Project Structure

```
kobonz/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Database seeding script
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth route group (login, register)
│   │   ├── (dashboard)/       # Dashboard route group (protected)
│   │   ├── (public)/          # Public route group
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/
│   │   │   ├── stores/
│   │   │   ├── coupons/
│   │   │   └── categories/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   │
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── forms/             # Form components
│   │   ├── layouts/           # Layout components
│   │   └── shared/            # Shared components
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── utils.ts           # General utilities (cn)
│   │   ├── constants.ts       # App-wide constants
│   │   ├── errors.ts          # Custom error classes
│   │   ├── api-response.ts    # API response helpers
│   │   ├── validations/       # Zod validation schemas
│   │   │   ├── auth.ts
│   │   │   ├── store.ts
│   │   │   └── coupon.ts
│   │   └── utils/             # Utility functions
│   │       ├── slugify.ts
│   │       ├── date.ts
│   │       ├── password.ts
│   │       └── pagination.ts
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Shared types
│   │
│   └── middleware.ts          # Next.js middleware (security headers)
│
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment variables template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── components.json            # shadcn/ui configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└─────────────┘
      │ 1
      │ owns
      │
      ↓ *
┌─────────────┐     * ┌──────────────┐
│    Store    │←──────│StoreCategory │
└─────────────┘       └──────────────┘
      │ 1                    │ *
      │ has                  │ belongs to
      │                      │
      ↓ *                    ↓ 1
┌─────────────┐       ┌─────────────┐
│   Coupon    │       │  Category   │
└─────────────┘       └─────────────┘
      │ 1                    │ 1
      │ has                  │ has
      │                      │
      ↓ *                    ↓ *
┌─────────────┐       ┌─────────────┐
│CouponUsage  │       │  Children   │
└─────────────┘       └─────────────┘

Location Hierarchy:
┌─────────────┐
│   Country   │
└─────────────┘
      │ 1
      ↓ *
┌─────────────┐
│    City     │
└─────────────┘
      │ 1
      ↓ *
┌─────────────┐
│  District   │
└─────────────┘
```

### Core Models

#### User Model
- Primary entity for authentication and authorization
- Supports role-based access (SUPER_ADMIN, STORE_OWNER, AFFILIATE, USER)
- Relations: stores, coupons, affiliateLinks, reviews, favorites

#### Store Model
- Represents merchant stores
- Linked to location hierarchy (Country → City → District)
- Can have multiple categories
- Owner relationship with User

#### Coupon Model
- Discount coupons with various types
- Tracks usage and limits
- Status workflow: PENDING → ACTIVE → EXPIRED
- Relations: store, category, creator, usages

#### Category Model
- Hierarchical structure (parent-child)
- Can be assigned to stores and coupons
- Supports unlimited nesting

#### Location Models
- Three-level hierarchy: Country → City → District
- Enables location-based filtering
- Each level cascades on delete

### Indexes

Strategic indexes for optimal query performance:

```sql
-- User lookups
users(email)
users(role)
users(createdAt)

-- Store queries
stores(slug)
stores(ownerId)
stores(countryId, cityId, districtId)
stores(isActive, isVerified)

-- Coupon searches
coupons(code, slug)
coupons(storeId, categoryId)
coupons(status)
coupons(expiryDate)
coupons(startDate, expiryDate)

-- Location queries
countries(code)
cities(countryId)
districts(cityId)

-- Analytics
coupon_usages(couponId, userId, usedAt)
affiliate_links(code, affiliateId)
```

## 🔒 Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Validate with Zod schema
3. Hash password with bcrypt
4. Verify against database
5. Create session (NextAuth.js)
6. Return JWT token
7. Store in httpOnly cookie
```

### Authorization Levels

```
SUPER_ADMIN
  ├── Manage all users
  ├── Manage all stores
  ├── Manage all coupons
  ├── View analytics
  └── System configuration

STORE_OWNER
  ├── Create/manage own stores
  ├── Create/manage store coupons
  ├── View store analytics
  └── Respond to reviews

AFFILIATE
  ├── Create affiliate links
  ├── View commission reports
  └── Track conversions

USER
  ├── Browse coupons
  ├── Use coupons
  ├── Save favorites
  └── Write reviews
```

### Security Headers (Middleware)

- `X-DNS-Prefetch-Control`: on
- `Strict-Transport-Security`: max-age=63072000
- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: origin-when-cross-origin

## 📡 API Design

### RESTful Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

Stores:
GET    /api/stores              # List stores
POST   /api/stores              # Create store
GET    /api/stores/[id]         # Get store details
PUT    /api/stores/[id]         # Update store
DELETE /api/stores/[id]         # Delete store

Coupons:
GET    /api/coupons             # List coupons
POST   /api/coupons             # Create coupon
GET    /api/coupons/[id]        # Get coupon details
PUT    /api/coupons/[id]        # Update coupon
DELETE /api/coupons/[id]        # Delete coupon
POST   /api/coupons/[id]/use    # Use coupon

Categories:
GET    /api/categories          # List categories
POST   /api/categories          # Create category
GET    /api/categories/[id]     # Get category

Locations:
GET    /api/locations/countries
GET    /api/locations/cities?countryId=xxx
GET    /api/locations/districts?cityId=xxx
```

### Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error Response
{
  "success": false,
  "error": "Error message"
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🚀 Scalability Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling with Prisma
- Database replication for read-heavy operations
- Caching layer (Redis) for frequently accessed data

### Application Optimization
- Server-side rendering with Next.js
- Static generation for public pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Edge caching with CDN

### Horizontal Scaling
- Stateless API design
- Session management with external store
- File uploads to cloud storage (S3, Cloudinary)
- Background job processing (Bull, BullMQ)

## 🔄 Data Flow Example

### Creating a Coupon

```
1. User fills form → Client validation (Zod)
2. Submit to API → Server validation (Zod)
3. Check permissions → Role-based access control
4. Generate slug → Slugify utility
5. Save to database → Prisma transaction
6. Return response → Standardized API response
7. Update UI → Optimistic updates
8. Show toast → Success notification
```

## 📊 Future Enhancements

- [ ] Real-time notifications (WebSocket/Pusher)
- [ ] Full-text search (Elasticsearch/Algolia)
- [ ] Email service integration
- [ ] SMS notifications for coupons
- [ ] Advanced analytics dashboard
- [ ] Machine learning for recommendations
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] GraphQL API option
- [ ] Microservices architecture

## 🧪 Testing Strategy

```
Unit Tests:
  - Utility functions
  - Validation schemas
  - Business logic

Integration Tests:
  - API endpoints
  - Database operations
  - Authentication flow

E2E Tests:
  - User journeys
  - Critical workflows
  - Cross-browser testing
```

## 📦 Deployment

Recommended platforms:
- **Vercel**: Seamless Next.js deployment
- **Neon**: PostgreSQL database
- **Cloudinary**: Image hosting
- **Upstash**: Redis for caching

---

This architecture is designed to be:
- ✅ Scalable
- ✅ Maintainable
- ✅ Type-safe
- ✅ Secure
- ✅ Performance-optimized
