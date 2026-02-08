import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/coupons`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stores`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Dynamic coupon routes
  const coupons = await prisma.coupon.findMany({
    where: {
      status: 'APPROVED',
      isActive: true,
      expiryDate: {
        gt: new Date(),
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 1000, // Limit for performance
  });

  const couponRoutes: MetadataRoute.Sitemap = coupons.map((coupon) => ({
    url: `${baseUrl}/coupons/${coupon.slug}`,
    lastModified: coupon.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic store routes
  const stores = await prisma.store.findMany({
    where: {
      status: 'APPROVED',
      isActive: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 1000, // Limit for performance
  });

  const storeRoutes: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${baseUrl}/stores/${store.slug}`,
    lastModified: store.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...couponRoutes, ...storeRoutes];
}
