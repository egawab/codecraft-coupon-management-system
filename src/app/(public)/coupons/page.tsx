'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/Pagination';
import {
  Search,
  Filter,
  Store,
  Calendar,
  Heart,
  Tag,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

type Coupon = {
  id: string;
  slug: string;
  code: string;
  title: string;
  description: string;
  discountValue: number;
  type: string;
  expiryDate: string;
  imageUrl: string;
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    usages: number;
    favorites: number;
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export default function CouponsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    minDiscount: searchParams.get('minDiscount') || '',
    type: searchParams.get('type') || '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, filters]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/public/featured');
      const data = await res.json();
      setCategories(data.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

  async function fetchCoupons() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(filters.q && { q: filters.q }),
        ...(filters.category && { category: filters.category }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.minDiscount && { minDiscount: filters.minDiscount }),
        ...(filters.type && { type: filters.type }),
      });

      const res = await fetch(`/api/public/coupons?${params}`);
      const data = await res.json();

      setCoupons(data.data.coupons || []);
      setTotalPages(data.data.pagination.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    fetchCoupons();
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }

  function clearFilters() {
    setFilters({
      q: '',
      category: '',
      sortBy: 'newest',
      minDiscount: '',
      type: '',
    });
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Coupons</h1>
          <p className="text-muted-foreground">
            Discover amazing deals and save money on your purchases
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search coupons, stores, or categories..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                    <option value="BUY_ONE_GET_ONE">BOGO</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                {/* Min Discount Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Min Discount</label>
                  <input
                    type="number"
                    placeholder="e.g., 20"
                    className="w-full p-2 border rounded-md"
                    value={filters.minDiscount}
                    onChange={(e) => handleFilterChange('minDiscount', e.target.value)}
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="ending_soon">Ending Soon</option>
                    <option value="highest_discount">Highest Discount</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `Found ${coupons.length} coupons`}
          </p>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No coupons found</p>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {coupons.map((coupon) => (
                <Link key={coupon.id} href={`/coupons/${coupon.slug}`}>
                  <Card className="hover:shadow-xl transition-all h-full cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant="default"
                          className="text-lg font-bold bg-primary group-hover:bg-primary/90"
                        >
                          {coupon.type === 'PERCENTAGE'
                            ? `${coupon.discountValue}% OFF`
                            : coupon.type === 'FIXED_AMOUNT'
                            ? `$${coupon.discountValue} OFF`
                            : coupon.type === 'BUY_ONE_GET_ONE'
                            ? 'BOGO'
                            : 'FREE SHIP'}
                        </Badge>
                        {coupon._count.favorites > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Heart className="h-3 w-3 fill-current" />
                            {coupon._count.favorites}
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {coupon.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Store */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {coupon.store.logo ? (
                              <img
                                src={coupon.store.logo}
                                alt={coupon.store.name}
                                className="rounded-full"
                              />
                            ) : (
                              <Store className="h-4 w-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium truncate">
                            {coupon.store.name}
                          </span>
                        </div>

                        {/* Category */}
                        {coupon.category && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {coupon.category.name}
                            </span>
                          </div>
                        )}

                        {/* Coupon Code */}
                        <div className="bg-muted/50 rounded-lg p-3 text-center border-2 border-dashed">
                          <div className="text-xs text-muted-foreground mb-1">
                            Coupon Code
                          </div>
                          <div className="font-mono font-bold text-base">
                            {coupon.code}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {coupon._count.usages} uses
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Add missing Users icon import
function Users({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}
