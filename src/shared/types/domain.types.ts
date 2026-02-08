/**
 * Domain model types (business entities)
 * Simplified versions for client-side use
 */

/**
 * User roles
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  STORE_OWNER = 'STORE_OWNER',
  AFFILIATE = 'AFFILIATE',
  USER = 'USER',
}

/**
 * Coupon status
 */
export enum CouponStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
  PAUSED = 'PAUSED',
}

/**
 * Coupon type
 */
export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BUY_ONE_GET_ONE = 'BUY_ONE_GET_ONE',
  FREE_SHIPPING = 'FREE_SHIPPING',
  OTHER = 'OTHER',
}

/**
 * User (client-side representation)
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: string;
}

/**
 * Coupon (client-side representation)
 */
export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: CouponType;
  discountValue: number;
  status: CouponStatus;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  startDate: string;
  expiryDate: string;
  imageUrl: string | null;
  slug: string;
  isFeatured: boolean;
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Store (client-side representation)
 */
export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  country: {
    id: string;
    name: string;
    code: string;
  };
  city: {
    id: string;
    name: string;
  } | null;
  rating?: number;
  reviewCount?: number;
}

/**
 * Category
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * Search filters
 */
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  countryId?: string;
  cityId?: string;
  districtId?: string;
  minDiscount?: number;
  maxDiscount?: number;
  type?: CouponType;
  sortBy?: 'newest' | 'popular' | 'expiring' | 'discount';
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  limit: number;
}
