import { ListingFilterState, ListingSortOption, PropertyType, TargetAudience } from '../types';

/**
 * Parses query parameters from URL search string into a typed ListingFilterState
 */
export function parseUrlFilters(search: string, defaultType: PropertyType | 'all' = 'all'): ListingFilterState {
  const params = new URLSearchParams(search);
  const filters: ListingFilterState = {};

  // Area
  const area = params.get('area');
  if (area && area !== 'all') {
    filters.areaSlug = area;
  }

  // Property Type
  const type = params.get('type') as PropertyType | 'all' | null;
  if (type && type !== 'all') {
    filters.propertyType = type;
  } else if (defaultType !== 'all') {
    filters.propertyType = defaultType;
  }

  // Audience
  const audience = params.get('audience') as TargetAudience | 'all' | null;
  if (audience && audience !== 'all') {
    filters.audience = audience;
  }

  // Rent Range
  const minRent = params.get('min_rent');
  if (minRent && !isNaN(Number(minRent)) && Number(minRent) > 0) {
    filters.minRent = Number(minRent);
  }

  const maxRent = params.get('max_rent');
  if (maxRent && !isNaN(Number(maxRent)) && Number(maxRent) > 0) {
    filters.maxRent = Number(maxRent);
  }

  // Bedrooms
  const beds = params.get('beds');
  if (beds && beds !== 'all') {
    filters.bedrooms = beds;
  }

  // Bathrooms
  const baths = params.get('baths');
  if (baths && baths !== 'all') {
    filters.bathrooms = baths;
  }

  // Amenities (comma separated string)
  const amenitiesStr = params.get('amenities');
  if (amenitiesStr) {
    const list = amenitiesStr.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) {
      filters.amenities = list;
    }
  }

  // Verified & Featured
  const verified = params.get('verified');
  if (verified === 'true' || verified === '1') {
    filters.isVerifiedOnly = true;
  }

  const featured = params.get('featured');
  if (featured === 'true' || featured === '1') {
    filters.isFeaturedOnly = true;
  }

  // Sorting
  const sort = params.get('sort') as ListingSortOption | null;
  if (sort && ['newest', 'rent_asc', 'rent_desc', 'popular'].includes(sort)) {
    filters.sortBy = sort;
  } else {
    filters.sortBy = 'newest';
  }

  // Search Query
  const q = params.get('q');
  if (q && q.trim()) {
    filters.searchQuery = q.trim();
  }

  // Page
  const page = params.get('page');
  if (page && !isNaN(Number(page)) && Number(page) > 1) {
    filters.page = Number(page);
  } else {
    filters.page = 1;
  }

  return filters;
}

/**
 * Serializes typed ListingFilterState into a URL query parameter string
 */
export function serializeFiltersToUrl(filters: ListingFilterState, defaultType: PropertyType | 'all' = 'all'): string {
  const params = new URLSearchParams();

  if (filters.areaSlug && filters.areaSlug !== 'all') {
    params.set('area', filters.areaSlug);
  }

  if (filters.propertyType && filters.propertyType !== 'all' && filters.propertyType !== defaultType) {
    params.set('type', filters.propertyType);
  }

  if (filters.audience && filters.audience !== 'all') {
    params.set('audience', filters.audience);
  }

  if (filters.minRent !== undefined && filters.minRent > 0) {
    params.set('min_rent', String(filters.minRent));
  }

  if (filters.maxRent !== undefined && filters.maxRent > 0) {
    params.set('max_rent', String(filters.maxRent));
  }

  if (filters.bedrooms && filters.bedrooms !== 'all') {
    params.set('beds', String(filters.bedrooms));
  }

  if (filters.bathrooms && filters.bathrooms !== 'all') {
    params.set('baths', String(filters.bathrooms));
  }

  if (filters.amenities && filters.amenities.length > 0) {
    params.set('amenities', filters.amenities.join(','));
  }

  if (filters.isVerifiedOnly) {
    params.set('verified', 'true');
  }

  if (filters.isFeaturedOnly) {
    params.set('featured', 'true');
  }

  if (filters.sortBy && filters.sortBy !== 'newest') {
    params.set('sort', filters.sortBy);
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    params.set('q', filters.searchQuery.trim());
  }

  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }

  const queryStr = params.toString();
  return queryStr ? `?${queryStr}` : '';
}

/**
 * Counts how many active filters are applied (excluding pagination and sorting)
 */
export function countActiveFilters(filters: ListingFilterState, defaultType: PropertyType | 'all' = 'all'): number {
  let count = 0;
  if (filters.areaSlug && filters.areaSlug !== 'all') count++;
  if (filters.propertyType && filters.propertyType !== 'all' && filters.propertyType !== defaultType) count++;
  if (filters.audience && filters.audience !== 'all') count++;
  if (filters.minRent !== undefined && filters.minRent > 0) count++;
  if (filters.maxRent !== undefined && filters.maxRent > 0) count++;
  if (filters.bedrooms && filters.bedrooms !== 'all') count++;
  if (filters.bathrooms && filters.bathrooms !== 'all') count++;
  if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
  if (filters.isVerifiedOnly) count++;
  if (filters.isFeaturedOnly) count++;
  if (filters.searchQuery && filters.searchQuery.trim()) count++;
  return count;
}
