# Vercel Deployment Guide - Final Steps

## ✅ Progress So Far
- ✅ Code build successful locally
- ✅ Project linked to Vercel
- ✅ All code errors fixed
- ⏳ **WAITING**: Environment variables need to be set

---

## 🔧 Required Action: Set Environment Variables

### Step 1: Open Vercel Dashboard
Go to: **https://vercel.com/osaaamas-projects/coupon-management-system/settings/environment-variables**

Or:
1. Visit https://vercel.com
2. Click on your project: **coupon-management-system**
3. Go to **Settings** → **Environment Variables**

---

## 📋 Environment Variables to Add

Copy these from your existing production environment or create new ones:

### 1. **Database** (Required)
```
DATABASE_URL=postgresql://...
```
- Get from: Neon, Supabase, Railway, or your current database provider
- Format: `postgresql://user:password@host:port/database?sslmode=require`

### 2. **NextAuth** (Required)
```
NEXTAUTH_URL=https://kobonz.site
NEXTAUTH_SECRET=your-secret-key-here
```
- Generate secret: Run `openssl rand -base64 32` in terminal
- Or use any 32+ character random string

### 3. **Upstash Redis** (Required for caching)
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```
- Get from: https://upstash.com (free tier available)
- Or comment out Redis usage if not needed

### 4. **Stripe** (Required for payments)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
- Get from: https://dashboard.stripe.com/apikeys
- Use test keys (sk_test_...) for testing first

### 5. **Email Service** (Optional but recommended)
```
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@kobonz.site
RESEND_API_KEY=re_...
```
- Use Resend (recommended): https://resend.com
- Or any SMTP provider

### 6. **Firebase** (For Firebase features)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=effortless-coupon-management
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
- Get from: Firebase Console → Project Settings → Your Apps

### 7. **Optional Services**
```
REDIS_URL=redis://... (for BullMQ - optional)
SENTRY_DSN=... (for error tracking - optional)
GOOGLE_CLIENT_ID=... (for Google auth - optional)
GOOGLE_CLIENT_SECRET=... (for Google auth - optional)
```

---

## 🎯 How to Add Variables in Vercel

For **each variable**:
1. Click **"Add New"**
2. Enter the **Name** (e.g., `DATABASE_URL`)
3. Enter the **Value** (e.g., `postgresql://...`)
4. Select **Environment**: Check all three boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

---

## ⚠️ Minimum Required Variables

To get the site working, you **MUST** set at minimum:
1. ✅ `DATABASE_URL`
2. ✅ `NEXTAUTH_URL` = `https://kobonz.site`
3. ✅ `NEXTAUTH_SECRET`
4. ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `effortless-coupon-management`

Other variables can be added later as you enable features.

---

## 🚀 After Adding Variables

### Option A: Automatic Redeploy
1. Vercel may automatically redeploy after you save variables
2. Check the **Deployments** tab: https://vercel.com/osaaamas-projects/coupon-management-system/deployments

### Option B: Manual Redeploy
If it doesn't auto-deploy:
1. Go to the latest deployment
2. Click **"Redeploy"** button
3. Check **"Use existing Build Cache"** ✅
4. Click **"Redeploy"**

**OR** Let me know when you're done, and I'll trigger a deployment from the CLI.

---

## 🔍 Verify Deployment

Once deployed, check:
1. **Live Site**: https://kobonz.site
2. **Vercel URL**: https://coupon-management-system.vercel.app
3. **Build Status**: Should show ✅ "Ready"

---

## 📞 Need Help?

### If you're stuck:
1. **Don't have a database?** 
   - Sign up for free: https://neon.tech or https://supabase.com
   - They provide free PostgreSQL databases

2. **Don't have Redis?**
   - Sign up for free: https://upstash.com
   - Free tier is sufficient for testing

3. **Don't have Stripe?**
   - Sign up: https://stripe.com
   - Use test mode keys initially

4. **Quick start (minimal setup)**:
   - Just set: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
   - Site will work with limited features
   - Add other services later as needed

---

## ✅ Checklist

- [ ] Opened Vercel environment variables page
- [ ] Added `DATABASE_URL`
- [ ] Added `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
- [ ] Added Firebase config variables
- [ ] Added Stripe keys (if using payments)
- [ ] Added email service (if using emails)
- [ ] Triggered redeploy
- [ ] Verified site is live at https://kobonz.site

---

**Once you've added the variables, let me know and I'll verify the deployment is successful!**
