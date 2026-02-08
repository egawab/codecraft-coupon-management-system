/**
 * Storage Adapter for React Native
 * Implements StorageAdapter interface using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '../../shared/types/platform.types';

export const storage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

// Configure Zustand to use AsyncStorage
export const zustandStorage = {
  getItem: async (name: string) => {
    const value = await storage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: any) => {
    await storage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await storage.removeItem(name);
  },
};
