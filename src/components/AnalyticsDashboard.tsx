'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Copy, MousePointerClick, TrendingUp, Users } from 'lucide-react';

interface AnalyticsData {
  realtime: {
    views: number;
    copies: number;
    clicks: number;
    uniqueViews: number;
    uniqueCopies: number;
    uniqueClicks: number;
    copyRate: number;
    clickRate: number;
    clickThroughRate: number;
  };
  summary: {
    views: number;
    copies: number;
    clicks: number;
    usages: number;
    shares: number;
    uniqueViews: number;
    uniqueCopies: number;
    uniqueClicks: number;
    copyRate: number;
    clickRate: number;
    clickThroughRate: number;
  };
  historical: Array<{
    date: string;
    views: number;
    copies: number;
    clicks: number;
    usages: number;
  }>;
}

interface AnalyticsDashboardProps {
  couponId: string;
  couponTitle?: string;
}

export function AnalyticsDashboard({ couponId, couponTitle }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7');

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [couponId, range]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${couponId}?range=${range}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8 text-gray-500">
        No analytics data available
      </div>
    );
  }

  const { summary } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      {couponTitle && (
        <div>
          <h2 className="text-2xl font-bold">{couponTitle}</h2>
          <p className="text-gray-600">Analytics Dashboard</p>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setRange('7')}
          className={`px-4 py-2 rounded ${range === '7' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          7 Days
        </button>
        <button
          onClick={() => setRange('30')}
          className={`px-4 py-2 rounded ${range === '30' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          30 Days
        </button>
        <button
          onClick={() => setRange('90')}
          className={`px-4 py-2 rounded ${range === '90' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          90 Days
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.views.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.uniqueViews.toLocaleString()} unique
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.copies.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.copyRate.toFixed(1)}% copy rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.clicks.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.clickRate.toFixed(1)}% click rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.clickThroughRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">
              Click-through rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Last {range} days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Total Views</span>
                  </div>
                  <span className="text-2xl font-bold">{summary.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Unique Visitors</span>
                  </div>
                  <span className="text-2xl font-bold">{summary.uniqueViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Code Copies</span>
                  </div>
                  <span className="text-2xl font-bold">{summary.copies.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Store Clicks</span>
                  </div>
                  <span className="text-2xl font-bold">{summary.clicks.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Copy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">
                  {summary.copyRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {summary.copies} copies from {summary.views} views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-600">
                  {summary.clickRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {summary.clicks} clicks from {summary.views} views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">
                  {summary.clickThroughRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {summary.clicks} clicks from {summary.copies} copies
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Trends</CardTitle>
              <CardDescription>Activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.historical.map((record, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600">{record.views}v</span>
                      <span className="text-purple-600">{record.copies}c</span>
                      <span className="text-orange-600">{record.clicks}cl</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Real-time data • Auto-refreshes every 30s</span>
      </div>
    </div>
  );
}
