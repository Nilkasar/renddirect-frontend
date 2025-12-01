/**
 * Sitemap Generator Utility for RentDirect24
 *
 * This utility generates XML sitemap content.
 * In a production environment, this should be run server-side
 * or as part of a build process to generate static sitemap files.
 */

import { CITIES, PROPERTY_TYPES, ROOM_CONFIGS } from '../components/SEO/SchemaMarkup';

const BASE_URL = 'https://rentdirect24.com';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Generate static sitemap URLs
 */
export const generateStaticUrls = (): SitemapUrl[] => {
  const today = new Date().toISOString().split('T')[0];

  const urls: SitemapUrl[] = [
    // Homepage
    {
      loc: BASE_URL,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0,
    },
    // Properties listing
    {
      loc: `${BASE_URL}/properties`,
      lastmod: today,
      changefreq: 'hourly',
      priority: 0.9,
    },
  ];

  // City landing pages
  CITIES.forEach((city) => {
    urls.push({
      loc: `${BASE_URL}/rent/${city.toLowerCase()}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8,
    });

    // City + Property Type combinations
    PROPERTY_TYPES.forEach((type) => {
      urls.push({
        loc: `${BASE_URL}/properties?city=${city}&propertyType=${type.value}`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.7,
      });
    });

    // City + Room Config combinations
    ROOM_CONFIGS.forEach((config) => {
      urls.push({
        loc: `${BASE_URL}/properties?city=${city}&roomConfig=${config.value}`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.7,
      });
    });
  });

  return urls;
};

/**
 * Generate sitemap XML string
 */
export const generateSitemapXml = (urls: SitemapUrl[]): string => {
  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
};

/**
 * Generate sitemap index for multiple sitemaps
 */
export const generateSitemapIndex = (sitemapUrls: string[]): string => {
  const today = new Date().toISOString().split('T')[0];

  const entries = sitemapUrls
    .map(
      (url) => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
};

/**
 * IndexNow API integration for instant indexing
 * Call this when new properties are added or updated
 */
export const notifyIndexNow = async (urls: string[]): Promise<void> => {
  const INDEXNOW_KEY = 'your-indexnow-key'; // Replace with actual key

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: 'rentdirect24.com',
        key: INDEXNOW_KEY,
        keyLocation: `https://rentdirect24.com/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    console.log('IndexNow notification sent successfully');
  } catch (error) {
    console.error('Failed to notify IndexNow:', error);
  }
};

/**
 * Generate full static sitemap
 * This can be called during build time
 */
export const generateFullSitemap = (): string => {
  const staticUrls = generateStaticUrls();
  return generateSitemapXml(staticUrls);
};

// Export a pre-generated sitemap for reference
export const STATIC_SITEMAP = generateFullSitemap();
