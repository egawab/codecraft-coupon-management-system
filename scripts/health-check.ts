/**
 * Health check script for production monitoring
 * Usage: npm run health:check
 */
import { prisma } from '../src/lib/prisma';
import { redis } from '../src/lib/redis';

async function healthCheck() {
  console.log('🏥 Starting health check...\n');
  
  const results = {
    database: false,
    redis: false,
    environment: false,
  };
  
  // Check Database
  console.log('📊 Checking database connection...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.database = true;
    console.log('✅ Database connection: OK\n');
  } catch (error) {
    console.error('❌ Database connection: FAILED');
    console.error(error);
    console.log('');
  }
  
  // Check Redis
  console.log('🔴 Checking Redis connection...');
  try {
    await redis.ping();
    results.redis = true;
    console.log('✅ Redis connection: OK\n');
  } catch (error) {
    console.error('❌ Redis connection: FAILED');
    console.error(error);
    console.log('');
  }
  
  // Check Environment Variables
  console.log('🔐 Checking environment variables...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingEnvVars.length === 0) {
    results.environment = true;
    console.log('✅ All required environment variables: OK\n');
  } else {
    console.error('❌ Missing environment variables:');
    missingEnvVars.forEach((varName) => console.error(`   - ${varName}`));
    console.log('');
  }
  
  // Summary
  console.log('📋 Health Check Summary:');
  console.log(`   Database: ${results.database ? '✅' : '❌'}`);
  console.log(`   Redis: ${results.redis ? '✅' : '❌'}`);
  console.log(`   Environment: ${results.environment ? '✅' : '❌'}`);
  
  const allHealthy = Object.values(results).every((r) => r === true);
  
  if (allHealthy) {
    console.log('\n🎉 All systems operational!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some systems require attention!');
    process.exit(1);
  }
}

healthCheck();
