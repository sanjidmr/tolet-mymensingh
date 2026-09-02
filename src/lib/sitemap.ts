import { fetchPublicListings } from './supabase';
import { SAMPLE_LISTINGS } from '../data/sample-listings';

const BASE_URL = 'https://toletmymensingh.com';

interface SitemapEntry {
  loc: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

/**
 * Generates dynamic XML sitemap string including all live approved listings
 */
export async function generateDynamicSitemapXml(): Promise<string> {
  let listings = SAMPLE_LISTINGS;
  try {
    const fetched = await fetchPublicListings();
    if (fetched && fetched.length > 0) {
      listings = fetched;
    }
  } catch (err) {
    console.warn('Fallback to sample listings for sitemap generation:', err);
  }

  const staticPages: SitemapEntry[] = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { loc: `${BASE_URL}/tolet`, priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { loc: `${BASE_URL}/mess`, priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { loc: `${BASE_URL}/hostel`, priority: '0.85', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { loc: `${BASE_URL}/sublet`, priority: '0.8', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { loc: `${BASE_URL}/safety`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${BASE_URL}/faq`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${BASE_URL}/terms`, priority: '0.3', changefreq: 'monthly' },
  ];

  const listingPages: SitemapEntry[] = listings
    .filter((l) => l.status === 'approved')
    .map((l) => {
      const prefix = l.property_type === 'mess' ? 'mess' : l.property_type === 'hostel' ? 'hostel' : l.property_type === 'sublet' ? 'sublet' : 'tolet';
      return {
        loc: `${BASE_URL}/${prefix}/${l.slug || l.id}`,
        lastmod: (l.updated_at || l.created_at || new Date().toISOString()).split('T')[0],
        priority: '0.8',
        changefreq: 'weekly',
      };
    });

  const allUrls: SitemapEntry[] = [...staticPages, ...listingPages];

  const xmlUrls = allUrls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}
