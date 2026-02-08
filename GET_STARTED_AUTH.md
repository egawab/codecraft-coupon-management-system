# 🚀 Get Started with Authentication - 10 Minute Setup

## Step-by-Step Setup

### 1️⃣ Install Dependencies (1 min)

```bash
npm install
```

### 2️⃣ Generate Secrets (30 seconds)

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

Copy these to your `.env` file.

### 3️⃣ Set Up External Services (5 min)

#### Neon PostgreSQL
1. Visit https://neon.tech → Sign up
2. Create project → Copy connection string
3. Update `.env`: `DATABASE_URL="postgresql://..."`

#### Upstash Redis
1. Visit https://console.upstash.com → Sign up
2. Create Redis database
3. Copy REST URL and Token
4. Update `.env`:
   ```
   UPSTASH_REDIS_REST_URL="https://..."
   UPSTASH_REDIS_REST_TOKEN="..."
   ```

#### Resend Email
1. Visit https://resend.com → Sign up (free)
2. Get API key
3. Update `.env`:
   ```
   RESEND_API_KEY="re_..."
   EMAIL_FROM="noreply@yourdomain.com"
   ```

#### Google OAuth (Optional - 2 min)
1. Visit https://console.cloud.google.com
2. Create OAuth credentials
3. Add redirect: `http://localhost:3000/api/auth/callback/google`
4. Update `.env`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

### 4️⃣ Update Database (1 min)

```bash
npm run db:generate
npm run db:push
```

### 5️⃣ Start Development (30 seconds)

```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ Your `.env` File Should Look Like:

```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/kobonz"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generated-secret-from-step-2]"
JWT_SECRET="[generated-jwt-secret-from-step-2]"

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

## 🧪 Test It Works

### Test 1: Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### Test 2: Check Email

- Check Resend dashboard for verification email
- Click verification link

### Test 3: Login

Visit: http://localhost:3000/api/auth/signin

## 📚 What You Have

### ✅ Authentication
- Email/Password login
- Google OAuth login
- Email verification
- Password reset
- Session management

### ✅ Authorization
- 4 roles (USER, AFFILIATE, STORE_OWNER, SUPER_ADMIN)
- 20+ permissions
- Protected routes
- Protected API endpoints

### ✅ Security
- bcrypt password hashing (12 rounds)
- JWT tokens (15 min access, 30 day refresh)
- Redis session caching
- CSRF protection
- Secure cookies
- Security headers

## 📖 Documentation

- **Complete Guide**: `AUTH_DOCUMENTATION.md`
- **Setup Guide**: `AUTH_SETUP.md`
- **Testing Guide**: `TEST_AUTH_SYSTEM.md`
- **Checklist**: `AUTH_CHECKLIST.md`

## 🎯 Next Steps

1. **Build Login Page**: Create UI at `/auth/login`
2. **Build Register Page**: Create UI at `/auth/register`
3. **Build Dashboard**: Create protected pages
4. **Add Features**: Use the auth system in your app

## 💡 Quick Code Examples

### Protect a Page
```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth-helpers';

export default async function Dashboard() {
  const user = await requireAuth();
  return <div>Welcome {user.name}!</div>;
}
```

### Protect an API Route
```typescript
// app/api/stores/route.ts
import { withRole } from '@/lib/api-middleware';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  await withRole(request, Role.STORE_OWNER);
  // Your code here
}
```

### Check Permissions
```typescript
import { hasPermission, Permission } from '@/lib/rbac';

const canCreate = hasPermission(userRole, Permission.CREATE_STORE);
```

## 🆘 Troubleshooting

**Issue**: Can't connect to database  
**Fix**: Check `DATABASE_URL` in `.env`

**Issue**: Redis errors  
**Fix**: Verify Upstash credentials

**Issue**: Emails not sending  
**Fix**: Check Resend API key and domain

**Issue**: OAuth not working  
**Fix**: Verify Google redirect URIs

## ✨ You're Ready!

The authentication system is **100% complete** and ready to use.

Start building your authenticated features! 🚀
