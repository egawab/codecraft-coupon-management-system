/**
 * Shared coupon service
 * Works on both Web and React Native
 */

import type { ApiClient } from '../../types/api.types';
import type {
  Coupon,
  SearchFilters,
  PaginationParams,
} from '../../types/domain.types';
import type { PaginatedResponse } from '../../types';

/**
 * Coupon service (platform-agnostic)
 */
export class CouponService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Search coupons
   */
  async search(
    filters: SearchFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Coupon>> {
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    };

    return this.apiClient.get<PaginatedResponse<Coupon>>('/api/public/coupons', {
      params,
    });
  }

  /**
   * Get coupon by slug
   */
  async getBySlug(slug: string): Promise<Coupon> {
    const response = await this.apiClient.get<{ data: { coupon: Coupon } }>(
      `/api/public/coupons/${slug}`
    );
    return response.data.coupon;
  }

  /**
   * Get featured coupons
   */
  async getFeatured(limit: number = 10): Promise<Coupon[]> {
    const response = await this.apiClient.get<{ data: Coupon[] }>(
      '/api/public/featured',
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Track coupon view
   */
  async trackView(couponId: string): Promise<void> {
    await this.apiClient.post('/api/analytics/track', {
      eventType: 'VIEW',
      couponId,
    });
  }

  /**
   * Track coupon copy
   */
  async trackCopy(couponId: string): Promise<void> {
    await this.apiClient.post('/api/analytics/track', {
      eventType: 'COPY',
      couponId,
    });
  }

  /**
   * Track coupon click
   */
  async trackClick(couponId: string): Promise<void> {
    await this.apiClient.post('/api/analytics/track', {
      eventType: 'CLICK',
      couponId,
    });
  }

  /**
   * Add to favorites
   */
  async addToFavorites(couponId: string): Promise<void> {
    await this.apiClient.post('/api/favorites', { couponId });
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(couponId: string): Promise<void> {
    await this.apiClient.delete(`/api/favorites/${couponId}`);
  }

  /**
   * Get user's favorite coupons
   */
  async getFavorites(): Promise<Coupon[]> {
    const response = await this.apiClient.get<{ data: Coupon[] }>('/api/favorites');
    return response.data;
  }
}
