# Migration Guide: Existing Code to New Architecture

This guide helps migrate existing Kobonz code to the new feature-based architecture.

---

## 🎯 Goals

1. Maintain backward compatibility
2. No breaking changes to existing functionality
3. Gradual migration without disruption
4. Enable future features

---

## 📋 Migration Checklist

- [ ] Update imports to use shared types
- [ ] Move business logic to services
- [ ] Migrate state management to Zustand
- [ ] Update API calls to use shared client
- [ ] Add feature flags
- [ ] Update components to use new hooks
- [ ] Test all existing functionality
- [ ] Update documentation

---

## 🔄 Step-by-Step Migration

### Step 1: Update Type Imports

**Before:**
```typescript
// src/components/CouponCard.tsx
interface Coupon {
  id: string;
  title: string;
  // ...
}
```

**After:**
```typescript
// src/components/CouponCard.tsx
import type { Coupon } from '@/shared/types/domain.types';
```

**Action:**
- Replace inline type definitions with imports from `src/shared/types/`
- Keep existing interfaces if they have UI-specific fields

---

### Step 2: Migrate Business Logic to Services

**Before:**
```typescript
// src/pages/CouponPage.tsx
async function getCoupons() {
  const response = await fetch('/api/public/coupons');
  const data = await response.json();
  return data.coupons;
}
```

**After:**
```typescript
// Use shared service
import { CouponService } from '@/shared/core/coupons/coupon.service';
import { createApiClient } from '@/shared/api/client';

const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
});

const couponService = new CouponService(apiClient);
const result = await couponService.search();
```

**Action:**
- Move API calls to services in `src/shared/core/`
- Keep page-specific logic in pages
- Use services in both pages and components

---

### Step 3: Migrate to Zustand Stores

**Before:**
```typescript
// Using React Context or local state
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

**After:**
```typescript
// Use Zustand store
import { useAuthStore } from '@/shared/stores/auth.store';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

**Action:**
- Replace Context API with Zustand stores
- Migrate auth state to `useAuthStore`
- Migrate UI state to `useUIStore`
- Keep component-specific state in `useState`

---

### Step 4: Update API Client Usage

**Before:**
```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

**After:**
```typescript
import { createApiClient } from '@/shared/api/client';
import { getAuthTokens } from '@/shared/stores/auth.store';

const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  getAuthTokens,
});

const result = await apiClient.post('/api/endpoint', data);
```

**Action:**
- Replace raw fetch with API client
- Centralize auth token management
- Use typed responses

---

### Step 5: Add Feature Flags

**Before:**
```typescript
// Feature always enabled
function RecommendationSection() {
  return <Recommendations />;
}
```

**After:**
```typescript
import { DEFAULT_FEATURE_FLAGS } from '@/shared/types/feature-flags.types';

function RecommendationSection() {
  const isEnabled = DEFAULT_FEATURE_FLAGS.ai_recommendations_enabled;
  
  if (!isEnabled) return null;
  
  return <Recommendations />;
}
```

**Action:**
- Wrap new features with feature flags
- Keep existing features always enabled
- Use environment variables for production flags

---

### Step 6: Refactor Components

**Before:**
```typescript
// Monolithic component
function CouponList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/coupons')
      .then(res => res.json())
      .then(data => {
        setCoupons(data.coupons);
        setLoading(false);
      });
  }, []);
  
  return (
    <div>
      {loading ? <Loading /> : coupons.map(c => <CouponCard key={c.id} {...c} />)}
    </div>
  );
}
```

**After:**
```typescript
// Using service and custom hook
import { useCoupons } from '@/hooks/useCoupons';

function CouponList() {
  const { coupons, isLoading } = useCoupons();
  
  return (
    <div>
      {isLoading ? <Loading /> : coupons.map(c => <CouponCard key={c.id} {...c} />)}
    </div>
  );
}

// hooks/useCoupons.ts
import { CouponService } from '@/shared/core/coupons/coupon.service';

export function useCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const service = new CouponService(apiClient);
    service.search()
      .then(result => {
        setCoupons(result.data);
        setIsLoading(false);
      });
  }, []);
  
  return { coupons, isLoading };
}
```

**Action:**
- Extract data fetching to custom hooks
- Use shared services
- Keep presentation in components

---

## 🗂️ File Organization

### Before
```
src/
├── pages/
│   ├── coupons.tsx
│   └── stores.tsx
├── components/
│   ├── CouponCard.tsx
│   └── StoreCard.tsx
└── lib/
    ├── api.ts
    └── utils.ts
```

### After
```
src/
├── app/                    # Next.js pages (unchanged)
├── components/             # UI components (mostly unchanged)
├── features/               # NEW: Feature modules
│   ├── coupons/
│   ├── stores/
│   └── ...
├── shared/                 # NEW: Cross-platform code
│   ├── api/
│   ├── core/
│   ├── stores/
│   └── types/
└── lib/                    # Server-side only utilities
```

---

## 📝 Migration Examples

### Example 1: Migrating Authentication

**Before:**
```typescript
// context/AuthContext.tsx
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    setUser(data.user);
  };
  
  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**After:**
```typescript
// Just use the store directly in components
import { useAuthStore } from '@/shared/stores/auth.store';
import { AuthService } from '@/shared/core/auth/auth.service';

function LoginForm() {
  const { login: setAuthState } = useAuthStore();
  const authService = new AuthService(apiClient);
  
  const handleLogin = async (credentials) => {
    const response = await authService.login(credentials);
    setAuthState(response.user, {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
    });
  };
  
  return <form onSubmit={handleLogin}>...</form>;
}
```

### Example 2: Migrating Data Fetching

**Before:**
```typescript
// pages/coupons/[slug].tsx
export async function getServerSideProps({ params }) {
  const res = await fetch(`http://localhost:3000/api/coupons/${params.slug}`);
  const coupon = await res.json();
  
  return { props: { coupon } };
}
```

**After:**
```typescript
// app/coupons/[slug]/page.tsx (App Router)
import { CouponService } from '@/shared/core/coupons/coupon.service';

async function getCoupon(slug: string) {
  const service = new CouponService(apiClient);
  return service.getBySlug(slug);
}

export default async function CouponPage({ params }) {
  const coupon = await getCoupon(params.slug);
  
  return <CouponDetails coupon={coupon} />;
}
```

---

## ⚠️ Breaking Changes to Avoid

### DON'T

❌ **Don't rename existing API routes**
```typescript
// Don't change
'/api/public/coupons' → '/api/v2/coupons'
```

❌ **Don't change database schema without migration**
```typescript
// Don't rename columns
'userId' → 'user_id'
```

❌ **Don't remove existing components**
```typescript
// Don't delete
components/CouponCard.tsx
```

### DO

✅ **Create new versions alongside old**
```typescript
// Keep old
components/CouponCard.tsx

// Add new
features/coupons/components/CouponCard.tsx
```

✅ **Use feature flags for new features**
```typescript
if (featureFlags.new_feature) {
  return <NewComponent />;
}
return <OldComponent />;
```

✅ **Maintain backward compatibility**
```typescript
// Support both old and new formats
function processData(data: OldFormat | NewFormat) {
  if (isOldFormat(data)) {
    return convertToNew(data);
  }
  return data;
}
```

---

## 🧪 Testing Migration

### 1. Test Existing Functionality

```bash
# Run existing tests
npm test

# Manual testing checklist
- [ ] User can login
- [ ] User can view coupons
- [ ] User can search
- [ ] User can use coupons
- [ ] Dashboard loads
```

### 2. Test New Architecture

```bash
# Test shared services
npm test src/shared/

# Test features
npm test src/features/
```

### 3. Integration Testing

```bash
# Test web app
npm run dev
# Verify all pages work

# Test API compatibility
npm run test:api
```

---

## 📊 Migration Progress Tracking

Use this checklist:

```markdown
## Core Features
- [ ] Authentication migrated to Zustand
- [ ] Coupon service created and tested
- [ ] Store service created and tested
- [ ] API client implemented
- [ ] Types consolidated

## Components
- [ ] CouponCard updated
- [ ] StoreCard updated
- [ ] Header updated
- [ ] Dashboard updated

## Pages
- [ ] Home page tested
- [ ] Coupons page tested
- [ ] Stores page tested
- [ ] Dashboard tested

## New Features (Optional)
- [ ] PWA setup
- [ ] Push notifications
- [ ] i18n configured
```

---

## 🚀 Gradual Rollout Strategy

### Week 1-2: Foundation
- Set up new folder structure
- Create shared types
- Implement API client
- No visible changes to users

### Week 3-4: Migration
- Migrate authentication to Zustand
- Create shared services
- Update internal imports
- Still no user-facing changes

### Week 5-6: Testing
- Comprehensive testing
- Fix any issues
- Performance testing
- Ready for production

### Week 7+: New Features
- Enable features one by one
- Monitor metrics
- Gather feedback
- Iterate

---

## 📞 Support

If you encounter issues during migration:

1. Check this guide
2. Review `ARCHITECTURE_REFACTOR.md`
3. Check feature-specific docs in `src/features/*/README.md`
4. Review code examples in `src/shared/`

---

**Remember:** Take it slow, test thoroughly, and don't be afraid to keep old code running alongside new code during transition.

---

**Last Updated**: 2026-02-08  
**Version**: 1.0.0
