# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for your Kobonz application.

## Features Implemented

✅ **Subscription Plans for Stores**
- FREE: 1 store, 10 coupons
- BASIC ($9.99/month): 3 stores, 50 coupons, 1 featured coupon
- PRO ($29.99/month): 10 stores, unlimited coupons, 5 featured coupons, 2 featured stores
- ENTERPRISE ($99.99/month): Unlimited everything

✅ **Stripe Checkout**
- Subscription checkout with trial periods
- One-time payments for featured coupons/stores
- Billing portal for subscription management

✅ **Webhook Handlers**
- `invoice.paid` - Records invoice and updates subscription
- `invoice.payment_failed` - Marks subscription as past due
- `customer.subscription.created` - Creates new subscription
- `customer.subscription.updated` - Updates subscription details
- `customer.subscription.deleted` - Cancels subscription
- `checkout.session.completed` - Handles payment completion

✅ **Featured Coupons & Stores**
- Pay-per-promotion model (7, 14, or 30 days)
- Automatic expiration tracking

✅ **Subscription State Enforcement**
- Limits enforced when creating stores/coupons
- Real-time usage tracking
- Upgrade prompts when limits reached

## Setup Instructions

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js @radix-ui/react-progress
```

### 2. Configure Stripe Dashboard

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Create products and prices for each subscription plan:

#### Create Products & Prices

**Basic Plan:**
```
Product Name: Kobonz Basic Plan
Price: $9.99/month (recurring)
Price ID: Save this as STRIPE_BASIC_PRICE_ID
Product ID: Save this as STRIPE_BASIC_PRODUCT_ID
```

**Pro Plan:**
```
Product Name: Kobonz Pro Plan
Price: $29.99/month (recurring)
Price ID: Save this as STRIPE_PRO_PRICE_ID
Product ID: Save this as STRIPE_PRO_PRODUCT_ID
```

**Enterprise Plan:**
```
Product Name: Kobonz Enterprise Plan
Price: $99.99/month (recurring)
Price ID: Save this as STRIPE_ENTERPRISE_PRICE_ID
Product ID: Save this as STRIPE_ENTERPRISE_PRODUCT_ID
```

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Product/Price IDs
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_BASIC_PRODUCT_ID=prod_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PRO_PRODUCT_ID=prod_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRODUCT_ID=prod_...

# Stripe Webhook Secret (from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Set Up Webhooks

#### Option A: Using Stripe CLI (Development)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Copy the webhook signing secret and add to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Option B: Using Stripe Dashboard (Production)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your URL: `https://yourdomain.com/api/stripe/webhooks`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to your environment variables

### 5. Update Database Schema

Run the Prisma migration:

```bash
npx prisma generate
npx prisma db push
```

### 6. Test the Integration

#### Test Subscription Flow

1. Navigate to `/store-owner/subscription`
2. Select a plan (use test card: `4242 4242 4242 4242`)
3. Complete checkout
4. Verify subscription is created in database
5. Check webhook logs in Stripe Dashboard

#### Test Featured Payment Flow

1. Create a coupon or store
2. Click "Feature" button
3. Select duration (7, 14, or 30 days)
4. Complete payment
5. Verify resource is marked as featured

#### Test Subscription Limits

1. Try creating more stores/coupons than your plan allows
2. Verify error message with upgrade prompt
3. Upgrade plan and retry

### 7. Test Cards

Use these Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Insufficient Funds**: `4000 0000 0000 9995`

**Details for all test cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## API Endpoints

### Subscription Management

- `POST /api/stripe/checkout/subscription` - Create subscription checkout session
- `POST /api/stripe/billing-portal` - Open billing portal
- `GET /api/subscription/limits` - Get user's subscription limits
- `POST /api/subscription/cancel` - Cancel subscription

### Featured Payments

- `POST /api/stripe/checkout/featured` - Create featured payment checkout

### Webhooks

- `POST /api/stripe/webhooks` - Handle Stripe webhook events

## Usage in Code

### Check if user can create resources

```typescript
import { canCreateStore, canCreateCoupon } from '@/lib/subscription-helpers';

// Check if user can create a store
const allowed = await canCreateStore(userId);

// Check if user can create a coupon
const allowed = await canCreateCoupon(userId);

// Get complete limits information
import { getUserLimits } from '@/lib/subscription-helpers';
const limits = await getUserLimits(userId);
```

### Subscribe to a plan

```typescript
// Client-side
const response = await fetch('/api/stripe/checkout/subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ plan: 'BASIC' }), // or 'PRO', 'ENTERPRISE'
});

const { data } = await response.json();
window.location.href = data.url; // Redirect to Stripe Checkout
```

### Feature a coupon or store

```typescript
// Client-side
const response = await fetch('/api/stripe/checkout/featured', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'featured_coupon', // or 'featured_store'
    resourceId: 'coupon-id-here',
    duration: '30', // '7', '14', or '30'
  }),
});

const { data } = await response.json();
window.location.href = data.url; // Redirect to Stripe Checkout
```

## UI Components

### SubscriptionPlans Component

Display all available subscription plans with pricing:

```tsx
import { SubscriptionPlans } from '@/components/SubscriptionPlans';

<SubscriptionPlans currentPlan={userPlan} />
```

### SubscriptionStatus Component

Show user's current subscription status and usage:

```tsx
import { SubscriptionStatus } from '@/components/SubscriptionStatus';

<SubscriptionStatus userId={userId} />
```

### FeaturedPayment Component

Allow users to feature their coupons or stores:

```tsx
import { FeaturedPayment } from '@/components/FeaturedPayment';

<FeaturedPayment
  type="featured_coupon"
  resourceId={couponId}
  resourceName={couponName}
  isFeatured={coupon.isFeatured}
  featuredUntil={coupon.featuredUntil}
/>
```

## Database Models

### Subscription
Stores subscription information linked to Stripe

### Invoice
Records all invoices from Stripe

### Payment
Tracks one-time payments (featured coupons/stores)

## Security Notes

- ✅ Webhook signatures are verified
- ✅ User ownership is verified before payments
- ✅ All payments require authentication
- ✅ Subscription limits are enforced server-side
- ✅ Never expose secret keys to client

## Troubleshooting

### Webhook not receiving events

1. Check webhook URL is accessible
2. Verify webhook secret is correct
3. Check Stripe Dashboard > Webhooks > Events
4. Review server logs for errors

### Subscription not updating

1. Check webhook is receiving events
2. Verify database updates in webhook handler
3. Check for errors in Stripe Dashboard

### Payment failing

1. Use test cards listed above
2. Check Stripe Dashboard > Payments for details
3. Review error messages in checkout

## Going to Production

1. Replace test API keys with live keys
2. Create live products and prices
3. Update environment variables
4. Set up production webhook endpoint
5. Test thoroughly with small amounts first
6. Enable radar rules for fraud prevention

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For integration issues, check:
- Server logs
- Stripe webhook logs
- Database records
