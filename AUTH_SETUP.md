# Authentication System - Quick Setup Guide

Follow these steps to get the authentication system running.

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `next-auth` - Authentication framework
- `bcrypt` - Password hashing
- `@upstash/redis` - Session caching
- `resend` - Email delivery
- `jsonwebtoken` - JWT tokens
- `nanoid` - Token generation

### Step 2: Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

Copy the generated values to your `.env` file.

### Step 3: Set Up External Services

#### A. Neon PostgreSQL (Database)

1. Visit [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string
5. Add to `.env` as `DATABASE_URL`

#### B. Upstash Redis (Session Cache)

1. Visit [console.upstash.com](https://console.upstash.com)
2. Create free account
3. Create Redis database (select region closest to you)
4. Copy REST URL and Token
5. Add to `.env`:
   ```
   UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="xxx"
   ```

#### C. Resend (Email Service)

1. Visit [resend.com](https://resend.com)
2. Create free account (100 emails/day free)
3. Verify your domain OR use test mode
4. Get API key from dashboard
5. Add to `.env`:
   ```
   RESEND_API_KEY="re_xxx"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

#### D. Google OAuth (Optional but Recommended)

1. Visit [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret
8. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="xxx"
   ```

### Step 4: Update Environment Variables

Your `.env` should look like this:

```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/kobonz"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-from-step-2"
JWT_SECRET="your-generated-jwt-secret-from-step-2"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXX..."

# Resend
RESEND_API_KEY="re_xxx"
EMAIL_FROM="noreply@kobonz.com"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ Verify Installation

### Test Authentication Flow

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "TestPass123!",
       "confirmPassword": "TestPass123!"
     }'
   ```

2. **Check your email** for verification link (or check Resend dashboard)

3. **Sign in:**
   - Visit: http://localhost:3000/api/auth/signin
   - Use your credentials

4. **Test protected route:**
   - Visit: http://localhost:3000/dashboard
   - Should redirect to login if not authenticated

## 🔍 Troubleshooting

### "Prisma Client not generated"

```bash
npm run db:generate
```

### "Cannot connect to database"

- Check your `DATABASE_URL` in `.env`
- Verify Neon database is active
- Test connection: `npm run db:studio`

### "Redis connection failed"

- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check Upstash dashboard for correct credentials
- Ensure Redis database is active (not sleeping)

### "Email not sending"

- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for errors
- For development, emails appear in Resend dashboard logs

### "Google OAuth not working"

- Verify redirect URIs match exactly
- Check Google Cloud Console for errors
- Ensure Google+ API is enabled

## 📚 What's Included

### Authentication Features

- ✅ Email + Password registration/login
- ✅ Google OAuth 2.0 sign-in
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ JWT access tokens (15 min)
- ✅ Refresh tokens (30 days)
- ✅ Session caching (Redis)
- ✅ CSRF protection
- ✅ Secure cookies

### Authorization Features

- ✅ Role-based access control (RBAC)
- ✅ Permission-based authorization
- ✅ Protected routes (middleware)
- ✅ Protected API endpoints
- ✅ Resource ownership checks

### Roles

- **USER**: Basic access (browse, use coupons)
- **AFFILIATE**: Create affiliate links, earn commissions
- **STORE_OWNER**: Manage stores and coupons
- **SUPER_ADMIN**: Full system access

## 🎯 Next Steps

### 1. Create Your First User

Visit: http://localhost:3000/api/auth/signin

Or use the registration API endpoint.

### 2. Test Role-Based Access

- Create a STORE_OWNER user
- Try accessing `/stores/create`
- Should be accessible

### 3. Build Your Auth Pages

Create these pages:
- `/auth/login`
- `/auth/register`
- `/auth/verify-email`
- `/auth/reset-password`
- `/dashboard`

Example login page using NextAuth:

```typescript
// app/auth/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', { email, password });
  };

  const handleGoogleSignIn = () => {
    signIn('google');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
      <button type="button" onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </form>
  );
}
```

### 4. Protect Your Routes

Use the built-in middleware (already configured).

Protected routes:
- `/dashboard/*`
- `/profile/*`
- `/stores/create`
- `/admin/*`

### 5. Use Auth in Your Components

```typescript
// Server Component
import { requireAuth } from '@/lib/auth-helpers';

export default async function ProfilePage() {
  const user = await requireAuth();
  return <div>Welcome, {user.name}!</div>;
}

// Client Component
'use client';
import { useSession } from 'next-auth/react';

export default function ClientComponent() {
  const { data: session } = useSession();
  if (!session) return <div>Not authenticated</div>;
  return <div>Welcome, {session.user.name}!</div>;
}
```

## 📖 Documentation

- Full documentation: `AUTH_DOCUMENTATION.md`
- API reference: See AUTH_DOCUMENTATION.md
- Example implementations: See `/src/app/api` directory

## 🆘 Support

If you encounter issues:

1. Check `.env` file for correct values
2. Verify all external services are set up
3. Check browser console for errors
4. Check server logs for errors
5. Review `AUTH_DOCUMENTATION.md` for troubleshooting

## ✨ Features Ready to Use

- Registration with email verification
- Login with email/password or Google
- Password reset via email
- Session management
- Role-based access control
- Protected routes and API endpoints

You're all set! Start building your authenticated features. 🚀
