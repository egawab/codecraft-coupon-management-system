/**
 * Hooks for AI recommendations
 */

import { useState, useEffect, useCallback } from 'react';
import { createRecommendationEngine } from '../services/recommendation-engine';
import type {
  Recommendation,
  RecommendationRequest,
  BehaviorEvent,
} from '../types/recommendation.types';

/**
 * Hook to get personalized recommendations
 */
export function useRecommendations(request: RecommendationRequest) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const engine = createRecommendationEngine({
    useML: process.env.NEXT_PUBLIC_ML_ENABLED === 'true',
    useServerInference: true,
  });

  useEffect(() => {
    let mounted = true;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await engine.getRecommendations(request);
        if (mounted) {
          setRecommendations(results);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      mounted = false;
    };
  }, [request.userId, request.context?.currentPage]);

  return {
    recommendations,
    isLoading,
    error,
  };
}

/**
 * Hook to track user behavior
 */
export function useBehaviorTracking() {
  const engine = createRecommendationEngine({
    useML: process.env.NEXT_PUBLIC_ML_ENABLED === 'true',
  });

  const trackView = useCallback(
    async (couponId: string, userId: string) => {
      const event: BehaviorEvent = {
        userId,
        eventType: 'view',
        couponId,
        timestamp: new Date().toISOString(),
      };
      await engine.trackBehavior(event);
    },
    [engine]
  );

  const trackClick = useCallback(
    async (couponId: string, userId: string) => {
      const event: BehaviorEvent = {
        userId,
        eventType: 'click',
        couponId,
        timestamp: new Date().toISOString(),
      };
      await engine.trackBehavior(event);
    },
    [engine]
  );

  const trackFavorite = useCallback(
    async (couponId: string, userId: string) => {
      const event: BehaviorEvent = {
        userId,
        eventType: 'favorite',
        couponId,
        timestamp: new Date().toISOString(),
      };
      await engine.trackBehavior(event);
    },
    [engine]
  );

  const trackSearch = useCallback(
    async (query: string, userId: string) => {
      const event: BehaviorEvent = {
        userId,
        eventType: 'search',
        query,
        timestamp: new Date().toISOString(),
      };
      await engine.trackBehavior(event);
    },
    [engine]
  );

  return {
    trackView,
    trackClick,
    trackFavorite,
    trackSearch,
  };
}
