'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    paymentEmail: '',
    paymentMethod: 'paypal',
    bankDetails: '',
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        router.push('/affiliate');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Join Our Affiliate Program</h1>
        <p className="text-xl text-gray-600">
          Earn commissions by promoting our coupons and deals
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="font-bold mb-2">10% Commission</h3>
            <p className="text-sm text-gray-600">
              Earn 10% commission on every conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="font-bold mb-2">30-Day Cookies</h3>
            <p className="text-sm text-gray-600">
              Attribution tracking for 30 days after click
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="font-bold mb-2">Real-time Tracking</h3>
            <p className="text-sm text-gray-600">
              Track clicks, conversions, and earnings live
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Register as an Affiliate</CardTitle>
          <CardDescription>
            Fill out the form below to start earning commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Email *
              </label>
              <input
                type="email"
                required
                value={formData.paymentEmail}
                onChange={(e) => setFormData({ ...formData, paymentEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                We'll use this email to send your payments
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.paymentMethod === 'bank_transfer' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bank Details
                </label>
                <textarea
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Bank name, account number, routing number, etc."
                />
              </div>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-1 mr-2"
              />
              <label htmlFor="terms" className="text-sm">
                I accept the{' '}
                <a href="/legal/affiliate-terms" className="text-blue-600 hover:underline">
                  Affiliate Terms and Conditions
                </a>{' '}
                and agree to comply with all program policies.
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                What happens next?
              </h4>
              <ul className="text-sm space-y-1 ml-7">
                <li>• You'll receive a unique affiliate code</li>
                <li>• Create custom tracking links for any coupon</li>
                <li>• Start sharing and earning commissions immediately</li>
                <li>• Request payouts when you reach $10 balance</li>
              </ul>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I earn commissions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create affiliate links for coupons, share them with your audience, and earn 10% commission 
                whenever someone makes a purchase using your link within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When can I withdraw my earnings?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Commissions become available for payout 30 days after the conversion. The minimum payout 
                amount is $10. You can request a payout anytime your available balance meets this threshold.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How long do cookies last?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our attribution cookies last for 30 days. If a user clicks your affiliate link and makes 
                a purchase within 30 days, you'll receive credit for that conversion.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
