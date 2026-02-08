export const APP_NAME = 'Kobonz';
export const APP_DESCRIPTION = 'Discover and share amazing deals in your local area';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Roles
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  STORE_OWNER: 'STORE_OWNER',
  AFFILIATE: 'AFFILIATE',
  USER: 'USER',
} as const;

// Coupon Status
export const COUPON_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  PAUSED: 'PAUSED',
} as const;

// Coupon Types
export const COUPON_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  BUY_ONE_GET_ONE: 'BUY_ONE_GET_ONE',
  FREE_SHIPPING: 'FREE_SHIPPING',
  OTHER: 'OTHER',
} as const;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  STORES: '/api/stores',
  COUPONS: '/api/coupons',
  CATEGORIES: '/api/categories',
  LOCATIONS: {
    COUNTRIES: '/api/locations/countries',
    CITIES: '/api/locations/cities',
    DISTRICTS: '/api/locations/districts',
  },
  USERS: '/api/users',
} as const;
