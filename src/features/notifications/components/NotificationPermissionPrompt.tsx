/**
 * Notification Permission Prompt Component
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationPermissionPrompt() {
  const { permission, requestPermission, subscribe } = useNotifications();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show after user has been on site for 30 seconds (good UX practice)
    const timer = setTimeout(() => {
      if (permission === 'default' && !isDismissed) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [permission, isDismissed]);

  if (permission !== 'default' || isDismissed || !showPrompt) {
    return null;
  }

  const handleAllow = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Subscribe to push notifications
      await subscribe();
    } else {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remember dismissal
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notification_prompt_dismissed', Date.now().toString());
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-top">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Stay Updated</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get notified about new deals, expiring coupons, and exclusive offers directly to your device.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAllow}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Enable Notifications
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
