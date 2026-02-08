import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Store,
  MapPin,
  Calendar,
  Heart,
  Share2,
  Copy,
  Tag,
  Clock,
  TrendingUp,
} from 'lucide-react';

async function getCoupon(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/public/coupons/${slug}`, {
    next: { revalidate: 3600 }, // ISR: Revalidate every hour
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
  const data = await getCoupon(params.slug);

  if (!data) {
    return {
      title: 'Coupon Not Found',
    };
  }

  const { coupon } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    title: `${coupon.title} - ${coupon.store.name} | Kobonz`,
    description: coupon.description || `Get ${coupon.discountValue}${coupon.type === 'PERCENTAGE' ? '%' : ' off'} at ${coupon.store.name}`,
    keywords: [coupon.title, coupon.store.name, 'coupon', 'discount', 'deal', coupon.category?.name].filter(Boolean),
    openGraph: {
      title: coupon.title,
      description: coupon.description || `Get ${coupon.discountValue}${coupon.type === 'PERCENTAGE' ? '%' : ' off'} at ${coupon.store.name}`,
      images: coupon.imageUrl ? [{ url: coupon.imageUrl }] : [],
      url: `${baseUrl}/coupons/${params.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: coupon.title,
      description: coupon.description || `Get ${coupon.discountValue}${coupon.type === 'PERCENTAGE' ? '%' : ' off'} at ${coupon.store.name}`,
      images: coupon.imageUrl ? [coupon.imageUrl] : [],
    },
    alternates: {
      canonical: `${baseUrl}/coupons/${params.slug}`,
    },
  };
}

export default async function CouponDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCoupon(params.slug);

  if (!data) {
    notFound();
  }

  const { coupon, relatedCoupons } = data;

  const daysUntilExpiry = Math.ceil(
    (new Date(coupon.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Generate structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: coupon.title,
    description: coupon.description,
    url: `${baseUrl}/coupons/${params.slug}`,
    image: coupon.imageUrl,
    priceSpecification: {
      '@type': 'PriceSpecification',
      price: coupon.type === 'PERCENTAGE' ? `${coupon.discountValue}%` : coupon.discountValue,
    },
    validFrom: coupon.startDate,
    validThrough: coupon.expiryDate,
    seller: {
      '@type': 'Organization',
      name: coupon.store.name,
    },
    availability: 'https://schema.org/InStock',
  };

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
        name: 'Coupons',
        item: `${baseUrl}/coupons`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: coupon.title,
        item: `${baseUrl}/coupons/${params.slug}`,
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coupon Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="default" className="text-xl font-bold px-4 py-2">
                    {coupon.type === 'PERCENTAGE'
                      ? `${coupon.discountValue}% OFF`
                      : coupon.type === 'FIXED_AMOUNT'
                      ? `$${coupon.discountValue} OFF`
                      : coupon.type === 'BUY_ONE_GET_ONE'
                      ? 'BUY 1 GET 1'
                      : 'FREE SHIPPING'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardTitle className="text-3xl mb-4">{coupon.title}</CardTitle>

                {/* Store Info */}
                <Link
                  href={`/stores/${coupon.store.slug}`}
                  className="inline-flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center">
                    {coupon.store.logo ? (
                      <img
                        src={coupon.store.logo}
                        alt={coupon.store.name}
                        className="rounded-lg"
                      />
                    ) : (
                      <Store className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{coupon.store.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {coupon.store._count.coupons} coupons available
                    </p>
                  </div>
                </Link>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Description */}
                {coupon.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{coupon.description}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{coupon._count.usages}</div>
                    <div className="text-xs text-muted-foreground">Uses</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Heart className="h-5 w-5 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">{coupon._count.favorites}</div>
                    <div className="text-xs text-muted-foreground">Favorites</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{daysUntilExpiry}</div>
                    <div className="text-xs text-muted-foreground">Days Left</div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Details</h3>
                  <div className="space-y-2 text-sm">
                    {coupon.minPurchase && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Minimum Purchase:</span>
                        <span className="font-medium">${coupon.minPurchase}</span>
                      </div>
                    )}
                    {coupon.maxDiscount && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Maximum Discount:</span>
                        <span className="font-medium">${coupon.maxDiscount}</span>
                      </div>
                    )}
                    {coupon.usageLimit && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Usage Limit:</span>
                        <span className="font-medium">{coupon.usageLimit}</span>
                      </div>
                    )}
                    {coupon.perUserLimit && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Per User Limit:</span>
                        <span className="font-medium">{coupon.perUserLimit}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Valid From:</span>
                      <span className="font-medium">
                        {new Date(coupon.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Expires On:</span>
                      <span className="font-medium">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Coupons */}
            {relatedCoupons.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">More from {coupon.store.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedCoupons.map((related: any) => (
                    <Link key={related.id} href={`/coupons/${related.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <Badge variant="secondary" className="w-fit mb-2">
                            {related.type === 'PERCENTAGE'
                              ? `${related.discountValue}% OFF`
                              : `$${related.discountValue} OFF`}
                          </Badge>
                          <CardTitle className="text-lg line-clamp-2">
                            {related.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted/50 rounded-lg p-2 text-center">
                            <div className="text-xs text-muted-foreground">Code</div>
                            <div className="font-mono font-bold">{related.code}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coupon Code Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-center">Get This Deal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 border-2 border-primary border-dashed rounded-lg p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Coupon Code</div>
                  <div className="font-mono font-bold text-2xl text-primary mb-3">
                    {coupon.code}
                  </div>
                  <Button className="w-full" size="lg">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>

                {coupon.store.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={coupon.store.website} target="_blank" rel="noopener noreferrer">
                      Visit Store Website
                    </a>
                  </Button>
                )}

                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expires {new Date(coupon.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                  {coupon.category && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>{coupon.category.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Store Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Store Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    {coupon.store.district && <div>{coupon.store.district.name}</div>}
                    {coupon.store.city && <div>{coupon.store.city.name}</div>}
                    <div>{coupon.store.country.name}</div>
                  </div>
                </div>

                {coupon.store.address && (
                  <p className="text-muted-foreground pl-6">{coupon.store.address}</p>
                )}

                <Link href={`/stores/${coupon.store.slug}`} className="block pt-2">
                  <Button variant="outline" className="w-full" size="sm">
                    View Store Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
