# Kobonz Setup Guide

This guide will help you set up the Kobonz coupon marketplace platform from scratch.

## 📦 Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14 (App Router)
- React 18
- Prisma ORM
- shadcn/ui components (Radix UI)
- Tailwind CSS
- Zod for validation
- TypeScript

## 🗄️ Step 2: Set Up PostgreSQL Database

### Option A: Using Neon (Recommended)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string
4. It should look like: `postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb`

### Option B: Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb kobonz`
3. Your connection string: `postgresql://localhost:5432/kobonz`

## 🔐 Step 3: Configure Environment Variables

1. Update the `.env` file with your database credentials:

```bash
# Database (Replace with your actual Neon connection string)
DATABASE_URL="postgresql://username:password@host:port/kobonz?schema=public"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-string-here"

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

To generate a secure NEXTAUTH_SECRET, run:
```bash
openssl rand -base64 32
```

## 🛠️ Step 4: Set Up Prisma

1. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

2. **Push Schema to Database**
   
   For development (no migration files):
   ```bash
   npm run db:push
   ```
   
   For production (with migration files):
   ```bash
   npm run db:migrate
   ```

3. **Seed the Database**
   ```bash
   npm run db:seed
   ```

   This will create:
   - Sample countries (USA, Canada)
   - Sample cities (New York, Toronto)
   - Sample categories (Food & Dining, Shopping, Entertainment)

## 🚀 Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🎨 Step 6: Add shadcn/ui Components (Optional)

As you build features, add UI components as needed:

```bash
# Example: Add commonly used components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
```

## 🔧 Step 7: Explore Prisma Studio (Optional)

View and edit your database in a browser-based GUI:

```bash
npm run db:studio
```

This will open Prisma Studio at [http://localhost:5555](http://localhost:5555)

## ✅ Verification Checklist

- [ ] Dependencies installed successfully
- [ ] PostgreSQL database created (Neon or local)
- [ ] `.env` file configured with valid DATABASE_URL
- [ ] Prisma Client generated
- [ ] Database schema pushed/migrated
- [ ] Database seeded with initial data
- [ ] Development server running at http://localhost:3000
- [ ] No TypeScript errors

## 🏗️ Next Steps - Building Features

### 1. Implement Authentication

Install bcrypt for password hashing:
```bash
npm install bcrypt @types/bcrypt
```

Update `src/lib/utils/password.ts` to use bcrypt instead of the placeholder.

Consider using NextAuth.js:
```bash
npm install next-auth
```

### 2. Create API Routes

Example structure:
```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── logout/route.ts
├── stores/
│   ├── route.ts
│   └── [id]/route.ts
├── coupons/
│   ├── route.ts
│   └── [id]/route.ts
└── categories/
    └── route.ts
```

### 3. Build UI Pages

Example structure:
```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   ├── stores/page.tsx
│   └── coupons/page.tsx
├── stores/
│   └── [slug]/page.tsx
└── coupons/
    └── [slug]/page.tsx
```

### 4. Implement Role-Based Access Control

Create middleware for protected routes based on user roles:
- SUPER_ADMIN: Full access
- STORE_OWNER: Manage own stores and coupons
- AFFILIATE: Create affiliate links, view analytics
- USER: Browse and use coupons

### 5. Add File Upload

For store logos and coupon images, consider:
- Cloudinary
- AWS S3
- Uploadthing
- Vercel Blob

## 📚 Database Schema Reference

### Core Models

- **User**: Authentication and user management
- **Store**: Merchant stores
- **Coupon**: Discount coupons
- **Category**: Hierarchical categories
- **Country/City/District**: Location hierarchy
- **Review**: Store reviews
- **AffiliateLink**: Affiliate tracking
- **Favorite**: User favorites

### Key Relationships

- User → Stores (one-to-many)
- Store → Coupons (one-to-many)
- Store → Reviews (one-to-many)
- Coupon → CouponUsage (one-to-many)
- User → AffiliateLinks (one-to-many)

## 🐛 Troubleshooting

### Database Connection Issues

If you get connection errors:
1. Verify your DATABASE_URL is correct
2. Check if your database is accessible
3. For Neon, ensure your IP is whitelisted (usually automatic)

### Prisma Client Errors

If you get "Prisma Client is not generated":
```bash
npm run db:generate
```

### TypeScript Errors

If you see module resolution errors:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📖 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Neon PostgreSQL](https://neon.tech/docs)

## 🤝 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Review this setup guide
3. Check the official documentation
4. Search for similar issues on GitHub/Stack Overflow

Good luck building Kobonz! 🚀
