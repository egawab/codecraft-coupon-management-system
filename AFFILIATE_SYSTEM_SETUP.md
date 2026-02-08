# Affiliate System - Quick Setup Guide

## Step 1: Database Migration

Run the database migration to create all affiliate tables:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npx prisma db push

# Or run migration
npx prisma migrate dev --name add_affiliate_system
```

This creates the following tables:
- `affiliates`
- `affiliate_links`
- `affiliate_clicks`
- `affiliate_conversions`
- `payout_requests`

## Step 2: Environment Variables

Add to your `.env` file:

```env
# Cron job authentication
CRON_SECRET=your-random-secret-key-here

# App URL (for generating affiliate links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Setup Cron Job (Optional but Recommended)

The commission approval job should run daily to move pending commissions to available balance after 30 days.

### Option A: Vercel Cron

Create `vercel.json`:

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

### Option B: Manual Cron (Linux)

```bash
crontab -e

# Add this line (runs daily at midnight)
0 0 * * * curl -X POST https://your-app.com/api/affiliate/approve-commissions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option C: Node Cron (in your app)

```typescript
// Add to your server startup
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  await fetch('http://localhost:3000/api/affiliate/approve-commissions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`,
    },
  });
});
```

## Step 4: Integrate Conversion Tracking

Add conversion tracking to your coupon redemption logic:

```typescript
// In your coupon usage API route
import { trackAffiliateConversion } from '@/lib/helpers/affiliate-tracking';

export async function POST(request: NextRequest) {
  // ... your existing coupon redemption logic ...
  
  // After successful redemption, add this:
  await trackAffiliateConversion(
    couponId,
    orderValue,  // Optional: total order value
    userId       // Optional: user who made purchase
  );
  
  return successResponse(/* ... */);
}
```

Example locations to add tracking:
- `/api/coupons/redeem` - When user redeems a coupon
- `/api/orders/create` - When order is placed with coupon
- `/api/checkout/complete` - When checkout completes

## Step 5: Test the System

### 1. Register as Affiliate

```bash
# Visit in browser
http://localhost:3000/affiliate/register

# Or via API
curl -X POST http://localhost:3000/api/affiliate/register \
  -H "Content-Type: application/json" \
  -d '{
    "paymentEmail": "test@example.com",
    "paymentMethod": "paypal",
    "termsAccepted": true
  }'
```

### 2. Create Affiliate Link

```bash
curl -X POST http://localhost:3000/api/affiliate/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "couponId": "some-coupon-id"
  }'

# Response includes tracking URL: /go/TRK-XXXXXXXXXX
```

### 3. Test Click Tracking

```bash
# Visit tracking link (use incognito mode to test cookie)
http://localhost:3000/go/TRK-XXXXXXXXXX

# Should redirect to coupon page and set cookie
```

### 4. Test Conversion

```bash
# Simulate a purchase/redemption
curl -X POST http://localhost:3000/api/coupons/redeem \
  -H "Cookie: affiliate_ref=COOKIE_VALUE" \
  -d '{ "couponId": "xxx" }'

# Or use the coupon through your normal flow
# The trackAffiliateConversion function will handle it
```

### 5. Verify in Dashboard

```bash
# Visit dashboard
http://localhost:3000/affiliate

# Check:
# - Click count increased
# - Conversion recorded
# - Pending balance updated
```

### 6. Test Commission Approval

```bash
# Run cron job manually
curl -X POST http://localhost:3000/api/affiliate/approve-commissions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Note: Only approves conversions 30+ days old
# For testing, you can modify the approval period in the code
```

### 7. Test Payout Request

```bash
curl -X POST http://localhost:3000/api/affiliate/payouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 50.00,
    "paymentMethod": "paypal"
  }'
```

## Step 6: Admin Setup

To approve payouts, you need a SUPER_ADMIN user:

```bash
# Update user role in database
npx prisma studio

# Or via SQL
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@example.com';
```

Then approve payouts:

```bash
curl -X POST http://localhost:3000/api/admin/affiliate/payouts/PAYOUT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "action": "approve",
    "transactionId": "PAYPAL-TXN-123"
  }'
```

## Available Routes

### User Routes
- `GET /affiliate` - Affiliate dashboard
- `GET /affiliate/register` - Registration page

### API Routes
- `POST /api/affiliate/register` - Register as affiliate
- `GET /api/affiliate/stats` - Get statistics
- `GET /api/affiliate/links` - Get all links
- `POST /api/affiliate/links` - Create link
- `GET /api/affiliate/payouts` - Get payout history
- `POST /api/affiliate/payouts` - Request payout
- `GET /go/{code}` - Track click & redirect

### Admin Routes
- `POST /api/admin/affiliate/payouts/{id}` - Process payout

### Cron Routes
- `POST /api/affiliate/approve-commissions` - Approve commissions

## Customization

### Change Commission Rate

Edit `prisma/schema.prisma`:

```prisma
model Affiliate {
  defaultCommissionRate Float @default(15) // Change from 10 to 15%
}
```

### Change Attribution Window

Edit `src/lib/utils/affiliate.ts`:

```typescript
export function getAttributionCookieExpiry(): Date {
  const now = new Date();
  now.setDate(now.getDate() + 60); // Change from 30 to 60 days
  return now;
}
```

### Change Approval Period

Edit `src/lib/utils/affiliate.ts`:

```typescript
export function shouldApproveCommission(
  convertedAt: Date, 
  approvalPeriodDays: number = 7 // Change from 30 to 7 days for testing
): boolean {
  // ...
}
```

### Change Minimum Payout

Edit `src/lib/validations/affiliate.ts`:

```typescript
export const payoutRequestSchema = z.object({
  amount: z.number().min(25, 'Minimum payout amount is $25'), // Change from 10 to 25
  // ...
});
```

## Troubleshooting

### Issue: "Affiliate account not found"
**Solution**: User must register as affiliate first via `/affiliate/register`

### Issue: Conversions not tracking
**Solution**: 
1. Check if cookie was set (inspect browser cookies for `affiliate_ref`)
2. Verify `trackAffiliateConversion` is called in your redemption code
3. Check cookie domain matches your app

### Issue: Commission stuck in pending
**Solution**:
1. Run the cron job manually
2. For testing, reduce approval period to 1 day
3. Check database: `SELECT * FROM affiliate_conversions WHERE isPending = true`

### Issue: Cannot request payout
**Solution**:
1. Check available balance >= $10
2. Verify affiliate status is APPROVED
3. Check for error messages in response

### Issue: Prisma client not found
**Solution**:
```bash
npm install @prisma/client
npm run db:generate
```

## Quick Testing Checklist

- [ ] Database migrated successfully
- [ ] Can register as affiliate
- [ ] Receive unique affiliate code
- [ ] Can create affiliate link
- [ ] Tracking link redirects correctly
- [ ] Cookie is set after clicking link
- [ ] Click is recorded in database
- [ ] Conversion tracks when coupon used
- [ ] Commission added to pending balance
- [ ] Commission moves to available after approval
- [ ] Can request payout
- [ ] Admin can approve payout
- [ ] Dashboard shows all stats correctly

## Performance Considerations

- All tables have proper indexes for fast queries
- Commission approval runs in batches
- Consider caching dashboard stats for high traffic
- Use pagination for large conversion lists

## Security Notes

- Cookies are httpOnly and secure in production
- Cron endpoint requires secret token
- All inputs validated with Zod
- Admin actions require SUPER_ADMIN role
- SQL injection protected by Prisma

## Next Steps

1. Set up automated emails for conversions and payouts
2. Add fraud detection for duplicate clicks
3. Create admin dashboard for affiliate management
4. Implement tiered commission structures
5. Add referral bonuses
6. Build analytics reports

## Support

For detailed documentation, see `AFFILIATE_SYSTEM_GUIDE.md`
