# Vercel Environment Variables - Step-by-Step Setup

Copy and paste each variable exactly as shown below into the Vercel UI.

---

## ✅ CRITICAL VARIABLES (Add These First)

### 1. NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://kobonz.site
Environments: ✅ Production, ✅ Preview
```

### 2. NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: [GENERATE THIS - See instructions below]
Environments: ✅ Production, ✅ Preview
```

**How to generate NEXTAUTH_SECRET:**
- Windows PowerShell: Run `[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`
- Or use this random value: `dGhpc2lzYXZlcnlzZWN1cmVyYW5kb21zdHJpbmdmb3JuZXh0YXV0aA==`

---

## 🗄️ DATABASE (Required)

### 3. DATABASE_URL
```
Key: DATABASE_URL
Value: [YOUR POSTGRESQL URL]
Environments: ✅ Production, ✅ Preview
```

**Don't have a database yet?**
1. Go to https://neon.tech (Free PostgreSQL)
2. Sign up and create a project
3. Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`)
4. Paste it here

**Or** if you already have a database, paste your PostgreSQL URL here.

---

## 🔥 FIREBASE (Required for the project)

### 4. NEXT_PUBLIC_FIREBASE_API_KEY
```
Key: NEXT_PUBLIC_FIREBASE_API_KEY
Value: [FROM YOUR FIREBASE PROJECT]
Environments: ✅ Production, ✅ Preview
```

### 5. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
Key: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: effortless-coupon-management.firebaseapp.com
Environments: ✅ Production, ✅ Preview
```

### 6. NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
Key: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: effortless-coupon-management
Environments: ✅ Production, ✅ Preview
```

### 7. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
Key: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: effortless-coupon-management.firebasestorage.app
Environments: ✅ Production, ✅ Preview
```

### 8. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
Key: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [FROM YOUR FIREBASE PROJECT]
Environments: ✅ Production, ✅ Preview
```

### 9. NEXT_PUBLIC_FIREBASE_APP_ID
```
Key: NEXT_PUBLIC_FIREBASE_APP_ID
Value: [FROM YOUR FIREBASE PROJECT]
Environments: ✅ Production, ✅ Preview
```

### 10. NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```
Key: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
Value: [FROM YOUR FIREBASE PROJECT]
Environments: ✅ Production, ✅ Preview
```

**Where to find Firebase values:**
1. Go to https://console.firebase.google.com
2. Select "Effortless Coupon Management" project
3. Click ⚙️ Settings → Project Settings
4. Scroll to "Your apps" section
5. If no web app exists, click "Add app" → Web
6. Copy all the config values

---

## 💳 STRIPE (Required for payments)

### 11. STRIPE_SECRET_KEY
```
Key: STRIPE_SECRET_KEY
Value: sk_live_... or sk_test_...
Environments: ✅ Production (use live), ✅ Preview (use test)
```

### 12. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_... or pk_test_...
Environments: ✅ Production (use live), ✅ Preview (use test)
```

### 13. STRIPE_WEBHOOK_SECRET
```
Key: STRIPE_WEBHOOK_SECRET
Value: whsec_...
Environments: ✅ Production, ✅ Preview
```

**Where to find Stripe keys:**
1. Go to https://dashboard.stripe.com/apikeys
2. For testing: Use "Test mode" keys (sk_test_... and pk_test_...)
3. For production: Use "Live mode" keys (sk_live_... and pk_live_...)

**Webhook secret:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://kobonz.site/api/stripe/webhooks`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
5. Copy the webhook signing secret (whsec_...)

---

## 📧 EMAIL SERVICE (Optional but Recommended)

### 14. RESEND_API_KEY
```
Key: RESEND_API_KEY
Value: re_...
Environments: ✅ Production, ✅ Preview
```

### 15. EMAIL_FROM
```
Key: EMAIL_FROM
Value: noreply@kobonz.site
Environments: ✅ Production, ✅ Preview
```

**How to get Resend API key:**
1. Go to https://resend.com
2. Sign up for free
3. Verify your domain: kobonz.site (or use their test domain)
4. Go to API Keys → Create API Key
5. Copy the key (starts with re_...)

**Skip if not needed:** You can skip email for now and add it later.

---

## 🔴 UPSTASH REDIS (Optional - For caching)

### 16. UPSTASH_REDIS_REST_URL
```
Key: UPSTASH_REDIS_REST_URL
Value: https://...upstash.io
Environments: ✅ Production, ✅ Preview
```

### 17. UPSTASH_REDIS_REST_TOKEN
```
Key: UPSTASH_REDIS_REST_TOKEN
Value: [YOUR TOKEN]
Environments: ✅ Production, ✅ Preview
```

**How to get Upstash Redis:**
1. Go to https://upstash.com
2. Sign up for free
3. Create a Redis database (choose a region close to your users)
4. Click on your database
5. Copy "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN"

**Skip if not needed:** Site will work without it, but caching will be disabled.

---

## 🔐 OPTIONAL: Google OAuth (If you want Google login)

### 18. GOOGLE_CLIENT_ID
```
Key: GOOGLE_CLIENT_ID
Value: ...apps.googleusercontent.com
Environments: ✅ Production, ✅ Preview
```

### 19. GOOGLE_CLIENT_SECRET
```
Key: GOOGLE_CLIENT_SECRET
Value: GOCSPX-...
Environments: ✅ Production, ✅ Preview
```

**Skip if not needed:** Only add if you want Google authentication.

---

## 📊 OPTIONAL: Analytics & Monitoring

### 20. NEXT_PUBLIC_GA_MEASUREMENT_ID
```
Key: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-...
Environments: ✅ Production, ✅ Preview
```

### 21. SENTRY_DSN
```
Key: SENTRY_DSN
Value: https://...@sentry.io/...
Environments: ✅ Production, ✅ Preview
```

**Skip if not needed:** Add later when you want analytics.

---

## ⚡ MINIMUM SETUP (Quick Start)

If you want to deploy ASAP with minimal features, add ONLY these:

1. ✅ `NEXTAUTH_URL` = `https://kobonz.site`
2. ✅ `NEXTAUTH_SECRET` = [Generate random 32+ char string]
3. ✅ `DATABASE_URL` = [Your PostgreSQL URL]
4. ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `effortless-coupon-management`
5. ✅ `NEXT_PUBLIC_FIREBASE_API_KEY` = [From Firebase Console]
6. ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `effortless-coupon-management.firebaseapp.com`
7. ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `effortless-coupon-management.firebasestorage.app`

**Then add Stripe, Email, Redis later as you need them.**

---

## ✅ VERIFICATION CHECKLIST

After adding variables:
- [ ] All CRITICAL variables added (NEXTAUTH_URL, NEXTAUTH_SECRET, DATABASE_URL)
- [ ] All FIREBASE variables added
- [ ] Stripe keys added (or skipped if not using payments yet)
- [ ] Email service added (or skipped)
- [ ] Redis added (or skipped)
- [ ] Clicked "Save" for each variable
- [ ] Ready to trigger deployment

---

## 🚀 NEXT STEP

Once you've added all the variables you want:
1. Let me know which variables you've added
2. I'll trigger a deployment
3. We'll verify the site is live

---

**Questions? Stuck on any step? Let me know!**
