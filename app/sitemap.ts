import type { MetadataRoute } from 'next';
import { getAllBlogSlugs, getAllBlogCategories } from '@/lib/blog/queries';
import { getPublishedBrokerSlugs } from '@/lib/brokers/queries';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://mytradingreviews.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories, brokerSlugs] = await Promise.all([
    getAllBlogSlugs(),
    getAllBlogCategories(),
    getPublishedBrokerSlugs(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/ranking`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/comparison`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/awards`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/ib-affiliate`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/get-listed`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/about-us`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Broker detail pages — pakai updated_at dari DB sebagai lastModified
  // biar Google tau page mana yang baru di-edit dan re-crawl prioritas.
  const brokerRoutes: MetadataRoute.Sitemap = brokerSlugs.map((b) => ({
    url: `${SITE_URL}/brokers/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Note: category filter is a query param (?category=xxx), Google generally
  // does not index query params. We expose them for discoverability via internal links.
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/blog?category=${cat.slug.current}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...brokerRoutes, ...blogRoutes, ...categoryRoutes];
}
