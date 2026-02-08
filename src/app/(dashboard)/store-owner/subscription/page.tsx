import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { Role } from '@prisma/client';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { getUserSubscription } from '@/lib/subscription-helpers';

export default async function SubscriptionPage() {
  let user;
  try {
    user = await requireRole([Role.STORE_OWNER, Role.SUPER_ADMIN]);
  } catch (error) {
    redirect('/unauthorized');
  }

  const subscription = await getUserSubscription(user.id);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
        <p className="text-muted-foreground mt-2">
          Choose the plan that best fits your business needs
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SubscriptionPlans currentPlan={subscription?.plan} />
        </div>
        <div>
          <SubscriptionStatus userId={user.id} />
        </div>
      </div>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Can I change my plan later?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What happens if I exceed my limits?</h4>
            <p className="text-sm text-muted-foreground">
              You'll need to upgrade your plan to create more stores or coupons. Existing resources remain active.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
