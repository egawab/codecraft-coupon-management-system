# Production Deployment Checklist

Use this checklist before deploying Kobonz to production.

## 📋 Pre-Deployment

### Environment Setup

- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Set `NODE_ENV=production`
- [ ] Set production `NEXT_PUBLIC_APP_URL`
- [ ] Generate new `NEXTAUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Generate new `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Configure production database URL with SSL
- [ ] Set up production Redis instance (Upstash)
- [ ] Configure production Stripe keys (live mode)
- [ ] Set up production email service (Resend)
- [ ] Configure Google OAuth production credentials
- [ ] Verify all required environment variables are set

### Database

- [ ] Run database migrations: `npm run db:migrate`
- [ ] Verify database connection with SSL
- [ ] Seed initial data if needed: `npm run db:seed`
- [ ] Create database backups
- [ ] Set up automated backup schedule
- [ ] Configure database connection pooling
- [ ] Test database performance under load

### Redis

- [ ] Create production Redis instance
- [ ] Verify Redis connection
- [ ] Test cache operations
- [ ] Configure Redis persistence
- [ ] Set up Redis monitoring
- [ ] Configure eviction policies
- [ ] Test rate limiting functionality

### Build & Test

- [ ] Run `npm install --production`
- [ ] Run `npm run build` successfully
- [ ] Run `npm run lint` with no errors
- [ ] Test production build locally: `npm start`
- [ ] Verify all pages load correctly
- [ ] Test all critical user flows
- [ ] Verify API endpoints work
- [ ] Test authentication flow
- [ ] Test payment flow (with Stripe test mode first)

### Security

- [ ] HTTPS certificate configured
- [ ] Security headers verified
- [ ] CSP policy tested and working
- [ ] Rate limiting configured
- [ ] CORS settings configured
- [ ] Input validation tested
- [ ] XSS protection verified
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified
- [ ] Secrets not committed to git
- [ ] `.env` files in `.gitignore`
- [ ] API keys rotated from development

## 🚀 Deployment

### DNS & Domain

- [ ] Domain registered
- [ ] DNS records configured
- [ ] SSL certificate installed
- [ ] HTTPS redirect working
- [ ] www redirect configured (if needed)
- [ ] Domain verified with email provider

### Hosting Platform

Choose your platform and complete relevant steps:

#### Vercel (Recommended for Next.js)

- [ ] Project connected to Git repository
- [ ] Environment variables added to Vercel dashboard
- [ ] Production branch configured (main/master)
- [ ] Build settings verified
- [ ] Deploy preview created and tested
- [ ] Production deployment successful
- [ ] Custom domain connected
- [ ] Analytics configured (optional)

#### Other Platforms (AWS, DigitalOcean, etc.)

- [ ] Server provisioned
- [ ] Node.js installed (v18+)
- [ ] PM2 or process manager configured
- [ ] Nginx/reverse proxy configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Firewall configured
- [ ] Server monitoring set up
- [ ] Auto-scaling configured (if applicable)

### CDN & Performance

- [ ] CDN configured (if not using Vercel)
- [ ] Static assets cached
- [ ] Image optimization working
- [ ] Compression enabled (gzip/brotli)
- [ ] Cache headers configured

## ✅ Post-Deployment Verification

### Functionality Tests

- [ ] Homepage loads correctly
- [ ] All public pages accessible
- [ ] Search functionality works
- [ ] Coupon pages load with ISR
- [ ] Store pages load with ISR
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Dashboard loads for each role
- [ ] Coupon creation works
- [ ] Store creation works
- [ ] Payment processing works (test mode first!)
- [ ] Affiliate tracking works

### SEO Verification

- [ ] Sitemap accessible: `https://yourdomain.com/sitemap.xml`
- [ ] Robots.txt accessible: `https://yourdomain.com/robots.txt`
- [ ] Meta tags present on all pages
- [ ] Open Graph tags working (test with social media debuggers)
- [ ] Structured data valid (Google Rich Results Test)
- [ ] Canonical URLs correct
- [ ] 404 page works
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

### Performance Tests

- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Core Web Vitals passing
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Time to First Byte < 600ms
- [ ] Cache working (check Redis dashboard)
- [ ] Images optimized and loading
- [ ] Lazy loading working
- [ ] Code splitting effective

### Security Tests

- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers present (check securityheaders.com)
- [ ] Rate limiting working (test with multiple requests)
- [ ] CSRF protection active
- [ ] XSS protection verified
- [ ] SQL injection tests passed
- [ ] Authentication secure
- [ ] Session management secure
- [ ] No sensitive data exposed in responses
- [ ] Error messages don't leak information
- [ ] File upload restrictions working (if applicable)

### Monitoring Setup

- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up
- [ ] Alerts configured for:
  - [ ] Server errors (5xx)
  - [ ] High error rate
  - [ ] Downtime
  - [ ] High latency
  - [ ] Rate limit violations
  - [ ] Database issues
  - [ ] Redis connectivity

### Third-Party Services

- [ ] Stripe webhooks configured and tested
- [ ] Email delivery working (Resend)
- [ ] Redis connection stable (Upstash)
- [ ] Database connection stable (Neon)
- [ ] OAuth providers working (Google)
- [ ] All webhooks verified
- [ ] All API integrations tested

## 📊 Analytics & Marketing

- [ ] Google Analytics installed (optional)
- [ ] Google Search Console verified
- [ ] Bing Webmaster Tools verified
- [ ] Social media OG tags tested:
  - [ ] Facebook Sharing Debugger
  - [ ] Twitter Card Validator
  - [ ] LinkedIn Post Inspector
- [ ] Schema markup validated
- [ ] Conversion tracking set up

## 🔄 Backup & Recovery

- [ ] Database backup strategy in place
- [ ] Database backup tested (restore test)
- [ ] Redis backup configured
- [ ] Environment variables backed up securely
- [ ] Disaster recovery plan documented
- [ ] Rollback plan prepared

## 📝 Documentation

- [ ] README updated with production info
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Emergency contacts listed
- [ ] Runbook created for common issues

## 🎯 Final Checks

- [ ] All team members notified
- [ ] Support channels ready
- [ ] Monitoring dashboards accessible
- [ ] On-call schedule set
- [ ] Communication plan ready
- [ ] Rollback plan tested
- [ ] Success metrics defined

## 🚨 Emergency Procedures

### If Something Goes Wrong

1. **Check monitoring dashboards** - Look for errors and anomalies
2. **Review recent changes** - Identify what was deployed
3. **Check logs** - Server, application, and database logs
4. **Rollback if needed** - Use previous deployment
5. **Notify team** - Alert relevant stakeholders
6. **Document incident** - For post-mortem analysis

### Quick Rollback Steps

```bash
# If using Vercel
vercel rollback [deployment-url]

# If using git-based deployment
git revert HEAD
git push origin main

# If using PM2
pm2 reload ecosystem.config.js --update-env
```

## 📞 Support Contacts

- **Hosting Support:** [Platform support link]
- **Database Support:** [Neon support]
- **Redis Support:** [Upstash support]
- **Email Support:** [Resend support]
- **Payment Support:** [Stripe support]

---

## 🎉 Post-Launch

After successful deployment:

- [ ] Monitor for 24 hours continuously
- [ ] Watch error rates and performance
- [ ] Gather user feedback
- [ ] Plan first optimization iteration
- [ ] Schedule post-launch review
- [ ] Celebrate! 🎊

---

**Remember:** Don't deploy on Fridays! 😄

**Last Updated:** 2026-02-08
