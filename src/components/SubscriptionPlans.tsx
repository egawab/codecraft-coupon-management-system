'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { getAllPlans } from '@/lib/stripe-config';

interface SubscriptionPlansProps {
  currentPlan?: string;
}

export function SubscriptionPlans({ currentPlan }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const plans = getAllPlans();

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (planId === 'FREE') return;

    setLoading(planId);
    try {
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.message || 'Failed to create checkout session');
        setLoading(null);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription process');
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            currentPlan === plan.name ? 'border-primary border-2' : ''
          }`}
        >
          {currentPlan === plan.name && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleSubscribe(plan.priceId, plan.id)}
              disabled={
                loading !== null ||
                currentPlan === plan.name ||
                plan.id === 'FREE'
              }
              className="w-full"
              variant={currentPlan === plan.name ? 'outline' : 'default'}
            >
              {loading === plan.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === plan.name ? (
                'Current Plan'
              ) : plan.id === 'FREE' ? (
                'Free Forever'
              ) : (
                'Subscribe'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
