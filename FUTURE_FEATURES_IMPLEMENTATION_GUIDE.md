# Future Features Implementation Guide

This guide explains how to implement the prepared future features in Kobonz.

---

## 📋 Overview

The codebase has been refactored to support six major future features:

1. **PWA (Progressive Web App)**
2. **Push Notifications**
3. **Mobile App (React Native)**
4. **AI-based Recommendations**
5. **Multi-language Support (i18n)**
6. **Loyalty System**

**Status**: Architecture prepared, implementation ready to begin.

---

## 🏗️ Architecture Changes

### New Folder Structure

```
src/
├── features/              # Feature-based modules
│   ├── pwa/              # PWA components & hooks
│   ├── notifications/     # Push notifications
│   ├── recommendations/   # AI recommendations
│   ├── i18n/             # Internationalization
│   └── loyalty/          # Loyalty system
├── shared/               # Cross-platform shared code
│   ├── api/              # API client
│   ├── core/             # Business logic services
│   ├── stores/           # State management (Zustand)
│   ├── types/            # Shared types
│   └── utils/            # Platform-agnostic utilities
├── workers/              # Service workers
├── config/               # Configuration files
mobile/                   # React Native app (future)
ml/                       # ML models (future)
public/locales/           # Translation files
prisma/schema-extensions/ # Future database schemas
```

---

## 🚀 Implementation Roadmap

### Phase 1: PWA (Week 1-2)

**Prerequisites:**
- HTTPS enabled
- Service worker support verified

**Steps:**

1. **Build service worker:**
   ```bash
   # Install workbox
   npm install workbox-webpack-plugin
   
   # Build service worker from src/workers/service-worker.ts
   npx tsc src/workers/service-worker.ts --outDir public
   ```

2. **Update `next.config.mjs`:**
   ```javascript
   const withPWA = require('next-pwa')({
     dest: 'public',
     register: true,
     skipWaiting: true,
   });
   
   module.exports = withPWA({
     // existing config
   });
   ```

3. **Update `public/manifest.json`:**
   - Use config from `src/config/pwa.config.ts`
   - Generate icons (72x72 to 512x512)

4. **Add to layout:**
   ```tsx
   // src/app/layout.tsx
   import { PWAInstallPrompt } from '@/features/pwa/components/PWAInstallPrompt';
   import { UpdatePrompt } from '@/features/pwa/components/UpdatePrompt';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <PWAInstallPrompt />
           <UpdatePrompt />
         </body>
       </html>
     );
   }
   ```

5. **Test offline functionality:**
   - Disable network in DevTools
   - Verify cached pages load
   - Test offline fallback page

**Resources:**
- `src/config/pwa.config.ts`
- `src/workers/service-worker.ts`
- `src/features/pwa/`

---

### Phase 2: Push Notifications (Week 2-3)

**Prerequisites:**
- PWA implemented
- VAPID keys generated
- FCM configured

**Steps:**

1. **Generate VAPID keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Add environment variables:**
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
   VAPID_PRIVATE_KEY="your-private-key"
   ```

3. **Add database models:**
   - Copy from `prisma/schema-extensions/notifications.prisma`
   - Add to `prisma/schema.prisma`
   - Run `npx prisma migrate dev`

4. **Create API endpoints:**
   ```typescript
   // src/app/api/notifications/subscribe/route.ts
   import { subscribeToPush } from '@/workers/push-manager';
   
   export async function POST(request: Request) {
     const subscription = await request.json();
     // Save to database
     // Return success
   }
   ```

5. **Add notification permission prompt:**
   ```tsx
   // Add to main layout
   import { NotificationPermissionPrompt } from '@/features/notifications/components/NotificationPermissionPrompt';
   ```

6. **Test notifications:**
   - Request permission
   - Subscribe
   - Send test notification from backend

**Resources:**
- `src/features/notifications/`
- `src/workers/push-manager.ts`
- `prisma/schema-extensions/notifications.prisma`

---

### Phase 3: Mobile App (Week 4-8)

**Prerequisites:**
- React Native CLI or Expo installed
- Xcode (iOS) / Android Studio (Android)

**Steps:**

1. **Initialize React Native:**
   ```bash
   cd mobile
   npx react-native init KobonzMobile
   ```

2. **Install dependencies:**
   ```bash
   npm install zustand @react-navigation/native
   npm install react-native-push-notification
   npm install @react-native-async-storage/async-storage
   ```

3. **Link shared code:**
   ```json
   // mobile/package.json
   {
     "dependencies": {
       "kobonz-shared": "file:../src/shared"
     }
   }
   ```

4. **Create navigation:**
   ```tsx
   // mobile/src/navigation/RootNavigator.tsx
   import { useAuthStore } from '../../shared/stores/auth.store';
   
   function RootNavigator() {
     const { isAuthenticated } = useAuthStore();
     return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
   }
   ```

5. **Implement screens:**
   - Use shared services from `src/shared/core/`
   - Use shared state from `src/shared/stores/`
   - Create platform-specific UI

**Resources:**
- `mobile/README.md`
- `src/shared/` (all shared code)

---

### Phase 4: AI Recommendations (Week 6-10)

**Prerequisites:**
- Training data collected
- Python environment for ML
- TensorFlow.js or model API

**Steps:**

1. **Collect training data:**
   ```sql
   -- Export user behavior data
   SELECT userId, couponId, eventType, timestamp
   FROM analytics_events
   WHERE eventType IN ('view', 'click', 'copy');
   ```

2. **Train ML model:**
   ```bash
   cd ml
   pip install -r requirements.txt
   python training/train_recommender.py
   ```

3. **Convert to TensorFlow.js:**
   ```bash
   tensorflowjs_converter \
     --input_format=keras \
     ./models/recommender.h5 \
     ./public/models/recommender/
   ```

4. **Enable ML features:**
   ```env
   NEXT_PUBLIC_ML_ENABLED=true
   ```

5. **Add recommendation component:**
   ```tsx
   import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations';
   
   function RecommendedCoupons() {
     const { recommendations, isLoading } = useRecommendations({
       userId: user.id,
       limit: 10,
     });
     
     return <CouponGrid coupons={recommendations} />;
   }
   ```

6. **Track behavior:**
   ```tsx
   import { useBehaviorTracking } from '@/features/recommendations/hooks/useRecommendations';
   
   const { trackView, trackClick } = useBehaviorTracking();
   
   // Track events
   trackView(couponId, userId);
   ```

**Resources:**
- `src/features/recommendations/`
- `ml/README.md`

---

### Phase 5: Multi-language (Week 3-4)

**Prerequisites:**
- Translation files prepared
- i18next installed

**Steps:**

1. **Install i18next:**
   ```bash
   npm install i18next react-i18next i18next-browser-languagedetector
   ```

2. **Add translations:**
   - Copy from `public/locales/en/` to create other locales
   - Translate all JSON files
   - Add to `public/locales/{locale}/`

3. **Configure i18next:**
   ```typescript
   // src/features/i18n/init.ts
   import i18n from 'i18next';
   import { initReactI18next } from 'react-i18next';
   
   i18n
     .use(initReactI18next)
     .init({
       resources: { /* load translations */ },
       lng: 'en',
       fallbackLng: 'en',
     });
   ```

4. **Use translations:**
   ```tsx
   import { useTranslation } from '@/features/i18n/hooks/useTranslation';
   
   function MyComponent() {
     const { t, locale, changeLocale } = useTranslation();
     
     return <h1>{t('common.welcome')}</h1>;
   }
   ```

5. **Add language selector:**
   ```tsx
   import { LanguageSelector } from '@/features/i18n/components/LanguageSelector';
   ```

6. **Format numbers/dates:**
   ```tsx
   import { formatCurrency, formatDate } from '@/features/i18n/utils/formatters';
   
   formatCurrency(99.99, locale, 'USD');
   formatDate(new Date(), locale);
   ```

**Resources:**
- `src/features/i18n/`
- `public/locales/`

---

### Phase 6: Loyalty System (Week 5-7)

**Prerequisites:**
- Database schema updated
- Business rules defined

**Steps:**

1. **Add database models:**
   - Copy from `prisma/schema-extensions/loyalty.prisma`
   - Add to `prisma/schema.prisma`
   - Run `npx prisma migrate dev`

2. **Seed achievements:**
   ```typescript
   // prisma/seed.ts
   import { ACHIEVEMENTS } from '@/features/loyalty/config/loyalty.config';
   
   for (const achievement of ACHIEVEMENTS) {
     await prisma.achievement.create({ data: achievement });
   }
   ```

3. **Create API endpoints:**
   ```typescript
   // src/app/api/loyalty/account/route.ts
   export async function GET(request: Request) {
     const userId = getUserId(request);
     const account = await prisma.loyaltyAccount.findUnique({
       where: { userId },
     });
     return Response.json({ data: account });
   }
   ```

4. **Award points automatically:**
   ```typescript
   // When coupon is used
   import { LoyaltyService } from '@/features/loyalty/services/loyalty.service';
   
   await loyaltyService.awardPoints('EARN_COUPON_USE', 10, {
     couponId: coupon.id,
   });
   ```

5. **Add loyalty dashboard:**
   ```tsx
   import { useLoyalty } from '@/features/loyalty/hooks/useLoyalty';
   
   function LoyaltyDashboard() {
     const { account, transactions, achievements } = useLoyalty();
     
     return (
       <div>
         <PointsBalance points={account.points} />
         <TierBadge tier={account.tier} />
         <AchievementList achievements={achievements} />
       </div>
     );
   }
   ```

**Resources:**
- `src/features/loyalty/`
- `prisma/schema-extensions/loyalty.prisma`

---

## 🔧 Development Workflow

### Adding a New Feature

1. **Create feature folder:**
   ```
   src/features/[feature-name]/
   ├── types/
   ├── services/
   ├── hooks/
   ├── components/
   └── config/
   ```

2. **Define types:**
   ```typescript
   // src/features/[feature]/types/[feature].types.ts
   export interface FeatureData { /* ... */ }
   ```

3. **Create service:**
   ```typescript
   // src/features/[feature]/services/[feature].service.ts
   export class FeatureService {
     constructor(private apiClient: ApiClient) {}
   }
   ```

4. **Create hooks:**
   ```typescript
   // src/features/[feature]/hooks/useFeature.ts
   export function useFeature() {
     const service = new FeatureService(apiClient);
     // ...
   }
   ```

5. **Add components:**
   ```typescript
   // src/features/[feature]/components/FeatureComponent.tsx
   export function FeatureComponent() { /* ... */ }
   ```

---

## 📊 Feature Flags

Enable/disable features without code changes:

```typescript
// src/shared/types/feature-flags.types.ts
export const featureFlags = {
  pwa_enabled: true,
  push_notifications_enabled: true,
  ai_recommendations_enabled: false,
  loyalty_system_enabled: false,
  i18n_enabled: true,
};
```

Usage:
```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

if (useFeatureFlag('ai_recommendations_enabled')) {
  // Show AI recommendations
}
```

---

## 🧪 Testing

### Test Shared Code

```bash
# Test business logic (works on web and mobile)
npm test src/shared/
```

### Test Features

```bash
# Test PWA
npm run test:pwa

# Test notifications
npm run test:notifications

# Test i18n
npm run test:i18n
```

### E2E Testing

```bash
# Web
npm run test:e2e

# Mobile
cd mobile && npm run test:e2e
```

---

## 📦 Dependencies to Install

### PWA
```bash
npm install next-pwa workbox-webpack-plugin
```

### Push Notifications
```bash
npm install web-push
```

### Mobile (React Native)
```bash
npm install react-native @react-navigation/native
npm install react-native-push-notification
npm install @react-native-async-storage/async-storage
```

### AI/ML
```bash
npm install @tensorflow/tfjs
pip install tensorflow scikit-learn pandas
```

### i18n
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### State Management
```bash
npm install zustand
```

---

## 🚨 Important Notes

1. **Do NOT delete existing code** - All refactoring is additive
2. **Test thoroughly** before enabling features in production
3. **Use feature flags** to gradually roll out features
4. **Monitor performance** - especially for ML features
5. **Collect user feedback** during beta testing

---

## 📚 Additional Resources

- **Architecture Overview**: `ARCHITECTURE_REFACTOR.md`
- **PWA Guide**: `src/features/pwa/README.md`
- **Mobile App Guide**: `mobile/README.md`
- **ML Guide**: `ml/README.md`

---

## 🆘 Troubleshooting

### Common Issues

**Service worker not registering:**
- Check HTTPS is enabled
- Verify `public/sw.js` exists
- Check browser console for errors

**Shared code not working on mobile:**
- Verify import paths
- Check platform detection
- Use platform-specific adapters

**ML model not loading:**
- Check model files in `public/models/`
- Verify TensorFlow.js version
- Test with smaller model first

**Translations not loading:**
- Verify JSON files in `public/locales/`
- Check locale code format
- Test with default locale first

---

**Last Updated**: 2026-02-08  
**Version**: 1.0.0
