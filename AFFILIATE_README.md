# 🎯 Affiliate System - Quick Reference

## 🚀 Quick Start (3 Steps)

### 1. Run Database Migration
```bash
npx prisma db push
```

### 2. Add Environment Variables
```env
CRON_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Integrate Conversion Tracking
```typescript
import { trackAffiliateConversion } from '@/lib/helpers/affiliate-tracking';

// Add after successful coupon redemption/purchase
await trackAffiliateConversion(couponId, orderValue, userId);
```

## 📍 Key URLs

- **Register**: `/affiliate/register`
- **Dashboard**: `/affiliate`
- **Tracking Link**: `/go/{tracking_code}`

## 🔑 Core Features

✅ Affiliate registration with auto-approval  
✅ Unique tracking links (`/go/TRK-XXXXXXXXXX`)  
✅ 30-day cookie attribution  
✅ Click & conversion tracking  
✅ 10% commission (configurable)  
✅ Pending → Available balance flow  
✅ $10 minimum payout  
✅ Admin payout approval  
✅ Real-time analytics dashboard  

## 💰 Balance Flow

```
Conversion → Pending Balance (30 days) → Available Balance → Payout
```

## 📊 Dashboard Metrics

- Total Clicks
- Total Conversions
- CTR (Click-Through Rate)
- Pending Balance
- Available Balance
- Total Earnings
- Total Paid Out

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/affiliate/register` | POST | Register as affiliate |
| `/api/affiliate/stats` | GET | Get dashboard stats |
| `/api/affiliate/links` | GET/POST | Manage affiliate links |
| `/api/affiliate/payouts` | GET/POST | Manage payouts |
| `/go/{code}` | GET | Track click & redirect |

## ⚙️ Cron Job (Required)

Run daily to approve 30+ day old commissions:

```bash
curl -X POST https://your-app.com/api/affiliate/approve-commissions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📚 Full Documentation

- **Setup Guide**: `AFFILIATE_SYSTEM_SETUP.md`
- **Technical Docs**: `AFFILIATE_SYSTEM_GUIDE.md`
- **Summary**: `AFFILIATE_SYSTEM_SUMMARY.md`
- **Examples**: `examples/affiliate-integration-example.ts`

## 🎨 File Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── affiliate/
│   │       ├── page.tsx              # Dashboard
│   │       └── register/
│   │           └── page.tsx          # Registration
│   └── api/
│       ├── affiliate/
│       │   ├── register/route.ts
│       │   ├── links/route.ts
│       │   ├── stats/route.ts
│       │   ├── conversions/route.ts
│       │   ├── payouts/route.ts
│       │   └── approve-commissions/route.ts
│       ├── go/[code]/route.ts
│       └── admin/affiliate/payouts/[id]/route.ts
├── lib/
│   ├── validations/affiliate.ts
│   ├── utils/affiliate.ts
│   └── helpers/affiliate-tracking.ts
└── types/affiliate.ts

prisma/
└── schema.prisma                     # Updated with 5 new tables
```

## 🧪 Testing Flow

1. ✅ Register as affiliate → Get code `AFF-ABC123`
2. ✅ Create link → Get URL `/go/TRK-XXXXXXXXXX`
3. ✅ Click link (incognito) → Cookie set + redirect
4. ✅ Use coupon → Conversion tracked
5. ✅ Check dashboard → See stats updated
6. ✅ Run cron → Commission moves to available
7. ✅ Request payout → Admin approves
8. ✅ Check history → Payout completed

## 🔒 Security

- HttpOnly cookies (XSS protection)
- Input validation (Zod)
- Authentication required
- Admin role checking
- Cron secret authentication

## 📈 Customization

```typescript
// Commission rate (schema.prisma)
defaultCommissionRate Float @default(15)

// Attribution window (affiliate.ts)
now.setDate(now.getDate() + 60) // 60 days

// Minimum payout (affiliate.ts)
.min(25, 'Minimum payout amount is $25')
```

## 💡 Common Use Cases

### Share on Social Media
```
Share link: https://yourapp.com/go/TRK-ABC123
→ User clicks → Cookie set for 30 days
→ User purchases anytime in 30 days → You earn commission
```

### Email Marketing
```
Include link in newsletter
→ Track clicks and conversions
→ See which campaigns perform best
```

### Content Marketing
```
Blog post with affiliate link
→ Track which posts drive sales
→ Optimize content strategy
```

## ❓ Troubleshooting

**Problem**: Conversions not tracking  
**Solution**: Check if `trackAffiliateConversion()` is called in redemption code

**Problem**: Commission stuck in pending  
**Solution**: Run the cron job (approves after 30 days)

**Problem**: Can't request payout  
**Solution**: Need $10+ in available balance

## 📞 Support Resources

- Setup issues → `AFFILIATE_SYSTEM_SETUP.md`
- API details → `AFFILIATE_SYSTEM_GUIDE.md`
- Code examples → `examples/affiliate-integration-example.ts`

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Database Tables**: 5 new tables added  
**API Routes**: 9 endpoints created  
**UI Pages**: 2 pages built  
