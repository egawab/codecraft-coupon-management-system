# Kobonz - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon recommended)

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update `.env` file with your Neon PostgreSQL connection string:
```bash
DATABASE_URL="postgresql://user:pass@host/kobonz?schema=public"
```

Get a free Neon database at: https://console.neon.tech

### 3. Setup Database
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 🚀

## What's Included?

✅ Next.js 14 with App Router  
✅ TypeScript with strict mode  
✅ Prisma ORM + PostgreSQL  
✅ Tailwind CSS + shadcn/ui  
✅ Complete database schema  
✅ Zod validation  
✅ Type-safe API helpers  
✅ Error handling system  
✅ Modular project structure  

## Database Schema

The platform includes:
- **Users** with role-based access (SUPER_ADMIN, STORE_OWNER, AFFILIATE, USER)
- **Stores** with location and categories
- **Coupons** with usage tracking and analytics
- **Categories** with hierarchical structure
- **Locations** (Country → City → District)
- **Reviews**, **Favorites**, and **Affiliate Links**

All with proper indexes and relations!

## Next Steps

1. **Add shadcn/ui components** as needed:
   ```bash
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add card
   ```

2. **Implement authentication**:
   - Install bcrypt for password hashing
   - Update `src/lib/utils/password.ts`
   - Consider NextAuth.js for session management

3. **Build API routes** in `src/app/api/`

4. **Create UI pages** in `src/app/`

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Create migration
npm run lint         # Run ESLint
```

## Need Help?

- 📖 Read `SETUP_GUIDE.md` for detailed instructions
- 🏗️ Check `ARCHITECTURE.md` for system design
- 📚 See `README.md` for full documentation

Happy coding! 🎉
