import { Prisma } from '@prisma/client';

// ============================================
// USER TYPES
// ============================================

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    stores: true;
    coupons: true;
  };
}>;

export type UserPublic = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
};

// ============================================
// STORE TYPES
// ============================================

export type StoreWithRelations = Prisma.StoreGetPayload<{
  include: {
    owner: true;
    country: true;
    city: true;
    district: true;
    categories: true;
    coupons: true;
    reviews: true;
  };
}>;

export type StorePublic = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  isVerified: boolean;
};

// ============================================
// COUPON TYPES
// ============================================

export type CouponWithRelations = Prisma.CouponGetPayload<{
  include: {
    store: true;
    category: true;
    createdBy: true;
    usages: true;
    affiliateLinks: true;
  };
}>;

export type CouponPublic = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: string;
  discountValue: number;
  status: string;
  startDate: Date;
  expiryDate: Date;
  imageUrl: string | null;
  store: StorePublic;
};

// ============================================
// CATEGORY TYPES
// ============================================

export type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: {
    parent: true;
    children: true;
  };
}>;

// ============================================
// LOCATION TYPES
// ============================================

export type LocationHierarchy = {
  country: {
    id: string;
    name: string;
    code: string;
  };
  city?: {
    id: string;
    name: string;
  };
  district?: {
    id: string;
    name: string;
  };
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ============================================
// FORM TYPES
// ============================================

export type CreateStoreInput = {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  countryId: string;
  cityId?: string;
  districtId?: string;
  categoryIds: string[];
};

export type CreateCouponInput = {
  code: string;
  title: string;
  description?: string;
  type: string;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate: Date;
  expiryDate: Date;
  storeId: string;
  categoryId?: string;
  imageUrl?: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  avatar?: string;
};
