import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { Role } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ShoppingCart, TrendingUp, Clock, Crown } from 'lucide-react';
import Link from 'next/link';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';

async function getAnalytics() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/store-owner/analytics`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return res.json();
}

export default async function StoreOwnerDashboardPage() {
  let user;
  try {
    user = await requireRole([Role.STORE_OWNER, Role.SUPER_ADMIN]);
  } catch (error) {
    redirect('/unauthorized');
  }

  const { data: analytics } = await getAnalytics();

  const stats = [
    {
      title: 'My Stores',
      value: analytics.overview.totalStores,
      icon: Store,
      description: 'Total stores',
    },
    {
      title: 'Total Coupons',
      value: analytics.overview.totalCoupons,
      icon: ShoppingCart,
      description: `${analytics.overview.activeCoupons} active`,
    },
    {
      title: 'Pending Approval',
      value: analytics.overview.pendingCoupons,
      icon: Clock,
      description: 'Awaiting admin review',
    },
    {
      title: 'Total Usage',
      value: analytics.overview.totalUsages,
      icon: TrendingUp,
      description: 'Coupon redemptions',
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Store Owner Dashboard</h2>
        <div className="flex gap-2">
          <Link href="/store-owner/subscription">
            <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <Crown className="mr-2 h-4 w-4" />
              Manage Subscription
            </button>
          </Link>
          <Link href="/store-owner/coupons/create">
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Create Coupon
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid with Subscription Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Subscription Status Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <SubscriptionStatus userId={user.id} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Coupons */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topCoupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coupons yet. Create your first coupon to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topCoupons.map((coupon: any) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{coupon.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Code: {coupon.code} • {coupon.store.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{coupon.usageCount} uses</p>
                    <p className="text-xs text-muted-foreground">{coupon.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/store-owner/coupons"
              className="block text-sm text-primary hover:underline"
            >
              Manage Coupons
            </Link>
            <Link
              href="/store-owner/stores"
              className="block text-sm text-primary hover:underline"
            >
              Manage Stores
            </Link>
            <Link
              href="/store-owner/coupons/create"
              className="block text-sm text-primary hover:underline"
            >
              Create New Coupon
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.breakdown.couponsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{status}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
