# Kobonz Mobile App (React Native)

> **Note**: This is the mobile app structure. The actual React Native setup is not yet implemented.
> This folder provides the structure and guidelines for when mobile development begins.

## 📱 Overview

This is the React Native mobile application for Kobonz, sharing ~70% of code with the web application.

## 🏗️ Architecture

### Shared Code
The mobile app uses shared code from `src/shared/`:
- **API Client**: Platform-agnostic HTTP client
- **Business Logic**: Services for auth, coupons, stores, etc.
- **State Management**: Zustand stores
- **Types**: TypeScript definitions
- **Utilities**: Helper functions

### Mobile-Specific Code
Platform-specific implementations:
- **Navigation**: React Navigation
- **UI Components**: React Native components
- **Native Modules**: Platform-specific features

## 📂 Folder Structure

```
mobile/
├── src/
│   ├── screens/              # Screen components
│   │   ├── Home/
│   │   ├── Coupons/
│   │   ├── Stores/
│   │   ├── Profile/
│   │   └── Auth/
│   ├── components/           # Mobile UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── ...
│   ├── navigation/           # React Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── hooks/                # Mobile-specific hooks
│   ├── utils/                # Mobile utilities
│   └── native-modules/       # Platform-specific native code
├── ios/                      # iOS native code
├── android/                  # Android native code
├── app.json                  # Expo/RN configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI or Expo CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# iOS only - install pods
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🔄 Code Sharing

### Using Shared Services

```typescript
// Import shared service
import { CouponService } from '../shared/core/coupons/coupon.service';
import { createApiClient } from '../shared/api/client';

// Create API client (React Native implementation)
const apiClient = createApiClient({
  baseURL: 'https://api.kobonz.com',
});

// Use shared service
const couponService = new CouponService(apiClient);
const coupons = await couponService.search();
```

### Using Shared Stores

```typescript
import { useAuthStore } from '../shared/stores/auth.store';

function ProfileScreen() {
  const { user, logout } = useAuthStore();
  
  // Use shared state
  return (
    <View>
      <Text>{user?.name}</Text>
      <Button onPress={logout} title="Logout" />
    </View>
  );
}
```

## 🎨 UI Components

### Web vs Mobile Components

```typescript
// Web Component
import { Button } from '@/components/ui/button';

// Mobile Component
import { Button } from '../components/Button';

// Both use the same props interface
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}
```

## 📡 API Integration

The mobile app uses the same API client as the web app:

```typescript
// Platform-specific API client implementation
import { BaseApiClient } from '../shared/api/client';

class ReactNativeApiClient extends BaseApiClient {
  protected async request<T>(config: ApiRequestConfig): Promise<T> {
    // Use fetch or axios
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data ? JSON.stringify(config.data) : undefined,
    });
    
    return response.json();
  }
}
```

## 🔔 Push Notifications

```typescript
import { NotificationService } from '../features/notifications/services/notification-service';

// React Native implementation
class ReactNativeNotificationService extends NotificationService {
  // Use react-native-push-notification or FCM
  async requestPermission(): Promise<boolean> {
    // Implementation using React Native libraries
  }
}
```

## 🧭 Navigation

```typescript
// Using React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 🔐 Authentication

Using shared auth service:

```typescript
import { AuthService } from '../shared/core/auth/auth.service';
import { useAuthStore } from '../shared/stores/auth.store';

function LoginScreen() {
  const authService = new AuthService(apiClient);
  const { login } = useAuthStore();
  
  const handleLogin = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    login(response.user, {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });
  };
}
```

## 📦 Dependencies

### Core Dependencies
- `react-native`: UI framework
- `@react-navigation/native`: Navigation
- `zustand`: State management (shared with web)
- `react-query` or `swr`: Server state management

### Native Modules
- `react-native-push-notification`: Push notifications
- `react-native-device-info`: Device information
- `@react-native-async-storage/async-storage`: Storage
- `react-native-camera`: Camera access
- `react-native-geolocation`: Location services

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (Detox)
npm run test:e2e
```

## 📱 Platform-Specific Code

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}
```

## 🚀 Building & Deployment

### iOS

```bash
# Development build
npm run ios

# Production build
cd ios
xcodebuild archive
```

### Android

```bash
# Development build
npm run android

# Production build
cd android
./gradlew assembleRelease
```

## 📚 Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Status**: Structure prepared, implementation pending
**Last Updated**: 2026-02-08
