/**
 * Platform detection utilities
 */

import type { Platform } from '../types/platform.types';

/**
 * Detect current platform
 */
export function getPlatform(): Platform {
  // Check if we're in a React Native environment
  // @ts-expect-error - Platform will exist in React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // @ts-expect-error - Platform will exist in React Native
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNPlatform = require('react-native').Platform;
    return RNPlatform.OS === 'ios' ? 'ios' : 'android';
  }

  // Otherwise, we're on web
  return 'web';
}

/**
 * Check if running on web
 */
export function isWeb(): boolean {
  return getPlatform() === 'web';
}

/**
 * Check if running on mobile
 */
export function isMobile(): boolean {
  const platform = getPlatform();
  return platform === 'ios' || platform === 'android';
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return getPlatform() === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return getPlatform() === 'android';
}

/**
 * Get device information
 */
export async function getDeviceInfo() {
  const platform = getPlatform();

  if (platform === 'web') {
    return {
      platform: 'web' as const,
      osVersion: navigator.userAgent,
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      deviceId: getWebDeviceId(),
    };
  }

  // On React Native, use react-native-device-info
  // @ts-expect-error - DeviceInfo will exist in React Native
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DeviceInfo = require('react-native-device-info');

  return {
    platform,
    osVersion: await DeviceInfo.getSystemVersion(),
    appVersion: DeviceInfo.getVersion(),
    deviceId: await DeviceInfo.getUniqueId(),
    model: await DeviceInfo.getModel(),
  };
}

/**
 * Generate or retrieve web device ID
 */
function getWebDeviceId(): string {
  const storageKey = 'device_id';

  // Try to get existing ID
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    // Generate new ID
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
}

/**
 * Check if feature is supported on current platform
 */
export function isFeatureSupported(feature: string): boolean {
  const platform = getPlatform();

  // Platform-specific feature support
  const features: Record<string, Platform[]> = {
    push_notifications: ['web', 'ios', 'android'],
    service_worker: ['web'],
    biometrics: ['ios', 'android'],
    camera: ['ios', 'android'],
    geolocation: ['web', 'ios', 'android'],
    file_picker: ['web', 'ios', 'android'],
  };

  return features[feature]?.includes(platform) ?? false;
}
