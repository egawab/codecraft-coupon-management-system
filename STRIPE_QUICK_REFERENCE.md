# Stripe Integration - Quick Reference

## 🚀 Quick Commands

### Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev

# Start webhook listener (separate terminal)
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

### Testing
```bash
# Test card numbers
4242 4242 4242 4242  # Success
4000 0000 0000 0002  # Decline
4000 0025 0000 3155  # 3D Secure

# View database
npx prisma studio
```

## 📋 Environment Variables Checklist

```env
✓ STRIPE_SECRET_KEY
✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✓ STRIPE_WEBHOOK_SECRET
✓ STRIPE_BASIC_PRICE_ID
✓ STRIPE_PRO_PRICE_ID
✓ STRIPE_ENTERPRISE_PRICE_ID
```

## 🎯 Key URLs

- Subscription Page: `/store-owner/subscription`
- Stripe Dashboard: `https://dashboard.stripe.com`
- Webhooks: `https://dashboard.stripe.com/webhooks`
- Test Mode: `https://dashboard.stripe.com/test/`

## 💳 Subscription Plans

| Plan       | Price    | Stores | Coupons   | Featured Coupons | Featured Stores |
|------------|----------|--------|-----------|------------------|-----------------|
| FREE       | $0       | 1      | 10        | 0                | 0               |
| BASIC      | $9.99    | 3      | 50        | 1                | 0               |
| PRO        | $29.99   | 10     | Unlimited | 5                | 2               |
| ENTERPRISE | $99.99   | ∞      | ∞         | ∞                | ∞               |

## 💰 Featured Pricing

### Coupons
- 7 days: $4.99
- 14 days: $7.99
- 30 days: $14.99

### Stores
- 7 days: $9.99
- 14 days: $14.99
- 30 days: $24.99

## 🔧 API Endpoints

```typescript
// Create subscription checkout
POST /api/stripe/checkout/subscription
Body: { plan: "BASIC" | "PRO" | "ENTERPRISE" }

// Create featured payment
POST /api/stripe/checkout/featured
Body: { type: "featured_coupon" | "featured_store", resourceId: string, duration: "7" | "14" | "30" }

// Get billing portal
POST /api/stripe/billing-portal

// Get limits
GET /api/subscription/limits

// Cancel subscription
POST /api/subscription/cancel

// Webhooks
POST /api/stripe/webhooks
```

## 🔍 Helper Functions

```typescript
// Check if user can create resources
import { canCreateStore, canCreateCoupon } from '@/lib/subscription-helpers';
await canCreateStore(userId);
await canCreateCoupon(userId);

// Get user's plan and limits
import { getUserLimits, getUserPlan } from '@/lib/subscription-helpers';
const plan = await getUserPlan(userId);
const limits = await getUserLimits(userId);

// Get subscription
import { getUserSubscription } from '@/lib/subscription-helpers';
const subscription = await getUserSubscription(userId);
```

## 🎨 React Components

```tsx
// Subscription plans grid
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
<SubscriptionPlans currentPlan="BASIC" />

// Subscription status widget
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
<SubscriptionStatus userId={userId} />

// Featured payment widget
import { FeaturedPayment } from '@/components/FeaturedPayment';
<FeaturedPayment
  type="featured_coupon"
  resourceId={couponId}
  resourceName="My Coupon"
  isFeatured={false}
  featuredUntil={null}
/>
```

## 📊 Database Models

```prisma
model Subscription {
  stripeSubscriptionId String @unique
  plan                 SubscriptionPlan
  status               SubscriptionStatus
  currentPeriodEnd     DateTime
  // ... more fields
}

model Invoice {
  stripeInvoiceId String @unique
  amount          Float
  status          String
  // ... more fields
}

model Payment {
  stripePaymentIntentId String @unique
  type                  String // subscription, featured_coupon, featured_store
  amount                Float
  // ... more fields
}
```

## 🔔 Webhook Events

| Event | Handler |
|-------|---------|
| `checkout.session.completed` | Creates subscription or processes featured payment |
| `customer.subscription.created` | Creates subscription record |
| `customer.subscription.updated` | Updates subscription details |
| `customer.subscription.deleted` | Cancels subscription |
| `invoice.paid` | Records invoice, confirms payment |
| `invoice.payment_failed` | Marks subscription as past_due |

## ⚡ Common Tasks

### Subscribe User to Plan
```typescript
// Client-side
const res = await fetch('/api/stripe/checkout/subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ plan: 'PRO' })
});
const { data } = await res.json();
window.location.href = data.url;
```

### Feature a Coupon
```typescript
const res = await fetch('/api/stripe/checkout/featured', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'featured_coupon',
    resourceId: 'coupon-id',
    duration: '30'
  })
});
const { data } = await res.json();
window.location.href = data.url;
```

### Open Billing Portal
```typescript
const res = await fetch('/api/stripe/billing-portal', {
  method: 'POST'
});
const { data } = await res.json();
window.location.href = data.url;
```

### Check Limits Before Creating
```typescript
// Server-side
import { canCreateCoupon, getUserLimits } from '@/lib/subscription-helpers';

const allowed = await canCreateCoupon(userId);
if (!allowed) {
  const limits = await getUserLimits(userId);
  throw new Error(
    `Limit reached: ${limits.usage.coupons}/${limits.limits.maxCoupons}`
  );
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not working | Check Stripe CLI is running, verify webhook secret |
| Subscription not updating | Check webhook logs, verify database records |
| Payment failing | Use correct test cards, check Stripe Dashboard |
| Limits not enforcing | Verify subscription exists, check webhook processed |

## 📚 Documentation Files

1. **README_STRIPE.md** - Overview and quick start
2. **STRIPE_SETUP_GUIDE.md** - Detailed setup instructions
3. **STRIPE_TESTING_GUIDE.md** - Testing procedures
4. **STRIPE_INTEGRATION_SUMMARY.md** - Implementation details
5. **STRIPE_QUICK_REFERENCE.md** - This file

## 🎯 Testing Checklist

- [ ] Subscribe to Basic plan
- [ ] Subscribe to Pro plan
- [ ] Subscribe to Enterprise plan
- [ ] Feature a coupon (7, 14, 30 days)
- [ ] Feature a store (7, 14, 30 days)
- [ ] Cancel subscription
- [ ] Access billing portal
- [ ] Test coupon limit enforcement
- [ ] Test store limit enforcement
- [ ] Verify webhooks processing
- [ ] Check database records
- [ ] Test with declined card
- [ ] Test with 3D Secure card

## 🚀 Production Deployment

1. Create production products in Stripe
2. Update environment variables with live keys
3. Configure production webhook endpoint
4. Test with real payment (small amount)
5. Enable Stripe Radar
6. Monitor webhook delivery
7. Set up email notifications

## 📞 Support Links

- [Stripe Docs](https://stripe.com/docs)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Test Cards](https://stripe.com/docs/testing)

---

**Status:** ✅ All systems operational
