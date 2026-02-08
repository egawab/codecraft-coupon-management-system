# Production Optimization Guide

This guide covers all production optimizations implemented for Kobonz.

## 📊 SEO Optimizations

### ✅ Server-Side Rendering (SSR) & Incremental Static Regeneration (ISR)

**Implementation:**
- Public pages use ISR with strategic revalidation periods
- Coupon pages: 1 hour revalidation (`revalidate: 3600`)
- Store pages: 30 minutes revalidation (`revalidate: 1800`)
- Homepage and listing pages: 5 minutes revalidation

**Files Modified:**
- `src/app/(public)/coupons/[slug]/page.tsx`
- `src/app/(public)/stores/[slug]/page.tsx`

### ✅ Dynamic Sitemap Generation

**Implementation:**
- Auto-generates sitemap from database
- Includes all active coupons and stores
- Updates hourly via ISR

**New Files:**
- `src/app/sitemap.ts` - Dynamic sitemap generation
- `src/app/robots.ts` - Robots.txt with sitemap reference

**Access:** `https://yourdomain.com/sitemap.xml`

### ✅ Structured Data (JSON-LD)

**Implementation:**
- Organization schema on all pages
- WebSite schema with search action
- Offer schema on coupon pages
- LocalBusiness schema on store pages
- Breadcrumb schema for navigation

**Files Modified:**
- `src/app/layout.tsx` - Organization and WebSite schemas
- `src/app/(public)/coupons/[slug]/page.tsx` - Offer schema
- `src/app/(public)/stores/[slug]/page.tsx` - LocalBusiness schema

**New Files:**
- `src/lib/structured-data.ts` - Schema generation utilities

### ✅ Dynamic Metadata & Open Graph

**Implementation:**
- Page-specific titles and descriptions
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URLs

**Features:**
- Auto-generated from content
- Includes images when available
- SEO-friendly keywords
- Social media optimization

---

## ⚡ Performance Optimizations

### ✅ Redis Caching

**Implementation:**
- API response caching with TTL
- Session caching (already implemented)
- Counter caching for analytics
- Cache invalidation by tags

**New Files:**
- `src/lib/cache.ts` - Comprehensive caching utilities

**Cache Strategies:**
```typescript
// API responses: 5-10 minute TTL
getCacheOrSet(key, fetcher, { ttl: 300, tags: ['coupons'] })

// Invalidate by tag
invalidateCacheByTag('coupons')
```

**Files Modified:**
- `src/app/api/public/coupons/route.ts` - List caching
- `src/app/api/public/coupons/[slug]/route.ts` - Detail caching

### ✅ Image Optimization

**Already Configured:**
- Next.js Image component
- AVIF and WebP formats
- Responsive image sizes
- Lazy loading

**Configuration:** `next.config.mjs`

### ✅ Code Splitting & Lazy Loading

**Implementation:**
- Heavy components lazy-loaded
- Client-only components marked with `ssr: false`
- Loading states for better UX

**New Files:**
- `src/components/LazyComponents.tsx` - Lazy component exports

**Usage:**
```typescript
import { LazyAnalyticsDashboard } from '@/components/LazyComponents';
```

### ✅ API Response Caching

**Strategy:**
- Public endpoints cached with Redis
- Cache keys based on query parameters
- Automatic cache invalidation
- Cache warming for popular data

---

## 🔒 Security Enhancements

### ✅ Rate Limiting

**Implementation:**
- Redis-based sliding window algorithm
- Different limits for different endpoints
- IP-based and user-based limiting
- Stricter limits for auth endpoints

**New Files:**
- `src/lib/rate-limit.ts` - Rate limiting utilities

**Usage:**
```typescript
// In API routes
await withRateLimit(request, 100, 60); // 100 requests per 60 seconds
```

**Default Limits:**
- Public APIs: 100 req/min
- Authenticated users: 200 req/min
- Auth endpoints: 5 req/5min

**Files Modified:**
- `src/lib/api-middleware.ts` - Rate limit middleware

### ✅ Input Validation & Sanitization

**Already Implemented:**
- Zod schemas for all inputs
- Type-safe validation

**New Files:**
- `src/lib/input-sanitizer.ts` - Input sanitization utilities

**Features:**
- XSS prevention
- HTML sanitization
- URL validation
- Email/phone sanitization

### ✅ Content Security Policy (CSP)

**Implementation:**
- Strict CSP headers
- Whitelisted external domains
- No inline scripts (except with nonce)
- XSS protection

**Configuration:** `next.config.mjs`

**Headers:**
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `Permissions-Policy`

### ✅ HTTPS Enforcement

**Implementation:**
- Automatic redirect to HTTPS in production
- HSTS headers with preload
- Secure cookie flags

**Files Modified:**
- `src/middleware.ts` - HTTPS redirect
- `next.config.mjs` - Security headers

### ✅ XSS & CSRF Protection

**Implementation:**
- CSRF tokens via NextAuth
- XSS prevention via CSP
- Input sanitization
- HTML escaping utilities

**New Files:**
- `src/lib/security.ts` - Security utilities

**Features:**
- CSRF token generation/validation
- Secure random token generation
- Constant-time comparison
- Origin validation

---

## 🚀 Deployment Checklist

### Environment Variables

1. **Copy production environment file:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Fill in production values:**
   - Database URL (with SSL)
   - Redis credentials (production instance)
   - Stripe live keys
   - Google OAuth production credentials
   - Resend API key
   - NextAuth secrets (generate new ones!)

### Pre-Deployment

- [ ] Run `npm run build` to test production build
- [ ] Check for TypeScript errors
- [ ] Verify all environment variables are set
- [ ] Test rate limiting configuration
- [ ] Verify CSP headers don't block necessary resources
- [ ] Test image optimization
- [ ] Verify sitemap generation
- [ ] Check structured data with Google Rich Results Test

### Post-Deployment

- [ ] Verify HTTPS redirect works
- [ ] Test rate limiting in production
- [ ] Check cache hit rates in Redis
- [ ] Monitor error logs
- [ ] Verify sitemap is accessible
- [ ] Test social media previews (OG tags)
- [ ] Run Lighthouse audit
- [ ] Monitor performance metrics

### Security Verification

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] CSRF protection active
- [ ] CSP not causing issues
- [ ] No sensitive data in logs
- [ ] API keys secured

---

## 📈 Monitoring & Optimization

### Performance Metrics

**Monitor:**
- Cache hit rates
- API response times
- Page load times
- Core Web Vitals
- Rate limit violations

**Tools:**
- Redis monitoring dashboard
- Next.js Analytics
- Google Search Console
- Lighthouse CI

### Cache Optimization

**Cache Keys:**
```
api:coupons:{filters}:{page}:{limit}  # 5 min TTL
api:coupon:{slug}                      # 10 min TTL
api:stores:{filters}:{page}:{limit}    # 5 min TTL
```

**Invalidation:**
- On content update
- Manual via admin panel
- Automatic on expiry

### Rate Limit Tuning

**Adjust based on:**
- User feedback
- Server capacity
- Attack patterns
- Traffic patterns

---

## 🔧 Configuration Files

### Modified Files

1. **next.config.mjs**
   - Image optimization
   - Security headers
   - CSP configuration

2. **src/middleware.ts**
   - HTTPS enforcement
   - Security headers
   - Auth protection

3. **src/app/layout.tsx**
   - Base metadata
   - Structured data
   - Open Graph tags

### New Files

1. **SEO:**
   - `src/app/sitemap.ts`
   - `src/app/robots.ts`
   - `src/lib/structured-data.ts`

2. **Performance:**
   - `src/lib/cache.ts`
   - `src/components/LazyComponents.tsx`

3. **Security:**
   - `src/lib/rate-limit.ts`
   - `src/lib/input-sanitizer.ts`
   - `src/lib/security.ts`

4. **Config:**
   - `.env.production.example`

---

## 🎯 Expected Improvements

### SEO

- ✅ Google indexing of dynamic pages
- ✅ Rich snippets in search results
- ✅ Social media preview cards
- ✅ Improved search rankings

### Performance

- ✅ 80%+ cache hit rate for public APIs
- ✅ Sub-second page loads
- ✅ Lighthouse score 90+
- ✅ Reduced database queries

### Security

- ✅ Prevention of brute force attacks
- ✅ XSS/CSRF protection
- ✅ DoS mitigation via rate limiting
- ✅ A+ security headers rating

---

## 📚 Additional Resources

- [Next.js ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Google Structured Data](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data)

---

## 🆘 Troubleshooting

### Cache Issues

**Problem:** Stale data showing
**Solution:** Clear cache or reduce TTL
```typescript
await invalidateCacheByTag('coupons');
```

### Rate Limit Issues

**Problem:** Legitimate users blocked
**Solution:** Adjust limits in `src/lib/rate-limit.ts`

### CSP Violations

**Problem:** External resources blocked
**Solution:** Add domains to CSP in `next.config.mjs`

### Performance Issues

**Problem:** Slow page loads
**Solution:**
1. Check Redis connectivity
2. Verify cache hit rates
3. Monitor database queries
4. Check image optimization

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review error logs
3. Monitor Redis/database
4. Check security headers

---

**Last Updated:** 2026-02-08
**Version:** 1.0.0
