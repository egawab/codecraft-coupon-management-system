'use client';

import { useEffect, useState } from 'react';
import { StoreStatus } from '@prisma/client';
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

type Store = {
  id: string;
  name: string;
  email: string;
  status: StoreStatus;
  createdAt: string;
  owner: {
    name: string;
    email: string;
  };
  country: {
    name: string;
  };
  _count: {
    coupons: number;
  };
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<StoreStatus>(StoreStatus.PENDING);

  useEffect(() => {
    fetchStores(currentTab);
  }, [currentTab]);

  async function fetchStores(status?: StoreStatus) {
    setLoading(true);
    try {
      const url = status
        ? `/api/admin/stores?status=${status}`
        : '/api/admin/stores';
      const res = await fetch(url);
      const data = await res.json();
      setStores(data.data || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(store: Store) {
    setSelectedStore(store);
    setActionType('approve');
  }

  async function handleReject(store: Store) {
    setSelectedStore(store);
    setActionType('reject');
    setRejectionReason('');
  }

  async function confirmAction() {
    if (!selectedStore || !actionType) return;

    setSubmitting(true);
    try {
      const endpoint =
        actionType === 'approve'
          ? `/api/admin/stores/${selectedStore.id}/approve`
          : `/api/admin/stores/${selectedStore.id}/reject`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: actionType === 'reject' ? JSON.stringify({ reason: rejectionReason }) : undefined,
      });

      if (res.ok) {
        setSelectedStore(null);
        setActionType(null);
        setRejectionReason('');
        fetchStores(currentTab);
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

  function getStatusBadge(status: StoreStatus) {
    const variants: Record<StoreStatus, any> = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'destructive',
      SUSPENDED: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Stores</h2>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as StoreStatus)}>
        <TabsList>
          <TabsTrigger value={StoreStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={StoreStatus.APPROVED}>Approved</TabsTrigger>
          <TabsTrigger value={StoreStatus.REJECTED}>Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{currentTab} Stores</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : stores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {currentTab.toLowerCase()} stores found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Coupons</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{store.owner.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {store.owner.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{store.country.name}</TableCell>
                        <TableCell>{store._count.coupons}</TableCell>
                        <TableCell>{getStatusBadge(store.status)}</TableCell>
                        <TableCell>
                          {new Date(store.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {store.status === StoreStatus.PENDING && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprove(store)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(store)}
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
          setSelectedStore(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{selectedStore?.name}"? The store owner will
              be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedStore(null);
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
          setSelectedStore(null);
          setRejectionReason('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Store</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedStore?.name}". The store owner
              will receive this feedback.
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
                setSelectedStore(null);
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
