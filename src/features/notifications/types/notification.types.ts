/**
 * Notification types for cross-platform use
 */

/**
 * Notification channels (for categorization)
 */
export enum NotificationChannel {
  COUPONS = 'coupons',
  STORES = 'stores',
  AFFILIATE = 'affiliate',
  SYSTEM = 'system',
  MARKETING = 'marketing',
}

/**
 * Notification priority
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification payload (what gets sent)
 */
export interface NotificationPayload {
  id: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  url?: string;
  tag?: string;
  silent?: boolean;
}

/**
 * Notification action button
 */
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  channels: {
    [NotificationChannel.COUPONS]: boolean;
    [NotificationChannel.STORES]: boolean;
    [NotificationChannel.AFFILIATE]: boolean;
    [NotificationChannel.SYSTEM]: boolean;
    [NotificationChannel.MARKETING]: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
  sound: boolean;
  vibration: boolean;
}

/**
 * Push subscription (stored in database)
 */
export interface PushSubscriptionData {
  id: string;
  userId: string;
  endpoint: string;
  platform: 'web' | 'ios' | 'android';
  auth: string;
  p256dh: string;
  expirationTime?: number | null;
  userAgent?: string;
  createdAt: string;
  lastUsedAt: string;
}

/**
 * Notification delivery status
 */
export interface NotificationDelivery {
  id: string;
  notificationId: string;
  subscriptionId: string;
  status: 'pending' | 'sent' | 'failed' | 'clicked' | 'dismissed';
  sentAt?: string;
  clickedAt?: string;
  dismissedAt?: string;
  error?: string;
}
