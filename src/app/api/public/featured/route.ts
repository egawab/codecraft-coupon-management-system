import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getFeaturedCoupons, getTrendingStores } from '@/lib/search';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/public/featured - Get featured content for homepage
 */
export async function GET(request: NextRequest) {
  try {
    const [featuredCoupons, trendingStores, categories] = await Promise.all([
      getFeaturedCoupons(12),
      getTrendingStores(8),
      prisma.category.findMany({
        where: {
          parentId: null, // Only top-level categories
        },
        take: 12,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          _count: {
            select: {
              coupons: true,
            },
          },
        },
      }),
    ]);

    return successResponse({
      featuredCoupons,
      trendingStores,
      categories,
    });
  } catch (error) {
    console.error('Get featured content error:', error);
    return errorResponse(error as Error);
  }
}
