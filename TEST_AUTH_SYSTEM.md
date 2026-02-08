# Testing the Authentication System

## Quick Test Guide

### Prerequisites

1. Dependencies installed: `npm install`
2. Database migrated: `npm run db:push`
3. Environment variables configured in `.env`
4. Development server running: `npm run dev`

## Test 1: User Registration

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

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "test@example.com",
    "name": "Test User"
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

## Test 2: Email Verification

Check Resend dashboard for the verification email, get the token, then:

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_FROM_EMAIL"
  }'
```

## Test 3: Login with NextAuth

Visit: `http://localhost:3000/api/auth/signin`

Use credentials:
- Email: `test@example.com`
- Password: `TestPass123!`

## Test 4: Google OAuth

Click "Sign in with Google" button at:
`http://localhost:3000/api/auth/signin`

## Test 5: Protected Route

Try visiting: `http://localhost:3000/dashboard`

- ✅ Should redirect to login if not authenticated
- ✅ Should show dashboard if authenticated

## Test 6: Get Current User

```bash
# Get session token from browser cookies or NextAuth
curl -X GET http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Test 7: Password Reset

Request reset:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

Reset password (with token from email):
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "password": "NewPass123!"
  }'
```

## Test 8: Admin Endpoint

```bash
# Only works with SUPER_ADMIN role
curl -X GET http://localhost:3000/api/admin/users \
  -H "Cookie: next-auth.session-token=ADMIN_SESSION_TOKEN"
```

## Test 9: Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Automated Testing Checklist

- [ ] User can register
- [ ] Email verification sent
- [ ] Email verification works
- [ ] User can login with password
- [ ] User can login with Google
- [ ] Session persists across requests
- [ ] Protected routes redirect
- [ ] Role-based access works
- [ ] Password reset flow works
- [ ] Logout clears session
- [ ] Refresh token works
- [ ] Invalid credentials rejected
