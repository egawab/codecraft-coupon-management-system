/**
 * Cross-platform notification service
 * Handles sending notifications on web and mobile
 */

import type {
  NotificationPayload,
  NotificationPreferences,
  PushSubscriptionData,
} from '../types/notification.types';

/**
 * Abstract notification service
 * Platform-specific implementations will extend this
 */
export abstract class NotificationService {
  /**
   * Request notification permission
   */
  abstract requestPermission(): Promise<boolean>;

  /**
   * Get current permission status
   */
  abstract getPermissionStatus(): Promise<'granted' | 'denied' | 'default'>;

  /**
   * Subscribe to push notifications
   */
  abstract subscribe(): Promise<PushSubscriptionData | null>;

  /**
   * Unsubscribe from push notifications
   */
  abstract unsubscribe(): Promise<boolean>;

  /**
   * Show local notification
   */
  abstract showLocal(notification: NotificationPayload): Promise<void>;

  /**
   * Get notification preferences
   */
  abstract getPreferences(): Promise<NotificationPreferences>;

  /**
   * Update notification preferences
   */
  abstract updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void>;

  /**
   * Clear all notifications
   */
  abstract clearAll(): Promise<void>;

  /**
   * Get delivered notifications
   */
  abstract getDelivered(): Promise<NotificationPayload[]>;
}

/**
 * Web notification service implementation
 */
export class WebNotificationService extends NotificationService {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async getPermissionStatus(): Promise<'granted' | 'denied' | 'default'> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    return Notification.permission;
  }

  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      throw new Error('VAPID public key not configured');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
    });

    // Convert to our format
    const subscriptionJson = subscription.toJSON();

    return {
      id: '', // Will be set by server
      userId: '', // Will be set by server
      endpoint: subscription.endpoint,
      platform: 'web',
      auth: subscriptionJson.keys?.auth || '',
      p256dh: subscriptionJson.keys?.p256dh || '',
      expirationTime: subscription.expirationTime,
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };
  }

  async unsubscribe(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return await subscription.unsubscribe();
    }

    return false;
  }

  async showLocal(notification: NotificationPayload): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service worker not supported');
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      image: notification.image,
      data: notification.data,
      tag: notification.tag,
      silent: notification.silent,
      actions: notification.actions,
    });
  }

  async getPreferences(): Promise<NotificationPreferences> {
    // TODO: Fetch from local storage or API
    return this.getDefaultPreferences();
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    // TODO: Save to local storage and sync with API
    console.log('Updating preferences:', preferences);
  }

  async clearAll(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();

    notifications.forEach((notification) => notification.close());
  }

  async getDelivered(): Promise<NotificationPayload[]> {
    if (!('serviceWorker' in navigator)) {
      return [];
    }

    const registration = await navigator.serviceWorker.ready;
    const notifications = await registration.getNotifications();

    return notifications.map((notification) => ({
      id: notification.tag || '',
      channel: (notification.data?.channel as any) || 'system',
      priority: (notification.data?.priority as any) || 'normal',
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      image: notification.image,
      data: notification.data,
    }));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      channels: {
        coupons: true,
        stores: true,
        affiliate: true,
        system: true,
        marketing: false,
      },
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      sound: true,
      vibration: true,
    };
  }
}

/**
 * Create notification service instance
 */
export function createNotificationService(): NotificationService {
  // On web, use WebNotificationService
  // On mobile, this would be replaced with a React Native implementation
  return new WebNotificationService();
}
