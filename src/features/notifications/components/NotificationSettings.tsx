/**
 * Notification Settings Component
 * Allows users to manage their notification preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Smartphone, Clock } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationSettings() {
  const { permission, isSubscribed, subscribe, unsubscribe, preferences, updatePreferences } = useNotifications();
  const [settings, setSettings] = useState(preferences);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setSettings(preferences);
    }
  }, [preferences]);

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleUpdatePreference = async (key: string, value: any) => {
    setSaving(true);
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      console.error('Update preference error:', error);
      // Revert on error
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification Settings</h2>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Permission Status */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium">
                Push Notifications {isSubscribed ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed
                  ? 'You will receive push notifications'
                  : 'Enable to receive real-time updates'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              isSubscribed
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
            disabled={permission === 'denied'}
          >
            {isSubscribed ? 'Disable' : 'Enable'}
          </button>
        </div>

        {permission === 'denied' && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
            <p className="text-yellow-800 dark:text-yellow-200">
              ⚠️ Notifications are blocked in your browser. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </div>

      {/* Master Toggle */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold mb-1">Enable All Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Turn all notifications on or off
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleUpdatePreference('enabled', e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="font-semibold mb-3">Notification Types</h3>
          
          <SettingToggle
            icon="🎫"
            label="Coupons"
            description="New coupons and deals from your favorite stores"
            checked={settings.channelCoupons}
            onChange={(checked) => handleUpdatePreference('channelCoupons', checked)}
            disabled={!settings.enabled || saving}
          />

          <SettingToggle
            icon="🏪"
            label="Stores"
            description="Store updates and approvals"
            checked={settings.channelStores}
            onChange={(checked) => handleUpdatePreference('channelStores', checked)}
            disabled={!settings.enabled || saving}
          />

          <SettingToggle
            icon="💰"
            label="Affiliate"
            description="Commission earnings and conversions"
            checked={settings.channelAffiliate}
            onChange={(checked) => handleUpdatePreference('channelAffiliate', checked)}
            disabled={!settings.enabled || saving}
          />

          <SettingToggle
            icon="🔔"
            label="System"
            description="Important system notifications"
            checked={settings.channelSystem}
            onChange={(checked) => handleUpdatePreference('channelSystem', checked)}
            disabled={!settings.enabled || saving}
          />

          <SettingToggle
            icon="📢"
            label="Marketing"
            description="Promotional offers and news"
            checked={settings.channelMarketing}
            onChange={(checked) => handleUpdatePreference('channelMarketing', checked)}
            disabled={!settings.enabled || saving}
          />
        </div>

        {/* Sound & Vibration */}
        <div className="mt-6 pt-6 border-t space-y-4">
          <h3 className="font-semibold mb-3">Notification Behavior</h3>

          <SettingToggle
            icon={<Volume2 className="h-5 w-5" />}
            label="Sound"
            description="Play sound for notifications"
            checked={settings.sound}
            onChange={(checked) => handleUpdatePreference('sound', checked)}
            disabled={!settings.enabled || saving}
          />

          <SettingToggle
            icon={<Smartphone className="h-5 w-5" />}
            label="Vibration"
            description="Vibrate on notification (mobile only)"
            checked={settings.vibration}
            onChange={(checked) => handleUpdatePreference('vibration', checked)}
            disabled={!settings.enabled || saving}
          />
        </div>

        {/* Quiet Hours */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Quiet Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Mute notifications during specified hours
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quietHoursEnabled}
                onChange={(e) => handleUpdatePreference('quietHoursEnabled', e.target.checked)}
                className="sr-only peer"
                disabled={!settings.enabled || saving}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={settings.quietHoursStart || '22:00'}
                  onChange={(e) => handleUpdatePreference('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd || '08:00'}
                  onChange={(e) => handleUpdatePreference('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Notification */}
      <div className="pt-6 border-t">
        <button
          onClick={async () => {
            // TODO: Send test notification
            console.log('Send test notification');
          }}
          className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          disabled={!isSubscribed}
        >
          Send Test Notification
        </button>
      </div>
    </div>
  );
}

// Helper component for settings toggle
interface SettingToggleProps {
  icon: React.ReactNode | string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SettingToggle({ icon, label, description, checked, onChange, disabled }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="flex items-start gap-3 flex-1">
        <div className="text-2xl">{icon}</div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
          disabled={disabled}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
      </label>
    </div>
  );
}
