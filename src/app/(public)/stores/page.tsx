'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/Pagination';
import {
  Search,
  Store,
  MapPin,
  Tag,
  Loader2,
  SlidersHorizontal,
  Star,
} from 'lucide-react';

type StoreType = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  country: {
    id: string;
    name: string;
    code: string;
  };
  city: {
    id: string;
    name: string;
  } | null;
  categories: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  }[];
  _count: {
    coupons: number;
    reviews: number;
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export default function StoresPage() {
  const searchParams = useSearchParams();

  const [stores, setStores] = useState<StoreType[]>([]);
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
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchStores();
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

  async function fetchStores() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(filters.q && { q: filters.q }),
        ...(filters.category && { category: filters.category }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
      });

      const res = await fetch(`/api/public/stores?${params}`);
      const data = await res.json();

      setStores(data.data.stores || []);
      setTotalPages(data.data.pagination.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
    fetchStores();
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
    });
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Stores</h1>
          <p className="text-muted-foreground">
            Discover stores offering amazing deals and coupons
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
                  placeholder="Search stores..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `Found ${stores.length} stores`}
          </p>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : stores.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No stores found</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <Link key={store.id} href={`/stores/${store.slug}`}>
                  <Card className="hover:shadow-xl transition-all h-full cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {store.logo ? (
                            <img
                              src={store.logo}
                              alt={store.name}
                              className="rounded-lg w-full h-full object-cover"
                            />
                          ) : (
                            <Store className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                            {store.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {store.city?.name}, {store.country.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {store.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {store.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4 text-primary" />
                            <span className="font-medium">{store._count.coupons}</span>
                            <span className="text-muted-foreground">coupons</span>
                          </div>
                          {store._count.reviews > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{store._count.reviews}</span>
                              <span className="text-muted-foreground">reviews</span>
                            </div>
                          )}
                        </div>

                        {/* Categories */}
                        {store.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {store.categories.slice(0, 3).map((cat) => (
                              <Badge key={cat.id} variant="secondary" className="text-xs">
                                {cat.icon} {cat.name}
                              </Badge>
                            ))}
                            {store.categories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{store.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <Button className="w-full mt-2" variant="outline">
                          View Store
                        </Button>
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
