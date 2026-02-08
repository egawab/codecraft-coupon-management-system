/**
 * Generate JSON-LD structured data for SEO
 */

export interface CouponStructuredData {
  title: string;
  description?: string;
  code: string;
  discountValue: number;
  type: string;
  startDate: Date;
  expiryDate: Date;
  store: {
    name: string;
    url?: string;
  };
  imageUrl?: string;
}

export interface StoreStructuredData {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  rating?: number;
  reviewCount?: number;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kobonz',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Discover and share amazing deals in your local area',
    sameAs: [
      // Add social media profiles here
    ],
  };
}

/**
 * Generate Coupon/Offer structured data
 */
export function generateCouponSchema(
  coupon: CouponStructuredData,
  baseUrl: string,
  slug: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: coupon.title,
    description: coupon.description,
    url: `${baseUrl}/coupons/${slug}`,
    image: coupon.imageUrl,
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'USD', // TODO: Make this dynamic based on store location
      price: coupon.type === 'PERCENTAGE' ? `${coupon.discountValue}%` : coupon.discountValue,
    },
    validFrom: coupon.startDate.toISOString(),
    validThrough: coupon.expiryDate.toISOString(),
    seller: {
      '@type': 'Organization',
      name: coupon.store.name,
      url: coupon.store.url,
    },
    availability: 'https://schema.org/InStock',
  };
}

/**
 * Generate LocalBusiness structured data for stores
 */
export function generateStoreSchema(
  store: StoreStructuredData,
  baseUrl: string,
  slug: string
) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    description: store.description,
    url: `${baseUrl}/stores/${slug}`,
    image: store.logoUrl,
  };

  if (store.address || store.city || store.country) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.city,
      addressCountry: store.country,
    };
  }

  if (store.phone) {
    schema.telephone = store.phone;
  }

  if (store.email) {
    schema.email = store.email;
  }

  if (store.rating && store.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: store.rating,
      reviewCount: store.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  breadcrumbs: { name: string; url: string }[],
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kobonz',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/coupons?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
