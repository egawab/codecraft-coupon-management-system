import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Store as StoreIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Tag,
  Star,
  Calendar,
  Heart,
} from 'lucide-react';

async function getStore(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/public/stores/${slug}`, {
    next: { revalidate: 1800 }, // ISR: Revalidate every 30 minutes
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.data;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getStore(params.slug);

  if (!data) {
    return {
      title: 'Store Not Found',
    };
  }

  const { store, averageRating } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    title: `${store.name} - Coupons & Deals | Kobonz`,
    description: store.description || `Find the best deals and coupons for ${store.name}. ${averageRating ? `Rated ${averageRating.toFixed(1)} stars.` : ''}`,
    keywords: [store.name, 'store', 'coupons', 'deals', store.category?.name, store.city?.name, store.country?.name].filter(Boolean),
    openGraph: {
      title: store.name,
      description: store.description || `Find the best deals and coupons for ${store.name}`,
      images: store.logoUrl ? [{ url: store.logoUrl }] : [],
      url: `${baseUrl}/stores/${params.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: store.name,
      description: store.description || `Find the best deals and coupons for ${store.name}`,
      images: store.logoUrl ? [store.logoUrl] : [],
    },
    alternates: {
      canonical: `${baseUrl}/stores/${params.slug}`,
    },
  };
}

export default async function StoreProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getStore(params.slug);

  if (!data) {
    notFound();
  }

  const { store, coupons, reviews, averageRating } = data;

  // Generate structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    description: store.description,
    url: `${baseUrl}/stores/${params.slug}`,
    image: store.logoUrl,
  };

  if (store.address || store.city?.name || store.country?.name) {
    structuredData.address = {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.city?.name,
      addressCountry: store.country?.name,
    };
  }

  if (store.phone) {
    structuredData.telephone = store.phone;
  }

  if (store.email) {
    structuredData.email = store.email;
  }

  if (store.website) {
    structuredData.url = store.website;
  }

  if (averageRating && reviews?.length) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Stores',
        item: `${baseUrl}/stores`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: store.name,
        item: `${baseUrl}/stores/${params.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-muted/30">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Store Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg shadow-lg flex items-center justify-center flex-shrink-0">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="rounded-lg w-full h-full object-cover"
                />
              ) : (
                <StoreIcon className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{store.name}</h1>
              
              {store.description && (
                <p className="text-muted-foreground text-lg mb-4">{store.description}</p>
              )}

              {/* Categories */}
              {store.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {store.categories.map((cat: any) => (
                    <Badge key={cat.id} variant="secondary">
                      {cat.icon} {cat.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{store._count.coupons}</span>
                  <span className="text-muted-foreground">Active Coupons</span>
                </div>
                {store._count.reviews > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({store._count.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {store.website && (
                <Button asChild>
                  <a href={store.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              <Button variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Follow Store
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Coupons */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Active Coupons ({coupons.length})
              </h2>

              {coupons.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold mb-2">No active coupons</p>
                    <p className="text-muted-foreground">
                      Check back later for new deals from this store
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map((coupon: any) => (
                    <Link key={coupon.id} href={`/coupons/${coupon.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="default" className="text-base font-bold">
                              {coupon.type === 'PERCENTAGE'
                                ? `${coupon.discountValue}% OFF`
                                : `$${coupon.discountValue} OFF`}
                            </Badge>
                            {coupon._count.favorites > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Heart className="h-3 w-3 fill-current" />
                                {coupon._count.favorites}
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-2">
                            {coupon.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="bg-muted/50 rounded-lg p-2 text-center border-dashed border-2">
                              <div className="text-xs text-muted-foreground">Code</div>
                              <div className="font-mono font-bold">{coupon.code}</div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{coupon._count.usages} uses</span>
                              <span>
                                Expires {new Date(coupon.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {review.user.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className="rounded-full w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-primary">
                                {review.user.name?.[0] || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">{review.user.name || 'Anonymous'}</p>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Store Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Store Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    {store.district && <div>{store.district.name}</div>}
                    {store.city && <div>{store.city.name}</div>}
                    <div>{store.country.name}</div>
                    {store.address && (
                      <p className="text-muted-foreground mt-1">{store.address}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                {store.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${store.phone}`} className="hover:text-primary">
                      {store.phone}
                    </a>
                  </div>
                )}

                {/* Email */}
                {store.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${store.email}`} className="hover:text-primary truncate">
                      {store.email}
                    </a>
                  </div>
                )}

                {/* Website */}
                {store.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Coupons</span>
                  <span className="font-semibold">{store._count.coupons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="font-semibold">{store._count.reviews}</span>
                </div>
                {averageRating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
