/**
 * SEO & Dynamic Metadata Engine for ToLet Mymensingh
 * Handles document titles, meta tags, OpenGraph, Twitter Cards, Canonical URLs,
 * Robots directives, and Schema.org JSON-LD Structured Data.
 */

import { Listing } from '../types';

export interface SEOConfig {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogType?: 'website' | 'article' | 'place';
  ogImage?: string;
  noIndex?: boolean;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  locale?: 'bn_BD' | 'en_US';
}

const BASE_URL = 'https://toletmymensingh.com';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop';
const SITE_NAME = 'ToLet Mymensingh';

/**
 * Common search queries and natural keyword sets for Mymensingh rentals
 */
export const DEFAULT_KEYWORDS = [
  'ময়মনসিংহ বাসা ভাড়া',
  'Mymensingh house rent',
  'ময়মনসিংহ মেস',
  'Mymensingh mess',
  'Maskanda house rent',
  'মাসকান্দা বাসা ভাড়া',
  'Mymensingh bachelor room',
  'ময়মনসিংহ ব্যাচেলর রুম',
  'ময়মনসিংহ টু-লেট',
  'ToLet Mymensingh',
  'চরপাড়া ফ্ল্যাট ভাড়া',
  'আনন্দ মোহন কলেজ মেস',
  'বাকৃবি ছাত্রী হোস্টেল',
  'Mymensingh student hostel',
  'Family apartment rent Mymensingh'
];

/**
 * Updates DOM head elements with full production SEO tags
 */
export function updateSEOHead(config: SEOConfig): void {
  if (typeof document === 'undefined') return;

  const {
    title,
    description = 'ময়মনসিংহের বিশ্বস্ত ও আধুনিক রেন্টাল মার্কেটপ্লেস — বাসা, মেস, হোস্টেল ও সাবলেট খোঁজার সহজ প্ল্যাটফর্ম।',
    canonicalUrl,
    keywords = DEFAULT_KEYWORDS,
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    noIndex = false,
    noindex = false,
    structuredData,
    locale = 'bn_BD',
  } = config;

  const isNoIndex = Boolean(noIndex || noindex);

  // 1. Document Title
  const siteSuffix = 'ToLet Mymensingh';
  const fullTitle = title
    ? title.includes(siteSuffix)
      ? title
      : `${title} | ${siteSuffix}`
    : `ToLet Mymensingh | ময়মনসিংহের সেরা বাসা, মেস ও হোস্টেল মার্কেটপ্লেস`;
  document.title = fullTitle;

  // Helper to get or create meta tag
  const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords.join(', '));
  setMetaTag('name', 'author', 'ToLet Mymensingh Team');
  setMetaTag('name', 'geo.region', 'BD-13'); // Mymensingh Division ISO code
  setMetaTag('name', 'geo.placename', 'Mymensingh');
  setMetaTag('name', 'geo.position', '24.7471;90.4203');
  setMetaTag('name', 'ICBM', '24.7471, 90.4203');

  // 3. Robots directive (noindex, nofollow for dashboard/admin/auth/etc.)
  if (isNoIndex) {
    setMetaTag('name', 'robots', 'noindex, nofollow, noarchive');
    setMetaTag('name', 'googlebot', 'noindex, nofollow');
  } else {
    setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('name', 'googlebot', 'index, follow');
  }

  // 4. Canonical URL
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const finalCanonical = canonicalUrl || `${BASE_URL}${currentPath}`;
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', finalCanonical);

  // 5. OpenGraph Tags
  setMetaTag('property', 'og:site_name', SITE_NAME);
  setMetaTag('property', 'og:title', fullTitle);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', finalCanonical);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:image', ogImage);
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');
  setMetaTag('property', 'og:locale', locale);
  setMetaTag('property', 'og:locale:alternate', locale === 'bn_BD' ? 'en_US' : 'bn_BD');

  // 6. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:site', '@ToLetMymensingh');
  setMetaTag('name', 'twitter:title', fullTitle);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', ogImage);

  // 7. Structured Data (Schema.org JSON-LD)
  const existingScript = document.getElementById('tolet-jsonld-structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  if (structuredData) {
    const script = document.createElement('script');
    script.id = 'tolet-jsonld-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}

/**
 * Builds Listing-Specific Schema.org Structured Data
 */
export function buildListingStructuredData(listing: Listing, canonicalUrl: string): Record<string, unknown>[] {
  const imageUrls = listing.images?.map((i) => i.url) || [DEFAULT_OG_IMAGE];

  // Specific accommodation type mapping
  let accommodationType = 'Apartment';
  if (listing.property_type === 'mess' || listing.property_type === 'seat') {
    accommodationType = 'Room';
  } else if (listing.property_type === 'hostel') {
    accommodationType = 'Hostel';
  } else if (listing.property_type === 'sublet') {
    accommodationType = 'SingleFamilyResidence';
  }

  const listingSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', accommodationType],
    name: listing.title_bn,
    alternateName: listing.title_en || undefined,
    description: listing.description_bn,
    url: canonicalUrl,
    image: imageUrls,
    datePosted: listing.created_at || new Date().toISOString(),
    price: listing.rent_monthly,
    priceCurrency: 'BDT',
    offers: {
      '@type': 'Offer',
      price: listing.rent_monthly,
      priceCurrency: 'BDT',
      availability: listing.status === 'approved' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      validFrom: listing.available_from || undefined,
      businessFunction: 'https://schema.org/LeaseOut',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: listing.rent_monthly,
        priceCurrency: 'BDT',
        unitText: 'MONTH',
      },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address_street_bn || listing.address_street_en || 'Mymensingh City',
      addressLocality: listing.area_name_en || 'Mymensingh',
      addressRegion: 'Mymensingh Division',
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude || 24.7471,
      longitude: listing.longitude || 90.4203,
    },
  };

  if (listing.bedrooms) {
    listingSchema.numberOfBedrooms = listing.bedrooms;
    listingSchema.numberOfRooms = listing.bedrooms;
  }
  if (listing.bathrooms) {
    listingSchema.numberOfBathroomsTotal = listing.bathrooms;
  }
  if (listing.area_sqft) {
    listingSchema.floorSize = {
      '@type': 'QuantitativeValue',
      value: listing.area_sqft,
      unitCode: 'FTK', // Square Foot
    };
  }

  // Breadcrumbs schema
  const breadcrumbsSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম (Home)',
        item: `${BASE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: listing.property_type === 'mess' ? 'মেস ও সিট (Mymensingh Mess)' : listing.property_type === 'hostel' ? 'হোস্টেল (Mymensingh Hostel)' : 'টু-লেট বাসা ভাড়া (ToLet)',
        item: `${BASE_URL}/${listing.property_type === 'mess' ? 'mess' : listing.property_type === 'hostel' ? 'hostel' : 'tolet'}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.area_name_bn || 'ময়মনসিংহ',
        item: `${BASE_URL}/tolet?area=${encodeURIComponent(listing.area_name_en || '')}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: listing.title_bn,
        item: canonicalUrl,
      },
    ],
  };

  return [listingSchema, breadcrumbsSchema];
}

/**
 * Builds Category / Explorer Page Schema
 */
export function buildCategoryStructuredData(categoryTitle: string, categoryPath: string): Record<string, unknown>[] {
  const categoryUrl = `${BASE_URL}/${categoryPath}`;

  const breadcrumbsSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'হোম (Home)',
        item: `${BASE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryTitle,
        item: categoryUrl,
      },
    ],
  };

  const collectionSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryTitle} — ToLet Mymensingh`,
    url: categoryUrl,
    description: `ময়মনসিংহের বিভিন্ন এলাকা যেমন মাসকান্দা, চরপাড়া, বাঘমারা, কেওয়াটখালী, গাঙ্গিনারপাড়ে ${categoryTitle} খুঁজুন এবং সরাসরি বাড়িওয়ালার সাথে যোগাযোগ করুন।`,
    about: {
      '@type': 'Place',
      name: 'Mymensingh, Bangladesh',
    },
  };

  return [breadcrumbsSchema, collectionSchema];
}

/**
 * Builds Homepage Schema (WebSite + Organization + RealEstateAgent + SearchAction)
 */
export function buildHomepageStructuredData(): Record<string, unknown>[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ToLet Mymensingh',
      alternateName: 'ময়মনসিংহ বাসা ও মেস ভাড়া',
      url: `${BASE_URL}/`,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/tolet?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': ['RealEstateAgent', 'Organization'],
      name: 'ToLet Mymensingh',
      alternateName: 'ময়মনসিংহ রেন্টাল মার্কেটপ্লেস',
      url: `${BASE_URL}/`,
      logo: `${BASE_URL}/assets/logo.png`,
      description: 'ময়মনসিংহের সকল এলাকার বাসা ভাড়া, ফ্যামিলি ফ্ল্যাট, ব্যাচেলর মেস ও ছাত্রী হোস্টেল খোঁজার নির্ভরযোগ্য আধুনিক প্ল্যাটফর্ম।',
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Mymensingh District, Bangladesh',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mymensingh',
        addressRegion: 'Mymensingh Division',
        addressCountry: 'BD',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 24.7471,
        longitude: 90.4203,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'হোম (Home)',
          item: `${BASE_URL}/`,
        },
      ],
    },
  ];
}
