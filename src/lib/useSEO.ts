import { useEffect } from 'react';
import { SEOConfig, updateSEOHead } from './seo';

/**
 * Custom React Hook to manage page-level Dynamic SEO, Title, Meta Tags, and JSON-LD
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    updateSEOHead(config);
  }, [
    config.title,
    config.description,
    config.canonicalUrl,
    config.noIndex,
    config.ogType,
    config.ogImage,
    config.locale,
    JSON.stringify(config.keywords),
    JSON.stringify(config.structuredData),
  ]);
}
