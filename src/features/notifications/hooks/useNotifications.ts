/**
 * Notification hooks for cross-platform use
 */

import { useState, useEffect, useCallback } from 'react';
import { createNotificationService } from '../services/notification-service';
import type {
  NotificationPayload,
  NotificationPreferences,
} from '../types/notification.types';

/**
 * Hook to manage notifications
 */
export function useNotifications() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const service = createNotificationService();

  // Check permission status on mount
  useEffect(() => {
    service.getPermissionStatus().then(setPermission);
    service.getPreferences().then(setPreferences);
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const granted = await service.requestPermission();
      setPermission(granted ? 'granted' : 'denied');
      return granted;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const subscription = await service.subscribe();
      if (subscription) {
        // Send subscription to backend
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });

        if (response.ok) {
          setIsSubscribed(true);
          return subscription;
        }
      }
      return null;
    } catch (error) {
      console.error('Subscribe error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current subscription endpoint
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Remove from backend
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      const success = await service.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // Show local notification
  const showNotification = useCallback(
    async (notification: NotificationPayload) => {
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }
      await service.showLocal(notification);
    },
    [service, permission]
  );

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      await service.updatePreferences(newPreferences);
      const updated = await service.getPreferences();
      setPreferences(updated);
    },
    [service]
  );

  // Clear all notifications
  const clearAll = useCallback(async () => {
    await service.clearAll();
  }, [service]);

  return {
    permission,
    isSubscribed,
    preferences,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    updatePreferences,
    clearAll,
  };
}

/**
 * Hook to listen for notification events
 */
export function useNotificationListener(
  onNotification: (notification: NotificationPayload) => void
) {
  useEffect(() => {
    // TODO: Add event listener for incoming notifications
    // This would be implemented differently on web vs mobile
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION') {
        onNotification(event.data.notification);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [onNotification]);
}
