/**
 * Native Push Notification Service for React Native
 * Implements the NotificationService interface from shared code
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { NotificationService } from '../../shared/core/notifications/notification-service';
import type {
  NotificationPayload,
  NotificationPreferences,
  PushSubscriptionData,
} from '../../features/notifications/types/notification.types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NativeNotificationService extends NotificationService {
  async requestPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async getPermissionStatus(): Promise<'granted' | 'denied' | 'default'> {
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'default';
  }

  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!Device.isDevice) {
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Load from config
      });

      const platform = Platform.OS === 'ios' ? 'mobile-ios' : 'mobile-android';

      return {
        id: '',
        userId: '',
        endpoint: token.data,
        platform,
        auth: '',
        p256dh: '',
        expirationTime: null,
        userAgent: `${Platform.OS} ${Platform.Version}`,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Subscribe error:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      // Expo doesn't have a direct unsubscribe, but we can remove notification listeners
      Notifications.removeAllNotificationListeners();
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  }

  async showLocal(notification: NotificationPayload): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: notification.silent ? undefined : true,
      },
      trigger: null, // Show immediately
    });
  }

  async getPreferences(): Promise<NotificationPreferences> {
    // TODO: Load from AsyncStorage or API
    return this.getDefaultPreferences();
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    // TODO: Save to AsyncStorage and sync with API
    console.log('Update preferences:', preferences);
  }

  async clearAll(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  async getDelivered(): Promise<NotificationPayload[]> {
    const notifications = await Notifications.getPresentedNotificationsAsync();
    
    return notifications.map((notif) => ({
      id: notif.request.identifier,
      channel: 'system' as any,
      priority: 'normal' as any,
      title: notif.request.content.title || '',
      body: notif.request.content.body || '',
      data: notif.request.content.data,
    }));
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

// Setup notification listeners
export function setupNotificationListeners() {
  // Handle notification received while app is in foreground
  Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
  });

  // Handle notification tapped
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification tapped:', response);
    
    // TODO: Navigate to relevant screen based on notification data
    const data = response.notification.request.content.data;
    if (data?.url) {
      // Navigate to URL
    }
  });
}
