import { prisma } from './prisma';
import { Prisma, CouponStatus, StoreStatus } from '@prisma/client';

export type SearchFilters = {
  query?: string;
  categoryId?: string;
  countryId?: string;
  cityId?: string;
  districtId?: string;
  minDiscount?: number;
  maxDiscount?: number;
  type?: string;
  status?: string;
  sortBy?: 'newest' | 'popular' | 'ending_soon' | 'highest_discount';
};

/**
 * Search coupons with full-text search and filters
 */
export async function searchCoupons(
  filters: SearchFilters,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const where: Prisma.CouponWhereInput = {
    status: CouponStatus.ACTIVE,
    expiryDate: { gte: new Date() },
  };

  // Full-text search
  if (filters.query) {
    where.OR = [
      {
        title: {
          contains: filters.query,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: filters.query,
          mode: 'insensitive',
        },
      },
      {
        code: {
          contains: filters.query,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Category filter
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  // Location filters
  if (filters.countryId || filters.cityId || filters.districtId) {
    where.store = {
      ...(filters.countryId && { countryId: filters.countryId }),
      ...(filters.cityId && { cityId: filters.cityId }),
      ...(filters.districtId && { districtId: filters.districtId }),
    };
  }

  // Discount filters
  if (filters.minDiscount !== undefined) {
    where.discountValue = { gte: filters.minDiscount };
  }
  if (filters.maxDiscount !== undefined) {
    where.discountValue = {
      ...where.discountValue,
      lte: filters.maxDiscount,
    };
  }

  // Type filter
  if (filters.type) {
    where.type = filters.type as any;
  }

  // Sorting
  let orderBy: Prisma.CouponOrderByWithRelationInput = { createdAt: 'desc' };

  switch (filters.sortBy) {
    case 'popular':
      orderBy = { usageCount: 'desc' };
      break;
    case 'ending_soon':
      orderBy = { expiryDate: 'asc' };
      break;
    case 'highest_discount':
      orderBy = { discountValue: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            usages: true,
            favorites: true,
          },
        },
      },
    }),
    prisma.coupon.count({ where }),
  ]);

  return {
    coupons,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Search stores with full-text search and filters
 */
export async function searchStores(
  filters: SearchFilters,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const where: Prisma.StoreWhereInput = {
    status: StoreStatus.APPROVED,
    isActive: true,
  };

  // Full-text search
  if (filters.query) {
    where.OR = [
      {
        name: {
          contains: filters.query,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: filters.query,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Category filter
  if (filters.categoryId) {
    where.categories = {
      some: {
        id: filters.categoryId,
      },
    };
  }

  // Location filters
  if (filters.countryId) {
    where.countryId = filters.countryId;
  }
  if (filters.cityId) {
    where.cityId = filters.cityId;
  }
  if (filters.districtId) {
    where.districtId = filters.districtId;
  }

  // Sorting
  let orderBy: Prisma.StoreOrderByWithRelationInput = { createdAt: 'desc' };

  switch (filters.sortBy) {
    case 'popular':
      orderBy = { coupons: { _count: 'desc' } };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        _count: {
          select: {
            coupons: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.store.count({ where }),
  ]);

  return {
    stores,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get featured coupons for homepage
 */
export async function getFeaturedCoupons(limit: number = 12) {
  return prisma.coupon.findMany({
    where: {
      status: CouponStatus.ACTIVE,
      expiryDate: { gte: new Date() },
    },
    take: limit,
    orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },
      _count: {
        select: {
          usages: true,
          favorites: true,
        },
      },
    },
  });
}

/**
 * Get trending stores
 */
export async function getTrendingStores(limit: number = 8) {
  return prisma.store.findMany({
    where: {
      status: StoreStatus.APPROVED,
      isActive: true,
    },
    take: limit,
    orderBy: [
      { coupons: { _count: 'desc' } },
      { createdAt: 'desc' },
    ],
    include: {
      country: {
        select: {
          name: true,
          code: true,
        },
      },
      categories: {
        take: 3,
        select: {
          name: true,
          icon: true,
        },
      },
      _count: {
        select: {
          coupons: true,
          reviews: true,
        },
      },
    },
  });
}
