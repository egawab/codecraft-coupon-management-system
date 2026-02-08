'use client';

import { useEffect, useState } from 'react';
import { CouponStatus } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Coupon = {
  id: string;
  title: string;
  code: string;
  discountValue: number;
  type: string;
  status: CouponStatus;
  usageCount: number;
  expiryDate: string;
  store: {
    id: string;
    name: string;
  };
  _count: {
    usages: number;
    favorites: number;
  };
};

export default function StoreOwnerCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | CouponStatus>('all');

  useEffect(() => {
    fetchCoupons();
  }, [currentTab]);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const url =
        currentTab === 'all'
          ? '/api/store-owner/coupons'
          : `/api/store-owner/coupons?status=${currentTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setCoupons(data.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    setSelectedCoupon(coupon);
    setShowDeleteDialog(true);
  }

  async function confirmDelete() {
    if (!selectedCoupon) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/store-owner/coupons/${selectedCoupon.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShowDeleteDialog(false);
        setSelectedCoupon(null);
        fetchCoupons();
      } else {
        const error = await res.json();
        alert(error.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  function getStatusBadge(status: CouponStatus) {
    const variants: Record<CouponStatus, any> = {
      PENDING: 'warning',
      APPROVED: 'secondary',
      ACTIVE: 'success',
      EXPIRED: 'outline',
      REJECTED: 'destructive',
      PAUSED: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Coupons</h2>
        <Link href="/store-owner/coupons/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(v) => setCurrentTab(v as 'all' | CouponStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value={CouponStatus.ACTIVE}>Active</TabsTrigger>
          <TabsTrigger value={CouponStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={CouponStatus.PAUSED}>Paused</TabsTrigger>
          <TabsTrigger value={CouponStatus.EXPIRED}>Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentTab === 'all' ? 'All Coupons' : `${currentTab} Coupons`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No coupons found</p>
                  <Link href="/store-owner/coupons/create">
                    <Button>Create Your First Coupon</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Favorites</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-medium">
                          {coupon.code}
                        </TableCell>
                        <TableCell>{coupon.title}</TableCell>
                        <TableCell>{coupon.store.name}</TableCell>
                        <TableCell>
                          {coupon.type === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                        </TableCell>
                        <TableCell>{coupon._count.usages}</TableCell>
                        <TableCell>{coupon._count.favorites}</TableCell>
                        <TableCell>
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/store-owner/coupons/${coupon.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(coupon)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete coupon "{selectedCoupon?.code}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
