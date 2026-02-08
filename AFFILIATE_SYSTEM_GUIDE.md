# Affiliate System - Complete Implementation Guide

## Overview

A complete affiliate tracking and commission system with cookie-based attribution, real-time analytics, and automated payout management.

## Features

### ✅ Core Features Implemented

1. **Affiliate Registration**
   - Self-service registration via `/affiliate/register`
   - Payment method configuration (PayPal, Bank Transfer)
   - Auto-approval (configurable to manual approval)

2. **Affiliate Tracking Links**
   - Format: `/go/{tracking_code}?coupon={coupon_id}`
   - Auto-generated unique tracking codes (e.g., `TRK-A3B9K2L5M8`)
   - Support for general links or coupon-specific links

3. **Cookie-Based Attribution**
   - 30-day attribution window
   - Secure, httpOnly cookies
   - Conversion tracking even if user returns later

4. **Click & Conversion Tracking**
   - Real-time click tracking with IP, user-agent, referrer
   - Automatic conversion attribution via cookies
   - Duplicate prevention

5. **Commission System**
   - Configurable commission rates (default 10%)
   - Automatic commission calculation
   - Pending → Available balance flow (30-day approval period)

6. **Balance Management**
   - **Pending Balance**: Commissions awaiting approval (30 days)
   - **Available Balance**: Ready for payout
   - **Total Earnings**: All-time earnings
   - **Total Paid Out**: Historical payouts

7. **Payout System**
   - Minimum payout: $10
   - Self-service payout requests
   - Admin approval workflow
   - Transaction ID tracking

8. **Affiliate Dashboard**
   - Real-time stats (clicks, conversions, CTR)
   - Balance overview
   - Top performing links
   - Recent conversions
   - Payout history

## Database Schema

### Tables Created

1. **Affiliate** - Main affiliate profile
2. **AffiliateLink** - Tracking links
3. **AffiliateClick** - Click tracking records
4. **AffiliateConversion** - Conversion/commission records
5. **PayoutRequest** - Payout requests and history

### Key Relationships

```
User (1) → (1) Affiliate
Affiliate (1) → (Many) AffiliateLink
AffiliateLink (1) → (Many) AffiliateClick
AffiliateLink (1) → (Many) AffiliateConversion
Affiliate (1) → (Many) PayoutRequest
```

## API Endpoints

### Affiliate Management

#### `POST /api/affiliate/register`
Register as an affiliate
```json
{
  "paymentEmail": "affiliate@example.com",
  "paymentMethod": "paypal",
  "bankDetails": "Optional bank details",
  "termsAccepted": true
}
```

#### `GET /api/affiliate/stats`
Get affiliate statistics (requires authentication)

Response:
```json
{
  "affiliate": { "id": "...", "affiliateCode": "AFF-ABC123", ... },
  "balance": {
    "pending": 150.50,
    "available": 250.00,
    "totalEarnings": 1200.00,
    "totalPaidOut": 800.00
  },
  "performance": {
    "totalClicks": 1500,
    "totalConversions": 45,
    "ctr": 3.00,
    "totalLinks": 10
  },
  "recentConversions": [...],
  "topLinks": [...]
}
```

### Link Management

#### `GET /api/affiliate/links`
Get all affiliate links (requires authentication)

#### `POST /api/affiliate/links`
Create a new affiliate link
```json
{
  "couponId": "optional-coupon-id",
  "customTrackingCode": "OPTIONAL-CUSTOM-CODE"
}
```

### Tracking

#### `GET /go/{tracking_code}?coupon={coupon_id}`
Track click and redirect to coupon page
- Sets 30-day attribution cookie
- Records click with tracking data
- Redirects to coupon page

#### `POST /api/affiliate/conversions`
Track a conversion (internal API)
```json
{
  "affiliateLinkId": "link-id",
  "couponId": "optional-coupon-id",
  "orderValue": 100.00,
  "userId": "optional-user-id"
}
```

### Payouts

#### `GET /api/affiliate/payouts`
Get payout history (requires authentication)

#### `POST /api/affiliate/payouts`
Request a payout
```json
{
  "amount": 50.00,
  "paymentMethod": "paypal",
  "paymentEmail": "optional@email.com",
  "paymentDetails": "Optional details"
}
```

### Admin Endpoints

#### `POST /api/admin/affiliate/payouts/{id}`
Approve or reject payout (admin only)
```json
{
  "action": "approve",
  "transactionId": "TXN-123456",
  "rejectionReason": "Only if rejecting"
}
```

### Cron Jobs

#### `POST /api/affiliate/approve-commissions`
Approve pending commissions (30+ days old)
- Requires `CRON_SECRET` in authorization header
- Moves pending → available balance
- Run daily via cron job

## Usage Flow

### 1. Affiliate Registration

```typescript
// User registers as affiliate
const response = await fetch('/api/affiliate/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentEmail: 'user@example.com',
    paymentMethod: 'paypal',
    termsAccepted: true,
  }),
});
```

### 2. Create Affiliate Link

```typescript
// Affiliate creates tracking link
const response = await fetch('/api/affiliate/links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    couponId: 'coupon-id-here', // Optional
  }),
});

// Receive tracking URL: /go/TRK-A3B9K2L5M8
```

### 3. User Clicks Link

```
User clicks: /go/TRK-A3B9K2L5M8?coupon=xyz
↓
System records click (IP, user-agent, referrer)
↓
Sets cookie: affiliate_ref (30 days)
↓
Redirects to: /coupons/xyz
```

### 4. Track Conversion

```typescript
// When user makes purchase/uses coupon
import { trackAffiliateConversion } from '@/lib/helpers/affiliate-tracking';

// Call this after successful purchase
await trackAffiliateConversion(
  couponId,
  orderValue, // Optional: 100.00
  userId      // Optional
);

// System automatically:
// 1. Checks for affiliate cookie
// 2. Creates conversion record
// 3. Calculates commission (10% default)
// 4. Adds to affiliate's pending balance
```

### 5. Commission Approval

```bash
# Run daily cron job
curl -X POST https://your-app.com/api/affiliate/approve-commissions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# This moves 30+ day old commissions from pending → available
```

### 6. Request Payout

```typescript
// Affiliate requests payout
const response = await fetch('/api/affiliate/payouts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50.00,
    paymentMethod: 'paypal',
  }),
});
```

### 7. Admin Processes Payout

```typescript
// Admin approves payout
const response = await fetch('/api/admin/affiliate/payouts/payout-id', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'approve',
    transactionId: 'PAYPAL-TXN-123456',
  }),
});

// System marks as paid and updates totalPaidOut
```

## Integration Examples

### Example: Track Conversion on Coupon Usage

```typescript
// In your coupon redemption handler
import { trackAffiliateConversion } from '@/lib/helpers/affiliate-tracking';

export async function POST(request: NextRequest) {
  // ... your coupon redemption logic ...
  
  // After successful redemption, track affiliate conversion
  await trackAffiliateConversion(
    couponId,
    orderValue, // e.g., 100.00
    userId
  );
  
  return successResponse(/* ... */);
}
```

### Example: Display Affiliate Link in UI

```tsx
// Component to show affiliate link
function AffiliateLinkCard({ link }) {
  const fullUrl = `${window.location.origin}/go/${link.trackingCode}`;
  
  return (
    <div>
      <p>Tracking Code: {link.trackingCode}</p>
      <p>Clicks: {link.totalClicks}</p>
      <p>Conversions: {link.totalConversions}</p>
      <p>CTR: {(link.totalConversions / link.totalClicks * 100).toFixed(2)}%</p>
      <p>Earnings: ${link.totalEarnings.toFixed(2)}</p>
      <button onClick={() => navigator.clipboard.writeText(fullUrl)}>
        Copy Link
      </button>
    </div>
  );
}
```

## Configuration

### Environment Variables

```env
# Required for cron job authentication
CRON_SECRET=your-secret-key-here

# App URL for generating links
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Customization Options

1. **Commission Rate**: Change default in schema or per-affiliate
   ```typescript
   defaultCommissionRate: 10 // Change default percentage
   ```

2. **Attribution Window**: Change cookie expiry
   ```typescript
   // In src/lib/utils/affiliate.ts
   export function getAttributionCookieExpiry(): Date {
     const now = new Date();
     now.setDate(now.getDate() + 30); // Change number of days
     return now;
   }
   ```

3. **Approval Period**: Change commission approval period
   ```typescript
   // In src/lib/utils/affiliate.ts
   export function shouldApproveCommission(
     convertedAt: Date, 
     approvalPeriodDays: number = 30 // Change default
   ): boolean { ... }
   ```

4. **Minimum Payout**: Change in validation schema
   ```typescript
   // In src/lib/validations/affiliate.ts
   amount: z.number().min(10, 'Minimum payout amount is $10')
   ```

## Cron Job Setup

### Vercel Cron (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/affiliate/approve-commissions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Manual Cron (Linux)

```bash
# Add to crontab
0 0 * * * curl -X POST https://your-app.com/api/affiliate/approve-commissions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Dashboard Routes

- `/affiliate` - Main affiliate dashboard
- `/affiliate/register` - Registration page

## Admin Features

Admins can:
- View all payout requests
- Approve/reject payouts
- View affiliate statistics
- Modify commission rates (via database)
- Suspend affiliates

## Testing Checklist

- [ ] Register as affiliate
- [ ] Create affiliate link
- [ ] Click tracking link (opens in incognito to test cookie)
- [ ] Verify click recorded in dashboard
- [ ] Trigger conversion (use coupon)
- [ ] Verify conversion appears in dashboard
- [ ] Verify commission added to pending balance
- [ ] Run commission approval job
- [ ] Verify commission moved to available balance
- [ ] Request payout
- [ ] Admin approve payout
- [ ] Verify payout completed in history

## Security Considerations

1. **Cookie Security**: HttpOnly, Secure (production), SameSite=Lax
2. **Cron Authentication**: Bearer token required
3. **Input Validation**: All inputs validated with Zod
4. **Authorization**: User must be authenticated for all affiliate actions
5. **Admin Protection**: Payout approval requires SUPER_ADMIN role

## Performance Tips

1. **Indexes**: All tracking tables have proper indexes for fast queries
2. **Batch Processing**: Commission approval processes in batches
3. **Caching**: Consider caching affiliate stats for high-traffic dashboards

## Troubleshooting

### Conversions not tracking
- Check if cookie was set (inspect browser cookies)
- Verify `trackAffiliateConversion` is called after purchase
- Check cookie domain matches your app domain

### Commission stuck in pending
- Run the approval cron job
- Check if 30 days have passed since conversion
- Verify `isPending` flag in database

### Payout request fails
- Check available balance >= requested amount
- Verify minimum payout amount ($10)
- Check affiliate status is APPROVED

## Migration

Run the database migration:

```bash
npm run db:push
# or
npm run db:migrate
```

## Next Steps

1. Customize commission rates per coupon/category
2. Add email notifications for conversions and payouts
3. Build admin dashboard for affiliate management
4. Add referral bonuses for recruiting new affiliates
5. Implement tiered commission structures
6. Add fraud detection and duplicate click prevention
