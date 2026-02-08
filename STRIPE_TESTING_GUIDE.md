# Stripe Integration Testing Guide

## Quick Start Testing

### 1. Prerequisites

Ensure you have completed the setup from `STRIPE_SETUP_GUIDE.md`:
- ✅ Stripe account created
- ✅ Environment variables configured
- ✅ Database schema migrated
- ✅ Webhooks configured (use Stripe CLI for local testing)

### 2. Start Stripe Webhook Listener (Local Development)

```bash
# Terminal 1: Start your Next.js app
npm run dev

# Terminal 2: Start Stripe CLI webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Copy the webhook signing secret from the output and update your `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Test Subscription Flow

#### A. View Subscription Plans
1. Login as a Store Owner
2. Navigate to `/store-owner/subscription`
3. You should see 4 plans: Free, Basic, Pro, Enterprise

#### B. Subscribe to a Plan
1. Click "Subscribe" on the Basic plan ($9.99/month)
2. You'll be redirected to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Name: Any name
   - ZIP: Any 5 digits (e.g., 12345)
4. Complete checkout
5. You should be redirected back with success message
6. Check your dashboard - subscription status should update

#### C. Verify Subscription in Database

```bash
# Check subscription was created
npx prisma studio

# Look at the 'subscriptions' table
# Should show your new subscription with status: ACTIVE
```

#### D. Check Webhook Events

In Terminal 2 (Stripe CLI), you should see:
```
✔ Received event: checkout.session.completed
✔ Received event: customer.subscription.created
✔ Received event: invoice.paid
```

### 4. Test Subscription Limits

#### A. Test Coupon Limit (Free Plan)
1. Go to `/store-owner/coupons/create`
2. Create 10 coupons (the free plan limit)
3. Try to create an 11th coupon
4. You should see an error: "You have reached the maximum number of coupons (10) for your Free plan"

#### B. Test After Upgrading
1. Subscribe to Pro plan
2. You should now be able to create unlimited coupons
3. Check `/api/subscription/limits` to verify new limits

### 5. Test Featured Coupon Payment

#### A. Feature a Coupon
1. Go to your coupon details page
2. Find the "Feature Coupon" section
3. Select a duration (7, 14, or 30 days)
4. Click "Select"
5. Complete payment with test card `4242 4242 4242 4242`
6. After payment, coupon should be marked as featured

#### B. Verify Featured Status
```bash
# Check in Prisma Studio
# Look at the 'coupons' table
# The coupon should have:
# - isFeatured: true
# - featuredUntil: [date in future]
```

#### C. Check Payment Record
```bash
# Check 'payments' table in Prisma Studio
# Should show payment with:
# - type: 'featured_coupon'
# - status: 'succeeded'
# - amount: [price in dollars]
```

### 6. Test Billing Portal

1. Go to `/store-owner/subscription`
2. Click "Manage Billing" button
3. You should be redirected to Stripe's billing portal
4. You can view invoices, update payment method, or cancel subscription

### 7. Test Subscription Cancellation

#### A. Cancel via API
```bash
# Make POST request to cancel subscription
curl -X POST http://localhost:3000/api/subscription/cancel \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

#### B. Cancel via Billing Portal
1. Open billing portal
2. Click "Cancel plan"
3. Confirm cancellation
4. Subscription will remain active until period end

#### C. Verify Cancellation
- Check `subscriptions` table in Prisma Studio
- `cancelAtPeriodEnd` should be `true`
- Webhook should receive `customer.subscription.updated` event

### 8. Test Different Card Scenarios

#### Success Cards
```
4242 4242 4242 4242 - Succeeds
5555 5555 5555 4444 - Succeeds (Mastercard)
```

#### Decline Cards
```
4000 0000 0000 0002 - Generic decline
4000 0000 0000 9995 - Insufficient funds
```

#### Authentication Required (3D Secure)
```
4000 0025 0000 3155 - Requires authentication
```

### 9. Test Webhook Events

Monitor your Stripe CLI terminal for these events:

#### Subscription Events
- ✅ `checkout.session.completed` - Checkout completed
- ✅ `customer.subscription.created` - New subscription
- ✅ `customer.subscription.updated` - Subscription changed
- ✅ `customer.subscription.deleted` - Subscription canceled
- ✅ `invoice.paid` - Payment successful
- ✅ `invoice.payment_failed` - Payment failed

### 10. Verify Database Updates

After each test, check Prisma Studio for correct data:

```bash
npx prisma studio
```

**Tables to check:**
- `subscriptions` - Subscription records
- `invoices` - Invoice records
- `payments` - One-time payments
- `users` - stripeCustomerId updated
- `coupons` - isFeatured and featuredUntil
- `stores` - isFeatured and featuredUntil

### 11. Test Error Scenarios

#### A. Invalid Card
1. Use card `4000 0000 0000 0002` (decline)
2. Should show error message
3. User should be redirected back to cancel URL

#### B. Expired Card
1. Use any card with past expiry date
2. Should show validation error

#### C. No Webhook Secret
1. Remove `STRIPE_WEBHOOK_SECRET` from `.env.local`
2. Try to process webhook
3. Should fail with appropriate error

### 12. Test Subscription Status Display

#### A. Check Dashboard
1. Go to `/store-owner`
2. Look at the "Plan" card in stats grid
3. Should show current plan and usage

#### B. Check Limits Display
1. Create some coupons and stores
2. Progress bars should update
3. Shows used vs. total limits

#### C. Upgrade Prompts
1. Reach plan limit
2. Should see upgrade prompt
3. Button should link to subscription page

### 13. API Endpoint Tests

Test these endpoints with a tool like Postman or curl:

```bash
# Get subscription limits
curl http://localhost:3000/api/subscription/limits \
  -H "Cookie: your-session-cookie"

# Create subscription checkout
curl -X POST http://localhost:3000/api/stripe/checkout/subscription \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"plan": "BASIC"}'

# Create featured checkout
curl -X POST http://localhost:3000/api/stripe/checkout/featured \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"type": "featured_coupon", "resourceId": "coupon-id", "duration": "30"}'

# Cancel subscription
curl -X POST http://localhost:3000/api/subscription/cancel \
  -H "Cookie: your-session-cookie"
```

## Common Issues & Solutions

### Issue: Webhooks not working locally
**Solution:** Make sure Stripe CLI is running and forwarding to correct URL

### Issue: "No subscription found"
**Solution:** Complete a checkout session first to create subscription

### Issue: "Plan limit reached" but just upgraded
**Solution:** Wait a few seconds for webhook to process, or check webhook logs

### Issue: Featured payment not updating resource
**Solution:** Check webhook received `checkout.session.completed` event

### Issue: Stripe customer ID not saved
**Solution:** Check user record in database, verify webhook processed correctly

## Production Testing Checklist

Before going live:

- [ ] Test all subscription plans
- [ ] Test plan upgrades and downgrades
- [ ] Test subscription cancellation
- [ ] Test featured payments for coupons and stores
- [ ] Test limit enforcement
- [ ] Test billing portal access
- [ ] Verify all webhooks are processing correctly
- [ ] Test with small real amounts ($0.50)
- [ ] Verify email notifications (if implemented)
- [ ] Test error handling for failed payments
- [ ] Verify subscription renewals work
- [ ] Test trial periods (if enabled)

## Monitoring

### Check Stripe Dashboard

1. **Payments**: https://dashboard.stripe.com/payments
2. **Subscriptions**: https://dashboard.stripe.com/subscriptions
3. **Customers**: https://dashboard.stripe.com/customers
4. **Webhooks**: https://dashboard.stripe.com/webhooks
5. **Logs**: https://dashboard.stripe.com/logs

### Check Application Logs

Monitor your application logs for:
- Webhook event processing
- Payment confirmations
- Error messages
- Database updates

## Next Steps

1. ✅ Complete all tests above
2. 🔄 Test with real Stripe account (small amounts)
3. 📧 Implement email notifications for subscriptions
4. 🎨 Customize subscription pages
5. 📊 Add analytics tracking
6. 🔒 Enable fraud detection rules
7. 🚀 Deploy to production

## Support Resources

- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Prisma Studio](https://www.prisma.io/studio)
