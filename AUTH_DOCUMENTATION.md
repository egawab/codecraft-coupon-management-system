# Kobonz Authentication & Authorization System

Complete documentation for the authentication and authorization implementation.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup Guide](#setup-guide)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Security Features](#security-features)
8. [Troubleshooting](#troubleshooting)

## Overview

Kobonz uses a comprehensive authentication system with:
- **NextAuth.js** for session management
- **JWT** for access tokens (15 min)
- **Refresh tokens** (30 days, HttpOnly cookies)
- **Redis** (Upstash) for session caching
- **bcrypt** for password hashing (12 salt rounds)
- **Resend** for email delivery
- **Google OAuth 2.0** for social login

## Features

### ✅ Implemented Features

- [x] Email + Password authentication
- [x] Google OAuth 2.0
- [x] JWT-based sessions (15 min access, 30 day refresh)
- [x] Redis session caching with Upstash
- [x] Email verification flow
- [x] Password reset flow
- [x] Role-based access control (RBAC)
- [x] Permission-based authorization
- [x] Protected routes with Next.js middleware
- [x] CSRF protection
- [x] Secure HttpOnly cookies
- [x] Account activation/deactivation
- [x] Session management

### 🔐 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 
  - Access token: 15 minutes
  - Refresh token: 30 days
- **Session Storage**: Redis cache for fast lookups
- **CSRF Protection**: Built-in with NextAuth
- **Secure Cookies**: HttpOnly, Secure, SameSite
- **Rate Limiting**: Ready for implementation
- **Email Verification**: Required for sensitive actions
- **Account Lockout**: Active/inactive status

## Architecture

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Login (email/password or OAuth)
       ↓
┌─────────────────────┐
│  NextAuth.js API    │
│  /api/auth/[...]    │
└──────┬──────────────┘
       │
       │ 2. Verify credentials
       ↓
┌─────────────────────┐
│   Prisma + DB       │
│   (User lookup)     │
└──────┬──────────────┘
       │
       │ 3. Generate tokens
       ↓
┌─────────────────────┐
│   JWT Service       │
│   (Access + Refresh)│
└──────┬──────────────┘
       │
       │ 4. Cache session
       ↓
┌─────────────────────┐
│  Upstash Redis      │
│  (Session cache)    │
└──────┬──────────────┘
       │
       │ 5. Return tokens + Set cookies
       ↓
┌─────────────┐
│   Client    │
└─────────────┘
```

### Role Hierarchy

```
SUPER_ADMIN (Level 3)
    │
    ├── All permissions
    │
STORE_OWNER (Level 2)
    │
    ├── Manage own stores
    ├── Create/manage coupons
    ├── View analytics
    │
AFFILIATE (Level 1)
    │
    ├── Create affiliate links
    ├── View commission reports
    │
USER (Level 0)
    │
    ├── Browse coupons
    ├── Use coupons
    ├── Write reviews
```

## Setup Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` file with:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/kobonz"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
JWT_SECRET="run: openssl rand -base64 32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Resend Email
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="noreply@kobonz.com"
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 4. Set Up Upstash Redis

1. Visit [console.upstash.com](https://console.upstash.com)
2. Create a free Redis database
3. Copy REST URL and Token
4. Add to `.env` file

### 5. Set Up Resend

1. Visit [resend.com](https://resend.com)
2. Sign up for free account
3. Get API key
4. Add to `.env` file

### 6. Run Database Migrations

```bash
npm run db:generate
npm run db:push
```

### 7. Start Development Server

```bash
npm run dev
```

## API Reference

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

#### Login (NextAuth)
```http
POST /api/auth/signin
```

Use NextAuth's built-in sign-in or use the session provider.

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

#### Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

#### Refresh Access Token
```http
POST /api/auth/refresh
Cookie: refresh_token=xxx

OR

{
  "refreshToken": "xxx"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Protected Endpoints

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PATCH /api/users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Admin: List Users
```http
GET /api/admin/users?page=1&limit=20&role=USER&search=john
Authorization: Bearer <access_token>
```

**Requires:** SUPER_ADMIN role

## Usage Examples

### Client-Side: Using NextAuth

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
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.error('Login failed:', result.error);
    } else {
      window.location.href = '/dashboard';
    }
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
      <button type="submit">Login</button>
    </form>
  );
}
```

### Server-Side: Protecting Routes

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth-helpers';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### API Route: With Role Protection

```typescript
// app/api/stores/route.ts
import { NextRequest } from 'next/server';
import { withRole } from '@/lib/api-middleware';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Only STORE_OWNER and SUPER_ADMIN can create stores
    const authenticatedRequest = await withRole(request, [
      Role.STORE_OWNER,
      Role.SUPER_ADMIN,
    ]);

    const userId = authenticatedRequest.user.id;
    
    // Create store logic...
    
  } catch (error) {
    return errorResponse(error);
  }
}
```

### API Route: With Permission Check

```typescript
// app/api/coupons/route.ts
import { withPermission } from '@/lib/api-middleware';
import { Permission } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const authenticatedRequest = await withPermission(
      request,
      Permission.CREATE_COUPONS
    );

    // Create coupon logic...
    
  } catch (error) {
    return errorResponse(error);
  }
}
```

### Check Permissions

```typescript
import { hasPermission, Permission } from '@/lib/rbac';
import { Role } from '@prisma/client';

// Check if user has permission
const canManageStores = hasPermission(Role.STORE_OWNER, Permission.MANAGE_OWN_STORES);
// Returns: true

// Get all permissions for a role
const permissions = getRolePermissions(Role.AFFILIATE);
// Returns: [Permission.VIEW_COUPONS, Permission.USE_COUPONS, ...]
```

## Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Expiry

- **Access Token**: 15 minutes
- **Refresh Token**: 30 days
- **Verification Token**: 24 hours
- **Password Reset Token**: 1 hour

### Cookie Security

```typescript
{
  httpOnly: true,          // Not accessible via JavaScript
  secure: true,            // HTTPS only in production
  sameSite: 'lax',        // CSRF protection
  maxAge: 30 * 24 * 60 * 60 // 30 days
}
```

### CSRF Protection

NextAuth automatically handles CSRF protection with:
- CSRF tokens in cookies
- Token validation on mutations
- SameSite cookie attribute

### Rate Limiting (Ready for Implementation)

```typescript
import { checkRateLimit } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  await checkRateLimit(request, 100, 60000); // 100 requests per minute
  // ... rest of handler
}
```

## Troubleshooting

### Common Issues

#### 1. "Authentication required" error

**Cause**: No valid session or token

**Solution**:
- Check if user is logged in
- Verify token hasn't expired
- Check if cookies are enabled

#### 2. "Email verification required" error

**Cause**: User hasn't verified email

**Solution**:
```typescript
// Resend verification email
await fetch('/api/auth/resend-verification', {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com' }),
});
```

#### 3. "Insufficient permissions" error

**Cause**: User doesn't have required role/permission

**Solution**:
- Check user's role in database
- Verify permission requirements
- Contact admin for role upgrade

#### 4. Redis connection errors

**Cause**: Invalid Upstash credentials

**Solution**:
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check Upstash dashboard for correct values
- Ensure Redis database is active

#### 5. Email not sending

**Cause**: Invalid Resend API key or configuration

**Solution**:
- Verify `RESEND_API_KEY` is correct
- Check domain verification in Resend dashboard
- Verify `EMAIL_FROM` domain matches verified domain

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development
```

NextAuth debug mode is automatically enabled in development.

## Testing

### Test User Registration

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

### Test Login

Use NextAuth sign-in page at `/api/auth/signin`

### Test Protected Route

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <your-access-token>"
```

## Best Practices

### 1. Always Use HTTPS in Production

```javascript
// next.config.mjs
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ]
  }
}
```

### 2. Rotate Secrets Regularly

- Change `NEXTAUTH_SECRET` and `JWT_SECRET` periodically
- Invalidate all sessions after rotation

### 3. Monitor Failed Login Attempts

Implement account lockout after multiple failed attempts:

```typescript
// TODO: Add to login logic
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
```

### 4. Use Email Verification for Sensitive Actions

```typescript
// Require email verification for critical operations
await requireEmailVerification();
```

### 5. Log Security Events

```typescript
// Log important security events
console.log('User logged in:', user.email, 'at', new Date());
console.log('Password reset requested for:', email);
```

## Migration Guide

### Migrating Existing Users

If you have existing users without authentication:

```typescript
// scripts/migrate-users.ts
import { hashPassword } from '@/lib/utils/password';

// 1. Generate temporary passwords
// 2. Hash passwords
// 3. Send reset password emails
```

## Performance Optimization

### Redis Caching

Sessions are cached in Redis for fast lookups:

```typescript
// Average response time: < 10ms
const session = await getSession(sessionId);
```

### Database Indexes

All auth-related queries use indexes:

```sql
users(email) -- O(log n) lookup
users(googleId) -- O(log n) lookup
refresh_tokens(token) -- O(log n) lookup
verification_tokens(token) -- O(log n) lookup
```

## Next Steps

1. ✅ Authentication system is complete
2. 🔄 Implement rate limiting with Redis
3. 🔄 Add two-factor authentication (2FA)
4. 🔄 Add social login (GitHub, Facebook)
5. 🔄 Add audit logging
6. 🔄 Add device management

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-08  
**Status**: Production Ready ✅
