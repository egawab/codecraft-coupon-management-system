/**
 * Shared authentication state management
 * Using Zustand for cross-platform compatibility
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/domain.types';
import type { AuthTokens } from '../types/api.types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Create auth store
 * This will be persisted to AsyncStorage on mobile and localStorage on web
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setTokens: (tokens) =>
        set({ tokens }),

      login: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setError: (error) =>
        set({ error }),

      clearError: () =>
        set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Storage will be configured per platform
      // Web: localStorage
      // Mobile: AsyncStorage
    }
  )
);

/**
 * Get auth tokens (for API client)
 */
export const getAuthTokens = (): AuthTokens | null => {
  return useAuthStore.getState().tokens;
};
