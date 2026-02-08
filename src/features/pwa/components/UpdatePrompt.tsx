/**
 * Update Prompt Component
 * Shows when a new version of the app is available
 */

'use client';

import { RefreshCw } from 'lucide-react';
import { useServiceWorker } from '../hooks/usePWA';

export function UpdatePrompt() {
  const { updateAvailable, update } = useServiceWorker();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">New version available</p>
          </div>
          <button
            onClick={update}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
