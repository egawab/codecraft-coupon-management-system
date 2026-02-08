#!/usr/bin/env node

/**
 * Kobonz Setup Verification Script
 * Checks if all required files and configurations are in place
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

function checkFile(path, description) {
  if (existsSync(path)) {
    checks.passed.push(`✅ ${description}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description}`);
    return false;
  }
}

function checkFileContent(path, searchString, description) {
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8');
    if (content.includes(searchString)) {
      checks.passed.push(`✅ ${description}`);
      return true;
    } else {
      checks.warnings.push(`⚠️  ${description}`);
      return false;
    }
  } else {
    checks.failed.push(`❌ ${description}`);
    return false;
  }
}

console.log('\n🔍 Verifying Kobonz Setup...\n');

// Core configuration files
checkFile('package.json', 'package.json exists');
checkFile('tsconfig.json', 'TypeScript configuration exists');
checkFile('next.config.mjs', 'Next.js configuration exists');
checkFile('tailwind.config.ts', 'Tailwind CSS configuration exists');
checkFile('components.json', 'shadcn/ui configuration exists');
checkFile('.env', 'Environment variables file exists');
checkFile('.env.example', 'Environment variables example exists');
checkFile('.gitignore', 'Git ignore file exists');

// Prisma files
checkFile('prisma/schema.prisma', 'Prisma schema exists');
checkFile('prisma/seed.ts', 'Database seed script exists');

// Source files
checkFile('src/app/layout.tsx', 'Root layout exists');
checkFile('src/app/page.tsx', 'Home page exists');
checkFile('src/app/globals.css', 'Global styles exist');
checkFile('src/lib/prisma.ts', 'Prisma client exists');
checkFile('src/lib/utils.ts', 'Utility functions exist');
checkFile('src/types/index.ts', 'Type definitions exist');
checkFile('src/middleware.ts', 'Next.js middleware exists');

// Validation schemas
checkFile('src/lib/validations/auth.ts', 'Auth validation schema exists');
checkFile('src/lib/validations/store.ts', 'Store validation schema exists');
checkFile('src/lib/validations/coupon.ts', 'Coupon validation schema exists');

// Utility files
checkFile('src/lib/constants.ts', 'Constants file exists');
checkFile('src/lib/errors.ts', 'Error handling exists');
checkFile('src/lib/api-response.ts', 'API response helpers exist');
checkFile('src/lib/utils/slugify.ts', 'Slugify utility exists');
checkFile('src/lib/utils/date.ts', 'Date utility exists');
checkFile('src/lib/utils/password.ts', 'Password utility exists');
checkFile('src/lib/utils/pagination.ts', 'Pagination utility exists');

// Documentation
checkFile('README.md', 'README documentation exists');
checkFile('SETUP_GUIDE.md', 'Setup guide exists');
checkFile('ARCHITECTURE.md', 'Architecture documentation exists');
checkFile('QUICK_START.md', 'Quick start guide exists');

// Check package.json content
checkFileContent('package.json', '"next"', 'Next.js dependency installed');
checkFileContent('package.json', '"@prisma/client"', 'Prisma Client dependency installed');
checkFileContent('package.json', '"tailwindcss"', 'Tailwind CSS dependency installed');
checkFileContent('package.json', '"zod"', 'Zod validation dependency installed');

// Check Prisma schema
checkFileContent('prisma/schema.prisma', 'model User', 'User model defined');
checkFileContent('prisma/schema.prisma', 'model Store', 'Store model defined');
checkFileContent('prisma/schema.prisma', 'model Coupon', 'Coupon model defined');
checkFileContent('prisma/schema.prisma', 'model Category', 'Category model defined');
checkFileContent('prisma/schema.prisma', 'model Country', 'Country model defined');

// Check environment variables
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf-8');
  if (envContent.includes('DATABASE_URL')) {
    if (envContent.includes('postgresql://username:password')) {
      checks.warnings.push('⚠️  DATABASE_URL needs to be updated with actual credentials');
    } else {
      checks.passed.push('✅ DATABASE_URL is configured');
    }
  } else {
    checks.failed.push('❌ DATABASE_URL not found in .env');
  }
}

// Print results
console.log('\n📊 Verification Results:\n');

if (checks.passed.length > 0) {
  console.log('✅ Passed Checks:');
  checks.passed.forEach(check => console.log(`   ${check}`));
}

if (checks.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
}

if (checks.failed.length > 0) {
  console.log('\n❌ Failed Checks:');
  checks.failed.forEach(fail => console.log(`   ${fail}`));
}

console.log('\n📈 Summary:');
console.log(`   Passed: ${checks.passed.length}`);
console.log(`   Warnings: ${checks.warnings.length}`);
console.log(`   Failed: ${checks.failed.length}`);

if (checks.failed.length === 0) {
  console.log('\n🎉 All critical checks passed! Your setup is ready.\n');
  console.log('Next steps:');
  console.log('1. Update DATABASE_URL in .env with your Neon credentials');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run db:generate');
  console.log('4. Run: npm run db:push');
  console.log('5. Run: npm run db:seed');
  console.log('6. Run: npm run dev\n');
} else {
  console.log('\n⚠️  Some checks failed. Please review the failed items above.\n');
  process.exit(1);
}
