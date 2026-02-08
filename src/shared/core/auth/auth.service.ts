/**
 * Shared authentication service
 * Works on both Web and React Native
 */

import type { ApiClient } from '../../types/api.types';
import type { User } from '../../types/domain.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Authentication service (platform-agnostic)
 */
export class AuthService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>('/api/auth/login', credentials);
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>('/api/auth/register', data);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.apiClient.post('/api/auth/logout');
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    return this.apiClient.get<User>('/api/users/me');
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.apiClient.post('/api/auth/forgot-password', { email });
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/api/auth/reset-password', {
      token,
      password: newPassword,
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await this.apiClient.post('/api/auth/verify-email', { token });
  }
}
