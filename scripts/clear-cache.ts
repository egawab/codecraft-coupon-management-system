/**
 * Script to clear Redis cache
 * Usage: npm run cache:clear
 */
import { redis } from '../src/lib/redis';

async function clearCache() {
  console.log('🗑️  Starting cache cleanup...');
  
  try {
    // Clear all cache keys
    const keys = await redis.keys('cache:*');
    
    if (keys.length === 0) {
      console.log('✨ No cache keys found. Cache is already clean.');
      return;
    }
    
    console.log(`📊 Found ${keys.length} cache keys`);
    
    // Delete in batches
    const batchSize = 100;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await redis.del(...batch);
      console.log(`🔄 Cleared ${Math.min(i + batchSize, keys.length)}/${keys.length} keys`);
    }
    
    console.log('✅ Cache cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache();
