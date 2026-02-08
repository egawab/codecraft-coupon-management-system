/**
 * Platform-specific types and utilities
 */

/**
 * Platform detection
 */
export type Platform = 'web' | 'ios' | 'android';

/**
 * Device information
 */
export interface DeviceInfo {
  platform: Platform;
  osVersion: string;
  appVersion: string;
  deviceId: string;
  model?: string;
}

/**
 * Storage interface (works on web and mobile)
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Network information
 */
export interface NetworkInfo {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
}

/**
 * Geolocation
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Push notification token
 */
export interface PushToken {
  token: string;
  platform: Platform;
}

/**
 * Deep link
 */
export interface DeepLink {
  url: string;
  params: Record<string, string>;
}
