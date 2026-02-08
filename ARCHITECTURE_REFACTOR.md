# Architecture Refactor Plan

## Overview
Restructuring Kobonz codebase to support future features while maintaining current functionality.

---

## 🎯 Future Features to Support

1. **PWA (Progressive Web App)**
   - Offline functionality
   - Service workers
   - App manifest
   - Install prompts

2. **Push Notifications**
   - Web Push API
   - FCM integration
   - Notification preferences
   - Cross-platform delivery

3. **Mobile App (React Native)**
   - Shared business logic
   - Platform-specific UI
   - Code reusability ~70%

4. **AI-based Coupon Recommendations**
   - ML model integration
   - User behavior tracking
   - Personalization engine
   - A/B testing framework

5. **Multi-language Support (i18n)**
   - Translation management
   - RTL support
   - Locale detection
   - Dynamic content translation

6. **Enhanced Loyalty System**
   - Points tracking
   - Reward tiers
   - Gamification
   - Achievement system

---

## 📂 New Folder Structure

```
kobonz/
├── src/
│   ├── app/                          # Next.js App Router (Web only)
│   ├── features/                     # 🆕 Feature-based modules (SHARED)
│   │   ├── auth/
│   │   │   ├── components/          # React components
│   │   │   ├── hooks/               # Custom hooks
│   │   │   ├── services/            # API calls
│   │   │   ├── store/               # State management
│   │   │   ├── types/               # TypeScript types
│   │   │   ├── utils/               # Helpers
│   │   │   └── validations/         # Zod schemas
│   │   ├── coupons/
│   │   ├── stores/
│   │   ├── affiliates/
│   │   ├── analytics/
│   │   ├── notifications/           # 🆕 Push notifications
│   │   ├── recommendations/         # 🆕 AI recommendations
│   │   ├── loyalty/                 # 🆕 Loyalty system
│   │   └── i18n/                    # 🆕 Internationalization
│   ├── shared/                       # 🆕 Cross-platform shared code
│   │   ├── api/                     # API client (works on web & mobile)
│   │   ├── core/                    # Business logic
│   │   ├── types/                   # Shared types
│   │   ├── utils/                   # Platform-agnostic utilities
│   │   ├── constants/               # Constants
│   │   ├── hooks/                   # Shared hooks
│   │   └── stores/                  # State management (Zustand/Redux)
│   ├── lib/                          # Server-side only utilities
│   ├── components/                   # Web UI components
│   ├── middleware/
│   ├── workers/                      # 🆕 Service workers, web workers
│   └── config/                       # 🆕 Centralized config
├── mobile/                            # 🆕 React Native app
│   ├── src/
│   │   ├── screens/                 # Mobile screens
│   │   ├── components/              # Mobile-specific components
│   │   ├── navigation/              # React Navigation
│   │   └── native-modules/          # Platform-specific code
│   ├── ios/
│   └── android/
├── packages/                          # 🆕 Monorepo packages (optional)
│   ├── shared-core/                 # Shared business logic
│   ├── shared-types/                # Shared TypeScript types
│   └── shared-ui/                   # Shared UI primitives
├── prisma/                           # Database schema
├── public/
│   ├── sw.js                        # 🆕 Service worker
│   ├── manifest.json                # 🆕 PWA manifest
│   └── locales/                     # 🆕 Translation files
└── ml/                               # 🆕 AI/ML models
    ├── models/
    ├── training/
    └── api/
```

---

## 🏗️ Architecture Patterns

### 1. Feature-Based Organization
Each feature is self-contained with all its dependencies.

### 2. Shared Core Pattern
```
┌─────────────┐     ┌─────────────┐
│   Web App   │     │ Mobile App  │
│  (Next.js)  │     │   (React    │
│             │     │   Native)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └────────┬──────────┘
                │
        ┌───────▼────────┐
        │  Shared Core   │
        │  - Business    │
        │    Logic       │
        │  - API Client  │
        │  - Types       │
        │  - Utils       │
        └────────────────┘
```

### 3. Layered Architecture
```
┌─────────────────────────────────┐
│  Presentation Layer             │
│  (Components, Pages, Screens)   │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│  Application Layer              │
│  (Hooks, State, Features)       │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│  Domain Layer                   │
│  (Business Logic, Services)     │
└─────────────┬───────────────────┘
              │
┌─────────────▼───────────────────┐
│  Infrastructure Layer           │
│  (API, DB, Cache, External)     │
└─────────────────────────────────┘
```

---

## 🔧 Technology Stack Updates

### Current
- Next.js 14
- Prisma + PostgreSQL
- Redis (Upstash)
- Stripe
- NextAuth

### New Additions
- **Zustand/Jotai** - Lightweight state management (shared)
- **React Native** - Mobile apps
- **Workbox** - Service worker tooling
- **i18next** - Internationalization
- **TensorFlow.js / ONNX** - Client-side ML
- **Firebase Cloud Messaging** - Push notifications
- **Turbo/Nx** - Monorepo tooling (optional)

---

## 📦 Module Boundaries

### Shared Modules (Web + Mobile)
- API client
- Business logic
- Type definitions
- Validation schemas
- Utilities
- State management
- Constants

### Web-Only Modules
- Server-side rendering
- API routes
- Middleware
- Service workers
- SEO utilities

### Mobile-Only Modules
- Native modules
- Platform-specific UI
- Navigation
- Push notification handlers

---

## 🚀 Migration Strategy

### Phase 1: Restructure (Current Phase)
- Create new folder structure
- Define interfaces and contracts
- Setup module boundaries
- No breaking changes

### Phase 2: Gradual Migration
- Move existing code feature by feature
- Maintain backward compatibility
- Test thoroughly

### Phase 3: Platform Expansion
- Implement PWA features
- Create React Native app
- Add AI/ML capabilities
- Enable multi-language

---

## 📋 Feature Architecture Details

### 1. PWA Architecture
```
src/workers/
├── service-worker.ts      # Main SW
├── push-manager.ts        # Push notifications
├── cache-strategies.ts    # Caching logic
└── sync-manager.ts        # Background sync

src/config/
└── pwa.config.ts          # PWA configuration

public/
├── sw.js                  # Compiled SW
├── manifest.json          # App manifest
└── offline.html           # Offline fallback
```

### 2. Push Notifications Architecture
```
src/features/notifications/
├── services/
│   ├── push-service.ts           # Push API wrapper
│   ├── fcm-service.ts            # FCM integration
│   └── notification-manager.ts   # Notification logic
├── hooks/
│   ├── useNotifications.ts
│   ├── usePushSubscription.ts
│   └── useNotificationPermission.ts
├── components/
│   ├── NotificationPrompt.tsx
│   └── NotificationSettings.tsx
└── types/
    └── notification.types.ts
```

### 3. React Native Shared Code
```
shared/
├── api/
│   └── client.ts          # Platform-agnostic API client
├── core/
│   ├── auth/              # Auth business logic
│   ├── coupons/           # Coupon business logic
│   └── stores/            # Store business logic
├── stores/                # Zustand stores
│   ├── auth.store.ts
│   ├── coupons.store.ts
│   └── ui.store.ts
└── utils/
    └── platform.ts        # Platform detection
```

### 4. AI Recommendations Architecture
```
src/features/recommendations/
├── services/
│   ├── recommendation-engine.ts  # ML model integration
│   ├── behavior-tracker.ts       # User tracking
│   └── personalization.ts        # Personalization logic
├── ml/
│   ├── model-loader.ts           # Load TensorFlow models
│   ├── inference.ts              # Run predictions
│   └── feature-engineering.ts   # Feature extraction
└── types/
    └── recommendation.types.ts

ml/
├── models/
│   ├── coupon-recommender.json   # Trained model
│   └── user-embeddings.json
└── training/
    └── train.py                  # Training scripts
```

### 5. i18n Architecture
```
src/features/i18n/
├── config/
│   └── i18n.config.ts     # i18next configuration
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── coupons.json
│   │   └── stores.json
│   ├── es/
│   ├── fr/
│   └── ar/                # RTL language
├── hooks/
│   ├── useTranslation.ts
│   └── useLocale.ts
└── utils/
    ├── detect-locale.ts
    └── format-currency.ts
```

### 6. Loyalty System Architecture
```
src/features/loyalty/
├── services/
│   ├── points-service.ts         # Points calculations
│   ├── rewards-service.ts        # Reward management
│   ├── achievements-service.ts   # Achievement tracking
│   └── tier-service.ts           # Tier progression
├── components/
│   ├── PointsBalance.tsx
│   ├── RewardsCatalog.tsx
│   ├── AchievementBadge.tsx
│   └── TierProgress.tsx
├── hooks/
│   ├── usePoints.ts
│   └── useRewards.ts
└── types/
    └── loyalty.types.ts

prisma/schema.prisma:
├── LoyaltyAccount
├── LoyaltyTransaction
├── Reward
├── Achievement
└── UserAchievement
```

---

## 🔑 Key Principles

1. **Separation of Concerns**
   - UI separate from business logic
   - Business logic separate from data access

2. **Platform Agnostic Core**
   - Shared code works everywhere
   - No platform-specific imports in shared code

3. **Feature Independence**
   - Features can be developed independently
   - Minimal cross-feature dependencies

4. **Progressive Enhancement**
   - Core functionality works without JS
   - Enhanced features added progressively

5. **Type Safety**
   - Strong TypeScript typing
   - Runtime validation where needed

---

## 🧪 Testing Strategy

```
src/features/[feature]/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
```

- **Unit Tests**: Pure functions, utilities
- **Integration Tests**: Feature workflows
- **E2E Tests**: User flows across platforms

---

## 📊 State Management Strategy

### Global State (Zustand)
- Authentication state
- User preferences
- Cart/Session data
- UI state (theme, locale)

### Server State (React Query / SWR)
- API data caching
- Optimistic updates
- Background refetching

### Local State (React)
- Form state
- UI interactions
- Component-specific state

---

## 🔐 Security Considerations

1. **Code Splitting by Platform**
   - Server secrets never in client bundles
   - API keys properly segregated

2. **API Layer Abstraction**
   - Single source of truth for API calls
   - Centralized auth token management

3. **Type Safety at Boundaries**
   - Validate all external data
   - Type-safe API contracts

---

## 📈 Performance Considerations

1. **Code Sharing**
   - ~70% code reuse target
   - Shared bundle optimization

2. **Lazy Loading**
   - Feature-based code splitting
   - Dynamic imports for heavy features

3. **Caching Strategy**
   - Service worker cache
   - Redis server cache
   - React Query cache

---

## 🎨 UI Component Strategy

### Shared UI Primitives
```typescript
// Can be styled differently per platform
<Button />
<Input />
<Card />
<Modal />
```

### Platform-Specific Layouts
```typescript
// Web: Next.js components
// Mobile: React Native components
```

### Headless Components
```typescript
// Logic-only components
// Platform provides the UI
```

---

## 🔄 Data Flow

```
User Action
    ↓
Component/Screen
    ↓
Hook/Store
    ↓
Service (Shared)
    ↓
API Client (Shared)
    ↓
Backend API
    ↓
Database
```

---

## 🛠️ Development Workflow

1. **Feature Development**
   - Start in `src/features/[feature]`
   - Build shared logic first
   - Add platform-specific UI

2. **Testing**
   - Test shared logic once
   - Test UI per platform

3. **Deployment**
   - Web: Vercel/Next.js
   - Mobile: App Store / Play Store

---

## 📚 Documentation Structure

```
docs/
├── architecture/
│   ├── overview.md
│   ├── features/
│   └── patterns/
├── features/
│   ├── pwa.md
│   ├── notifications.md
│   ├── mobile.md
│   ├── ai-recommendations.md
│   ├── i18n.md
│   └── loyalty.md
└── guides/
    ├── contributing.md
    ├── testing.md
    └── deployment.md
```

---

## ✅ Next Steps

1. Create new folder structure
2. Define TypeScript interfaces
3. Setup shared module exports
4. Create feature scaffolding
5. Prepare database schema updates
6. Document migration path

---

**Status**: Ready for implementation
**Last Updated**: 2026-02-08
