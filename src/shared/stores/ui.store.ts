/**
 * Shared UI state management
 */

import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  locale: string;
  isOnline: boolean;
  isSidebarOpen: boolean;
  notifications: {
    enabled: boolean;
    count: number;
  };
}

interface UIActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: string) => void;
  setOnline: (online: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNotificationCount: (count: number) => void;
  incrementNotificationCount: () => void;
  clearNotificationCount: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // State
  theme: 'system',
  locale: 'en',
  isOnline: true,
  isSidebarOpen: false,
  notifications: {
    enabled: false,
    count: 0,
  },

  // Actions
  setTheme: (theme) => set({ theme }),

  setLocale: (locale) => set({ locale }),

  setOnline: (online) => set({ isOnline: online }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  setNotificationCount: (count) =>
    set((state) => ({
      notifications: { ...state.notifications, count },
    })),

  incrementNotificationCount: () =>
    set((state) => ({
      notifications: {
        ...state.notifications,
        count: state.notifications.count + 1,
      },
    })),

  clearNotificationCount: () =>
    set((state) => ({
      notifications: { ...state.notifications, count: 0 },
    })),
}));
