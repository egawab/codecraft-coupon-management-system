# Analytics & Notifications System - Complete Guide

## 🎯 Overview

A comprehensive analytics and notifications system featuring:
- **Real-time analytics** tracking with Redis counters
- **Automated aggregation** using BullMQ workers
- **In-app notifications** with real-time updates
- **Email notifications** with RTL support (React Email + Resend)
- **Multi-language support** (English & Arabic)

## 📊 Analytics System

### Architecture

```
User Action → Redis Counter (Real-time) → BullMQ Queue → Worker → PostgreSQL (Aggregated)
```

### Features

#### Real-time Tracking
- **Views**: Coupon page views with unique visitor tracking
- **Copies**: Code copy events with session-based deduplication
- **Clicks**: Store redirect clicks
- **Session-based uniqueness**: 24-hour session tracking

#### Aggregated Metrics
- Daily summaries stored in PostgreSQL
- Historical data for trend analysis
- Store-level analytics
- Conversion rates (copy rate, click rate, CTR)

### API Endpoints

#### Track Events
```bash
POST /api/analytics/track
{
  "eventType": "view" | "copy" | "click",
  "couponId": "coupon-id",
  "metadata": {}
}
```

#### Get Analytics
```bash
GET /api/analytics/{couponId}?range=7
```

Response:
```json
{
  "realtime": {
    "views": 150,
    "copies": 45,
    "clicks": 32,
    "uniqueViews": 120,
    "copyRate": 30.0,
    "clickRate": 21.3,
    "clickThroughRate": 71.1
  },
  "summary": { /* Combined real-time + historical */ },
  "historical": [/* Daily records */]
}
```

#### Trigger Aggregation (Cron)
```bash
POST /api/analytics/aggregate
Authorization: Bearer CRON_SECRET
```

### Usage in Components

```tsx
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

<AnalyticsDashboard 
  couponId={couponId}
  couponTitle="Summer Sale" 
/>
```

### Client-side Tracking

```tsx
// Track view
await fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'view',
    couponId: 'xxx',
  }),
});

// Track copy
await fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'copy',
    couponId: 'xxx',
  }),
});

// Track click
await fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'click',
    couponId: 'xxx',
  }),
});
```

## 🔔 Notifications System

### Architecture

```
Event → Notification Service → In-app Notification + BullMQ Queue → Email Worker → Resend
```

### Features

#### In-app Notifications
- Real-time notification bell with unread count
- Mark as read functionality
- Mark all as read
- Auto-refresh every 30 seconds
- Responsive popover UI

#### Email Notifications
- **React Email** templates with beautiful designs
- **RTL support** for Arabic/Hebrew
- **Multi-language** content
- Professional layouts with branding

### Notification Types

1. **COUPON_APPROVED** - Coupon approved by admin
2. **COUPON_REJECTED** - Coupon rejected by admin
3. **COUPON_EXPIRING** - Coupon expiring soon
4. **STORE_APPROVED** - Store approved by admin
5. **STORE_REJECTED** - Store rejected by admin
6. **AFFILIATE_CONVERSION** - New affiliate commission
7. **PAYOUT_APPROVED** - Payout approved
8. **PAYOUT_REJECTED** - Payout rejected
9. **NEW_REVIEW** - New store review
10. **NEW_COUPON** - New coupon from favorite store
11. **SYSTEM** - System notifications

### API Endpoints

#### Get Notifications
```bash
GET /api/notifications?unreadOnly=true&limit=50
```

#### Mark as Read
```bash
POST /api/notifications/{id}/read
```

#### Mark All as Read
```bash
POST /api/notifications/read-all
```

### Usage - Notification Service

```typescript
import {
  notifyCouponApproved,
  notifyAffiliateConversion,
  notifyPayoutApproved,
} from '@/lib/notifications';

// Coupon approved
await notifyCouponApproved(
  userId,
  couponId,
  'Summer Sale 50% OFF',
  'SUMMER50',
  'summer-sale-50-off'
);

// Affiliate conversion
await notifyAffiliateConversion(
  affiliateUserId,
  affiliateId,
  couponId,
  'Summer Sale',
  12.50, // commission amount
  10,    // commission rate
  125.00 // order value (optional)
);

// Payout approved
await notifyPayoutApproved(
  userId,
  affiliateId,
  150.00,
  'PayPal',
  'TXN-123456'
);
```

### UI Components

#### Notification Bell
```tsx
import { NotificationBell } from '@/components/NotificationBell';

// Add to header/navbar
<NotificationBell />
```

## 📧 Email Templates

### Available Templates

1. **CouponApproved** - Coupon approval notification
2. **AffiliateConversion** - Commission earned notification
3. **PayoutApproved** - Payout approved notification

### RTL Support

All templates support RTL languages (Arabic, Hebrew):

```tsx
// English
<CouponApprovedEmail locale="en" {...props} />

// Arabic (RTL)
<CouponApprovedEmail locale="ar" {...props} />
```

### Template Structure

```tsx
import { EmailLayout } from './components/Layout';

export default function MyEmail({ locale = 'en', ...props }) {
  const content = {
    en: { /* English content */ },
    ar: { /* Arabic content */ },
  };
  
  const t = content[locale] || content.en;
  
  return (
    <EmailLayout locale={locale} preview={t.preview}>
      {/* Email content */}
    </EmailLayout>
  );
}
```

## 🔧 Setup & Configuration

### 1. Install Dependencies

```bash
npm install ioredis bullmq @react-email/components @react-email/render resend
npm install -D @types/ioredis
```

### 2. Environment Variables

```env
# Redis (local or Upstash)
REDIS_URL=redis://localhost:6379
# OR use existing Upstash
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token

# Email
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=notifications@kobonz.com

# Cron
CRON_SECRET=your-cron-secret

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### 3. Database Migration

```bash
npx prisma db push
```

Creates tables:
- `coupon_analytics`
- `store_analytics`
- `analytics_events`
- `notifications`

### 4. Start Workers

```bash
# Analytics worker
npm run worker:dev

# Or in production
node dist/workers/analytics-worker.js &
node dist/workers/notification-worker.js &
```

### 5. Setup Cron Jobs

#### Vercel
```json
{
  "crons": [
    {
      "path": "/api/analytics/aggregate",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### Linux Crontab
```bash
# Hourly aggregation
0 * * * * curl -X POST https://your-app.com/api/analytics/aggregate \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 📈 Database Schema

### CouponAnalytics
```prisma
model CouponAnalytics {
  id        String   @id
  couponId  String
  date      DateTime
  views     Int
  copies    Int
  clicks    Int
  usages    Int
  shares    Int
  uniqueViews    Int
  uniqueCopies   Int
  uniqueClicks   Int
}
```

### Notification
```prisma
model Notification {
  id        String           @id
  userId    String
  type      NotificationType
  title     String
  message   String
  actionUrl String?
  isRead    Boolean
  emailSent Boolean
  createdAt DateTime
}
```

## 🎨 UI Components Summary

### AnalyticsDashboard
- Real-time metrics display
- Time range selector (7/30/90 days)
- Engagement metrics (CTR, copy rate, click rate)
- Historical trends chart
- Auto-refresh every 30 seconds

### NotificationBell
- Unread count badge
- Real-time notification list
- Mark as read
- Mark all as read
- Formatted timestamps
- Icon indicators per notification type

## 🔄 Data Flow

### Analytics Flow
```
1. User views coupon
2. Frontend calls /api/analytics/track
3. Increment Redis counter
4. Check session for uniqueness
5. Store event in analytics_events table
6. Hourly cron triggers aggregation
7. Worker reads Redis counters
8. Saves to coupon_analytics table
9. Clears Redis counters
10. Dashboard fetches combined data
```

### Notification Flow
```
1. Event occurs (coupon approved, conversion, etc.)
2. Call notification helper (notifyCouponApproved, etc.)
3. Create in-app notification
4. Queue email notification job
5. Worker processes email job
6. Render React Email template
7. Send via Resend
8. Update notification as emailSent
9. User sees in notification bell
10. User clicks -> marks as read
```

## 🚀 Performance Optimizations

### Redis
- Session-based unique tracking (prevents duplicates)
- 48-hour TTL on counters
- Efficient key patterns

### BullMQ
- Concurrent processing (analytics: 1, notifications: 5)
- Rate limiting
- Automatic retries with exponential backoff
- Job cleanup (completed: 1 day, failed: 7 days)

### PostgreSQL
- Indexes on all lookup fields
- Unique constraints on couponId+date
- Efficient upsert operations

### Frontend
- Auto-refresh intervals (30s for analytics, 30s for notifications)
- Optimistic UI updates
- Loading states

## 🧪 Testing

### Test Analytics Tracking
```bash
# Track a view
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"eventType":"view","couponId":"xxx"}'

# Get analytics
curl http://localhost:3000/api/analytics/xxx?range=7
```

### Test Notifications
```typescript
// Create test notification
import { notifyCouponApproved } from '@/lib/notifications';

await notifyCouponApproved(
  'user-id',
  'coupon-id',
  'Test Coupon',
  'TEST50',
  'test-coupon'
);

// Check in-app
// Visit /notifications or click bell icon

// Check email
// Check inbox for email from notifications@kobonz.com
```

### Test Workers
```bash
# Start workers
npm run worker:dev

# Trigger aggregation manually
curl -X POST http://localhost:3000/api/analytics/aggregate \
  -H "Authorization: Bearer your-cron-secret"
```

## 📝 Best Practices

### Analytics
1. Track events on user actions, not page loads
2. Use session IDs for unique tracking
3. Run aggregation hourly during business hours
4. Keep raw events for 30 days, aggregated data forever
5. Cache dashboard data for 5 minutes

### Notifications
1. Always provide actionUrl for context
2. Keep messages concise and actionable
3. Use appropriate notification types
4. Send emails for important events only
5. Respect user notification preferences

### Email Templates
1. Test in multiple email clients
2. Use inline styles (React Email handles this)
3. Include plain text alternative
4. Keep templates under 100KB
5. Test RTL rendering for Arabic content

## 🔐 Security

- ✅ Cron endpoints protected with secrets
- ✅ Notification API requires authentication
- ✅ User can only read their own notifications
- ✅ Rate limiting on email sends
- ✅ Input validation on all endpoints
- ✅ Session-based tracking (no personal data in Redis)

## 📚 Files Created

### Analytics (10 files)
- `src/lib/analytics-redis.ts` - Redis helpers
- `src/lib/utils/analytics.ts` - Tracking functions
- `src/lib/queue.ts` - BullMQ setup
- `src/workers/analytics-worker.ts` - Aggregation worker
- `src/app/api/analytics/track/route.ts` - Tracking endpoint
- `src/app/api/analytics/[couponId]/route.ts` - Get analytics
- `src/app/api/analytics/aggregate/route.ts` - Trigger aggregation
- `src/components/AnalyticsDashboard.tsx` - UI component
- `prisma/schema.prisma` - Updated schema
- `package-additions.json` - Dependencies

### Notifications (11 files)
- `src/lib/notifications.ts` - Notification service
- `src/workers/notification-worker.ts` - Email worker
- `src/app/api/notifications/route.ts` - Get/create notifications
- `src/app/api/notifications/[id]/read/route.ts` - Mark as read
- `src/app/api/notifications/read-all/route.ts` - Mark all as read
- `src/components/NotificationBell.tsx` - UI component
- `src/components/ui/scroll-area.tsx` - Scroll area component
- `emails/components/Layout.tsx` - Email layout
- `emails/CouponApproved.tsx` - Email template
- `emails/AffiliateConversion.tsx` - Email template
- `emails/PayoutApproved.tsx` - Email template

**Total: 21 new files + 1 updated (schema.prisma)**

## ✅ Ready for Production!
