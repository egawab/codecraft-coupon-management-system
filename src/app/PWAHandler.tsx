'use client';

import { useEffect } from 'react';
import { PWAInstallPrompt } from '@/features/pwa/components/PWAInstallPrompt';
import { UpdatePrompt } from '@/features/pwa/components/UpdatePrompt';

/**
 * PWA Handler Component
 * Manages PWA functionality and prompts
 */
export function PWAHandler() {
  useEffect(() => {
    // Register service worker manually if needed
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <>
      <PWAInstallPrompt />
      <UpdatePrompt />
    </>
  );
}
