import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { Role } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ShoppingCart, Users, TrendingUp } from 'lucide-react';

async function getAnalytics() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/admin/analytics`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return res.json();
}

export default async function AdminDashboardPage() {
  try {
    await requireRole(Role.SUPER_ADMIN);
  } catch (error) {
    redirect('/unauthorized');
  }

  const { data: analytics } = await getAnalytics();

  const stats = [
    {
      title: 'Total Users',
      value: analytics.overview.totalUsers,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Total Stores',
      value: analytics.overview.totalStores,
      icon: Store,
      description: `${analytics.overview.pendingStores} pending approval`,
    },
    {
      title: 'Total Coupons',
      value: analytics.overview.totalCoupons,
      icon: ShoppingCart,
      description: `${analytics.overview.pendingCoupons} pending approval`,
    },
    {
      title: 'Coupon Usage',
      value: analytics.overview.totalCouponUsages,
      icon: TrendingUp,
      description: 'Total redemptions',
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Stores</p>
                  <p className="text-xs text-muted-foreground">
                    {analytics.overview.pendingStores} awaiting review
                  </p>
                </div>
                <a
                  href="/admin/stores?status=PENDING"
                  className="text-sm text-primary hover:underline"
                >
                  Review →
                </a>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Coupons</p>
                  <p className="text-xs text-muted-foreground">
                    {analytics.overview.pendingCoupons} awaiting review
                  </p>
                </div>
                <a
                  href="/admin/coupons?status=PENDING"
                  className="text-sm text-primary hover:underline"
                >
                  Review →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/users"
              className="block text-sm text-primary hover:underline"
            >
              Manage Users
            </a>
            <a
              href="/admin/stores"
              className="block text-sm text-primary hover:underline"
            >
              Manage Stores
            </a>
            <a
              href="/admin/coupons"
              className="block text-sm text-primary hover:underline"
            >
              Manage Coupons
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
