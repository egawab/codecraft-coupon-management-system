/**
 * Notification Settings Page
 */

import { NotificationSettings } from '@/features/notifications/components/NotificationSettings';

export const metadata = {
  title: 'Notification Settings | Kobonz',
  description: 'Manage your notification preferences',
};

export default function NotificationSettingsPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <NotificationSettings />
    </div>
  );
}
