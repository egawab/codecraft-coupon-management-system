/**
 * Loyalty service (platform-agnostic)
 */

import type { ApiClient } from '../../../shared/types/api.types';
import type {
  LoyaltyAccount,
  PointTransaction,
  Achievement,
  UserAchievement,
  Reward,
  RewardRedemption,
  PointsSummary,
  LeaderboardEntry,
} from '../types/loyalty.types';

export class LoyaltyService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get user's loyalty account
   */
  async getAccount(userId?: string): Promise<LoyaltyAccount> {
    const endpoint = userId ? `/api/loyalty/account/${userId}` : '/api/loyalty/account';
    const response = await this.apiClient.get<{ data: LoyaltyAccount }>(endpoint);
    return response.data;
  }

  /**
   * Get points summary
   */
  async getPointsSummary(): Promise<PointsSummary> {
    const response = await this.apiClient.get<{ data: PointsSummary }>(
      '/api/loyalty/points/summary'
    );
    return response.data;
  }

  /**
   * Get point transaction history
   */
  async getTransactions(page: number = 1, limit: number = 20): Promise<{
    transactions: PointTransaction[];
    total: number;
  }> {
    const response = await this.apiClient.get<{
      data: { transactions: PointTransaction[]; total: number };
    }>('/api/loyalty/transactions', {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Award points
   */
  async awardPoints(
    type: string,
    points: number,
    metadata?: Record<string, any>
  ): Promise<PointTransaction> {
    const response = await this.apiClient.post<{ data: PointTransaction }>(
      '/api/loyalty/points/award',
      { type, points, metadata }
    );
    return response.data;
  }

  /**
   * Get available achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    const response = await this.apiClient.get<{ data: Achievement[] }>(
      '/api/loyalty/achievements'
    );
    return response.data;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(): Promise<UserAchievement[]> {
    const response = await this.apiClient.get<{ data: UserAchievement[] }>(
      '/api/loyalty/achievements/user'
    );
    return response.data;
  }

  /**
   * Check and unlock achievements
   */
  async checkAchievements(): Promise<UserAchievement[]> {
    const response = await this.apiClient.post<{ data: UserAchievement[] }>(
      '/api/loyalty/achievements/check'
    );
    return response.data;
  }

  /**
   * Get available rewards
   */
  async getRewards(): Promise<Reward[]> {
    const response = await this.apiClient.get<{ data: Reward[] }>(
      '/api/loyalty/rewards'
    );
    return response.data;
  }

  /**
   * Redeem reward
   */
  async redeemReward(rewardId: string): Promise<RewardRedemption> {
    const response = await this.apiClient.post<{ data: RewardRedemption }>(
      '/api/loyalty/rewards/redeem',
      { rewardId }
    );
    return response.data;
  }

  /**
   * Get redemption history
   */
  async getRedemptions(): Promise<RewardRedemption[]> {
    const response = await this.apiClient.get<{ data: RewardRedemption[] }>(
      '/api/loyalty/redemptions'
    );
    return response.data;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(period: 'week' | 'month' | 'all' = 'month'): Promise<LeaderboardEntry[]> {
    const response = await this.apiClient.get<{ data: LeaderboardEntry[] }>(
      '/api/loyalty/leaderboard',
      { params: { period } }
    );
    return response.data;
  }
}
