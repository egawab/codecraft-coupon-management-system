'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCard, TrendingUp, Loader2 } from 'lucide-react';

interface SubscriptionStatusProps {
  userId: string;
}

export function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [limits, setLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/subscription/limits');
      const data = await response.json();
      if (data.success) {
        setLimits(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert('Failed to open billing portal');
        setPortalLoading(false);
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!limits) return null;

  const getUsagePercentage = (used: number, max: number) => {
    if (max === -1) return 0; // Unlimited
    return (used / max) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Subscription Plan</CardTitle>
          <Badge variant="default">{limits.plan}</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Stores */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Stores</span>
                <span
                  className={
                    limits.limits.maxStores === -1
                      ? 'text-green-500'
                      : getUsageColor(
                          getUsagePercentage(limits.usage.stores, limits.limits.maxStores)
                        )
                  }
                >
                  {limits.usage.stores}
                  {limits.limits.maxStores === -1 ? '' : ` / ${limits.limits.maxStores}`}
                  {limits.limits.maxStores === -1 && ' (Unlimited)'}
                </span>
              </div>
              {limits.limits.maxStores !== -1 && (
                <Progress
                  value={getUsagePercentage(limits.usage.stores, limits.limits.maxStores)}
                />
              )}
            </div>

            {/* Coupons */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Coupons</span>
                <span
                  className={
                    limits.limits.maxCoupons === -1
                      ? 'text-green-500'
                      : getUsageColor(
                          getUsagePercentage(limits.usage.coupons, limits.limits.maxCoupons)
                        )
                  }
                >
                  {limits.usage.coupons}
                  {limits.limits.maxCoupons === -1 ? '' : ` / ${limits.limits.maxCoupons}`}
                  {limits.limits.maxCoupons === -1 && ' (Unlimited)'}
                </span>
              </div>
              {limits.limits.maxCoupons !== -1 && (
                <Progress
                  value={getUsagePercentage(limits.usage.coupons, limits.limits.maxCoupons)}
                />
              )}
            </div>

            {/* Featured Coupons */}
            {limits.limits.maxFeaturedCoupons > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Featured Coupons</span>
                  <span
                    className={
                      limits.limits.maxFeaturedCoupons === -1
                        ? 'text-green-500'
                        : getUsageColor(
                            getUsagePercentage(
                              limits.usage.featuredCoupons,
                              limits.limits.maxFeaturedCoupons
                            )
                          )
                    }
                  >
                    {limits.usage.featuredCoupons}
                    {limits.limits.maxFeaturedCoupons === -1
                      ? ''
                      : ` / ${limits.limits.maxFeaturedCoupons}`}
                    {limits.limits.maxFeaturedCoupons === -1 && ' (Unlimited)'}
                  </span>
                </div>
                {limits.limits.maxFeaturedCoupons !== -1 && (
                  <Progress
                    value={getUsagePercentage(
                      limits.usage.featuredCoupons,
                      limits.limits.maxFeaturedCoupons
                    )}
                  />
                )}
              </div>
            )}

            {/* Featured Stores */}
            {limits.limits.maxFeaturedStores > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Featured Stores</span>
                  <span
                    className={
                      limits.limits.maxFeaturedStores === -1
                        ? 'text-green-500'
                        : getUsageColor(
                            getUsagePercentage(
                              limits.usage.featuredStores,
                              limits.limits.maxFeaturedStores
                            )
                          )
                    }
                  >
                    {limits.usage.featuredStores}
                    {limits.limits.maxFeaturedStores === -1
                      ? ''
                      : ` / ${limits.limits.maxFeaturedStores}`}
                    {limits.limits.maxFeaturedStores === -1 && ' (Unlimited)'}
                  </span>
                </div>
                {limits.limits.maxFeaturedStores !== -1 && (
                  <Progress
                    value={getUsagePercentage(
                      limits.usage.featuredStores,
                      limits.limits.maxFeaturedStores
                    )}
                  />
                )}
              </div>
            )}

            {limits.plan !== 'Free' && (
              <Button
                onClick={handleManageBilling}
                variant="outline"
                className="w-full mt-4"
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Billing
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(!limits.canCreateStore || !limits.canCreateCoupon) && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-yellow-700">
              Plan Limit Reached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You've reached your plan limits. Upgrade to continue creating more resources.
            </p>
            <Button className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
