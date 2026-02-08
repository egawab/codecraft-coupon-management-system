/**
 * Shared type definitions for cross-platform use
 * These types work on both Web and Mobile
 */

// Re-export common types
export * from './api.types';
export * from './domain.types';
export * from './platform.types';
export * from './feature-flags.types';

/**
 * Platform identifier
 */
export type Platform = 'web' | 'mobile-ios' | 'mobile-android';

/**
 * Environment
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Common error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

/**
 * Success response wrapper
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * API Response type
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
