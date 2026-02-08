/**
 * Platform-agnostic API client
 * Works on both Web and React Native
 */

import type { ApiClient, ApiRequestConfig, HttpMethod } from '../types/api.types';
import type { AuthTokens } from '../types/api.types';

/**
 * Base API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  getAuthTokens?: () => Promise<AuthTokens | null>;
  onAuthError?: () => void;
}

/**
 * Abstract API client
 * Platform-specific implementations will extend this
 */
export abstract class BaseApiClient implements ApiClient {
  protected config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Platform-specific request implementation
   */
  protected abstract request<T>(config: ApiRequestConfig): Promise<T>;

  /**
   * Get authorization headers
   */
  protected async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.config.getAuthTokens) {
      return {};
    }

    const tokens = await this.config.getAuthTokens();
    if (!tokens) {
      return {};
    }

    return {
      Authorization: `Bearer ${tokens.accessToken}`,
    };
  }

  /**
   * Build request config
   */
  protected async buildConfig(
    method: HttpMethod,
    url: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiRequestConfig> {
    const authHeaders = await this.getAuthHeaders();

    return {
      method,
      url: `${this.config.baseURL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...authHeaders,
        ...config?.headers,
      },
      timeout: this.config.timeout,
      ...config,
    };
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<T> {
    const requestConfig = await this.buildConfig('GET', url, config);
    return this.request<T>(requestConfig);
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T> {
    const requestConfig = await this.buildConfig('POST', url, {
      ...config,
      data,
    });
    return this.request<T>(requestConfig);
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T> {
    const requestConfig = await this.buildConfig('PUT', url, {
      ...config,
      data,
    });
    return this.request<T>(requestConfig);
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<T> {
    const requestConfig = await this.buildConfig('PATCH', url, {
      ...config,
      data,
    });
    return this.request<T>(requestConfig);
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<T> {
    const requestConfig = await this.buildConfig('DELETE', url, config);
    return this.request<T>(requestConfig);
  }
}

/**
 * Web implementation (using fetch)
 */
export class WebApiClient extends BaseApiClient {
  protected async request<T>(config: ApiRequestConfig): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: response.statusText,
        }));
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

/**
 * Create API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  // On web, use WebApiClient
  // On mobile, this would be replaced with a React Native implementation
  if (typeof window !== 'undefined') {
    return new WebApiClient(config);
  }
  
  // For SSR, return a basic implementation
  return new WebApiClient(config);
}
