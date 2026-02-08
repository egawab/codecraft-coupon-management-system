'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Zap,
  Link2,
  Copy,
  Check,
  Download,
  ArrowUpRight,
  Eye,
  ShoppingCart,
} from 'lucide-react';

interface AffiliateStats {
  affiliate: {
    id: string;
    affiliateCode: string;
    status: string;
    defaultCommissionRate: number;
  };
  balance: {
    pending: number;
    available: number;
    totalEarnings: number;
    totalPaidOut: number;
  };
  performance: {
    totalClicks: number;
    totalConversions: number;
    ctr: number;
    totalLinks: number;
  };
  recentConversions: any[];
  topLinks: any[];
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  requestedAt: string;
  completedAt?: string;
  transactionId?: string;
}

export default function AffiliateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchStats();
    fetchPayouts();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/affiliate/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/affiliate/payouts');
      const data = await response.json();
      
      if (data.success) {
        setPayouts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleRequestPayout = async () => {
    if (!stats) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 10) {
      alert('Minimum payout amount is $10');
      return;
    }

    if (amount > stats.balance.available) {
      alert('Insufficient available balance');
      return;
    }

    try {
      const response = await fetch('/api/affiliate/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethod: 'paypal',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setShowPayoutModal(false);
        setPayoutAmount('');
        fetchStats();
        fetchPayouts();
      } else {
        alert(data.error || 'Failed to request payout');
      }
    } catch (error) {
      console.error('Payout request error:', error);
      alert('Failed to request payout');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Become an Affiliate</CardTitle>
            <CardDescription>
              Join our affiliate program and start earning commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You haven't registered as an affiliate yet. Register now to start earning!
            </p>
            <Button onClick={() => router.push('/affiliate/register')}>
              Register as Affiliate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Affiliate Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            Affiliate Code: <span className="font-mono font-bold">{stats.affiliate.affiliateCode}</span>
          </p>
          <Badge variant={stats.affiliate.status === 'APPROVED' ? 'default' : 'secondary'}>
            {stats.affiliate.status}
          </Badge>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.balance.available.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  ${stats.balance.pending.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  ${stats.balance.totalEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">All-time</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  ${stats.balance.totalPaidOut.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Received</p>
              </div>
              <Download className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.performance.totalClicks}</p>
              <MousePointerClick className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.performance.totalConversions}</p>
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.performance.ctr}%</p>
              <ArrowUpRight className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{stats.performance.totalLinks}</p>
              <Link2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <Button
          size="lg"
          onClick={() => setShowPayoutModal(true)}
          disabled={stats.balance.available < 10}
          className="w-full md:w-auto"
        >
          Request Payout
        </Button>
        {stats.balance.available < 10 && (
          <p className="text-sm text-gray-500 mt-2">
            Minimum payout amount is $10
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="links" className="mb-8">
        <TabsList>
          <TabsTrigger value="links">Top Links</TabsTrigger>
          <TabsTrigger value="conversions">Recent Conversions</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Links</CardTitle>
              <CardDescription>Your best affiliate links by earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Code</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-mono text-sm">
                        {link.trackingCode}
                      </TableCell>
                      <TableCell>
                        {link.coupon ? link.coupon.title : 'General Link'}
                      </TableCell>
                      <TableCell>{link.totalClicks}</TableCell>
                      <TableCell>{link.totalConversions}</TableCell>
                      <TableCell>{link.ctr}%</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${link.totalEarnings.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyLink(link.url, link.id)}
                        >
                          {copiedLink === link.id ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversions</CardTitle>
              <CardDescription>Latest affiliate conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Order Value</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentConversions.map((conversion) => (
                    <TableRow key={conversion.id}>
                      <TableCell>
                        {new Date(conversion.convertedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {conversion.coupon?.title || 'N/A'}
                      </TableCell>
                      <TableCell>
                        ${conversion.orderValue?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>{conversion.commissionRate}%</TableCell>
                      <TableCell className="font-bold text-green-600">
                        ${conversion.commissionAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={conversion.isPending ? 'secondary' : 'default'}>
                          {conversion.isPending ? 'Pending' : 'Approved'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your payout requests and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Requested</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-bold">
                        ${payout.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payout.paymentMethod.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payout.status === 'COMPLETED'
                              ? 'default'
                              : payout.status === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payout.transactionId || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
              <CardDescription>
                Available balance: ${stats.balance.available.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    max={stats.balance.available}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Minimum $10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRequestPayout} className="flex-1">
                    Request Payout
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
