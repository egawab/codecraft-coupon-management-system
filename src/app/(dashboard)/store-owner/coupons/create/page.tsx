'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { CouponType } from '@prisma/client';

type Store = {
  id: string;
  name: string;
};

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: CouponType.PERCENTAGE,
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '',
    startDate: '',
    expiryDate: '',
    storeId: '',
    categoryId: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    try {
      const res = await fetch('/api/store-owner/stores');
      const data = await res.json();
      setStores(data.data || []);
      if (data.data?.length > 0) {
        setFormData((prev) => ({ ...prev, storeId: data.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : undefined,
        startDate: new Date(formData.startDate),
        expiryDate: new Date(formData.expiryDate),
        categoryId: formData.categoryId || undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      const res = await fetch('/api/store-owner/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/store-owner/coupons');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create coupon');
      }
    } catch (error) {
      console.error('Create coupon error:', error);
      alert('Failed to create coupon');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create Coupon</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Store Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Store *</label>
                <select
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.storeId}
                  onChange={(e) =>
                    setFormData({ ...formData, storeId: e.target.value })
                  }
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-md uppercase"
                  placeholder="SUMMER2024"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                />
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-md"
                  placeholder="Summer Sale - 20% Off"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Get 20% off on all items this summer"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Coupon Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type *</label>
                <select
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as CouponType })
                  }
                >
                  <option value={CouponType.PERCENTAGE}>Percentage</option>
                  <option value={CouponType.FIXED_AMOUNT}>Fixed Amount</option>
                  <option value={CouponType.BUY_ONE_GET_ONE}>Buy One Get One</option>
                  <option value={CouponType.FREE_SHIPPING}>Free Shipping</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount Value *{' '}
                  {formData.type === CouponType.PERCENTAGE ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  max={formData.type === CouponType.PERCENTAGE ? '100' : undefined}
                  className="w-full p-2 border rounded-md"
                  placeholder="20"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                />
              </div>

              {/* Min Purchase */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Purchase ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-md"
                  placeholder="50"
                  value={formData.minPurchase}
                  onChange={(e) =>
                    setFormData({ ...formData, minPurchase: e.target.value })
                  }
                />
              </div>

              {/* Max Discount */}
              {formData.type === CouponType.PERCENTAGE && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Discount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border rounded-md"
                    placeholder="100"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-md"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                />
              </div>

              {/* Per User Limit */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Per User Limit
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-md"
                  placeholder="1"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, perUserLimit: e.target.value })
                  }
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Start Date *</label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Coupon'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
