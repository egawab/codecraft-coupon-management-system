'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2 } from 'lucide-react';
import { FEATURED_PRICING } from '@/lib/stripe-config';

interface FeaturedPaymentProps {
  type: 'featured_coupon' | 'featured_store';
  resourceId: string;
  resourceName: string;
  isFeatured?: boolean;
  featuredUntil?: Date | null;
}

export function FeaturedPayment({
  type,
  resourceId,
  resourceName,
  isFeatured = false,
  featuredUntil,
}: FeaturedPaymentProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleFeature = async (duration: '7' | '14' | '30') => {
    setLoading(duration);
    try {
      const response = await fetch('/api/stripe/checkout/featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          resourceId,
          duration,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.message || 'Failed to create checkout session');
        setLoading(null);
      }
    } catch (error) {
      console.error('Featured payment error:', error);
      alert('Failed to start payment process');
      setLoading(null);
    }
  };

  const isCurrentlyFeatured = isFeatured && featuredUntil && new Date(featuredUntil) > new Date();

  const pricingOptions = type === 'featured_coupon'
    ? [
        { key: 'COUPON_7_DAYS', duration: '7' as const },
        { key: 'COUPON_14_DAYS', duration: '14' as const },
        { key: 'COUPON_30_DAYS', duration: '30' as const },
      ]
    : [
        { key: 'STORE_7_DAYS', duration: '7' as const },
        { key: 'STORE_14_DAYS', duration: '14' as const },
        { key: 'STORE_30_DAYS', duration: '30' as const },
      ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            <Star className="inline-block mr-2 h-5 w-5 text-yellow-500" />
            Feature {type === 'featured_coupon' ? 'Coupon' : 'Store'}
          </CardTitle>
          {isCurrentlyFeatured && (
            <Badge variant="default">
              Featured until {new Date(featuredUntil!).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Boost visibility and get more views by featuring <strong>{resourceName}</strong>
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {pricingOptions.map(({ key, duration }) => {
            const pricing = FEATURED_PRICING[key as keyof typeof FEATURED_PRICING];
            return (
              <Card key={duration} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-1">${pricing.price}</div>
                  <div className="text-sm text-muted-foreground mb-3">{pricing.days} Days</div>
                  <Button
                    onClick={() => handleFeature(duration)}
                    disabled={loading !== null}
                    className="w-full"
                    size="sm"
                  >
                    {loading === duration ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Select'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>💡 Benefits:</strong> Featured {type === 'featured_coupon' ? 'coupons' : 'stores'} appear at the
            top of search results and listings, giving you maximum exposure to potential customers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
