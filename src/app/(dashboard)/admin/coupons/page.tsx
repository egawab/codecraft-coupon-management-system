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
import { Check, X, Loader2 } from 'lucide-react';

type Coupon = {
  id: string;
  title: string;
  code: string;
  discountValue: number;
  type: string;
  status: CouponStatus;
  expiryDate: string;
  store: {
    name: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  _count: {
    usages: number;
    favorites: number;
  };
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<CouponStatus>(CouponStatus.PENDING);

  useEffect(() => {
    fetchCoupons(currentTab);
  }, [currentTab]);

  async function fetchCoupons(status?: CouponStatus) {
    setLoading(true);
    try {
      const url = status
        ? `/api/admin/coupons?status=${status}`
        : '/api/admin/coupons';
      const res = await fetch(url);
      const data = await res.json();
      setCoupons(data.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(coupon: Coupon) {
    setSelectedCoupon(coupon);
    setActionType('approve');
  }

  async function handleReject(coupon: Coupon) {
    setSelectedCoupon(coupon);
    setActionType('reject');
    setRejectionReason('');
  }

  async function confirmAction() {
    if (!selectedCoupon || !actionType) return;

    setSubmitting(true);
    try {
      const endpoint =
        actionType === 'approve'
          ? `/api/admin/coupons/${selectedCoupon.id}/approve`
          : `/api/admin/coupons/${selectedCoupon.id}/reject`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: actionType === 'reject' ? JSON.stringify({ reason: rejectionReason }) : undefined,
      });

      if (res.ok) {
        setSelectedCoupon(null);
        setActionType(null);
        setRejectionReason('');
        fetchCoupons(currentTab);
      } else {
        const error = await res.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed');
    } finally {
      setSubmitting(false);
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
        <h2 className="text-3xl font-bold tracking-tight">Manage Coupons</h2>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as CouponStatus)}>
        <TabsList>
          <TabsTrigger value={CouponStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={CouponStatus.ACTIVE}>Active</TabsTrigger>
          <TabsTrigger value={CouponStatus.REJECTED}>Rejected</TabsTrigger>
          <TabsTrigger value={CouponStatus.EXPIRED}>Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{currentTab} Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {currentTab.toLowerCase()} coupons found
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
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono">{coupon.code}</TableCell>
                        <TableCell className="font-medium">{coupon.title}</TableCell>
                        <TableCell>{coupon.store.name}</TableCell>
                        <TableCell>
                          {coupon.type === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                        </TableCell>
                        <TableCell>{coupon._count.usages}</TableCell>
                        <TableCell>
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {coupon.status === CouponStatus.PENDING && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(coupon)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(coupon)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
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

      {/* Approve Dialog */}
      <Dialog
        open={actionType === 'approve'}
        onOpenChange={() => {
          setActionType(null);
          setSelectedCoupon(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve coupon "{selectedCoupon?.code}"? It will become
              active for users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedCoupon(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmAction} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={actionType === 'reject'}
        onOpenChange={() => {
          setActionType(null);
          setSelectedCoupon(null);
          setRejectionReason('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Coupon</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting coupon "{selectedCoupon?.code}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedCoupon(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmAction}
              disabled={submitting || !rejectionReason.trim()}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
