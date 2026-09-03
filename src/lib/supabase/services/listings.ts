import { getSupabaseBrowserClient } from '../client';
import { Listing, ListingFilterState, ListingImage, ListingStatus, PaginatedListingsResult } from '../../../types';
import { SAMPLE_LISTINGS } from '../../../data/sample-listings';
import { Database } from '../../../types/database';

type ListingRow = Database['public']['Tables']['listings']['Row'];
type ListingImageRow = Database['public']['Tables']['listing_images']['Row'];

/**
 * Transforms Supabase query results into the UI `Listing` type
 */
export function mapDatabaseListingToUiListing(
  item: any,
  images: Array<{ id: string; listing_id: string; url: string; storage_path: string; is_primary?: boolean; order_index?: number }> = [],
  amenityIds: string[] = [],
  areaInfo?: { name_bn?: string; name_en?: string },
  ownerProfile?: { name?: string; avatar_url?: string | null; is_verified?: boolean }
): Listing {
  const mappedImages: ListingImage[] = images.map((img) => ({
    id: img.id,
    listing_id: img.listing_id,
    url: img.url,
    storage_path: img.storage_path,
    is_primary: Boolean(img.is_primary),
    order_index: img.order_index ?? 0,
  }));

  return {
    id: item.id,
    title_bn: item.title_bn,
    title_en: item.title_en || '',
    slug: item.slug,
    description_bn: item.description_bn,
    description_en: item.description_en || undefined,
    property_type: item.property_type,
    audience: item.audience,
    status: item.status as ListingStatus,
    rent_monthly: item.rent_monthly,
    security_deposit: item.security_deposit || undefined,
    is_negotiable: item.is_negotiable,
    service_charge: item.service_charge || undefined,
    gas_bill_included: item.gas_bill_included,
    electricity_bill_included: item.electricity_bill_included,
    water_bill_included: item.water_bill_included,
    bedrooms: item.bedrooms || undefined,
    bathrooms: item.bathrooms || undefined,
    balconies: item.balconies || undefined,
    floor_number: item.floor_number || undefined,
    total_floors: item.total_floors || undefined,
    area_sqft: item.area_sqft || undefined,
    seat_count: item.seat_count || undefined,
    area_id: item.area_id,
    area_name_bn: areaInfo?.name_bn || item.areas?.name_bn || 'ময়মনসিংহ',
    area_name_en: areaInfo?.name_en || item.areas?.name_en || 'Mymensingh',
    address_street_bn: item.address_street_bn,
    address_street_en: item.address_street_en || undefined,
    landmark_bn: item.landmark_bn || undefined,
    landmark_en: item.landmark_en || undefined,
    latitude: item.latitude || undefined,
    longitude: item.longitude || undefined,
    contact_name: item.contact_name,
    contact_phone: item.contact_phone,
    contact_whatsapp: item.contact_whatsapp || undefined,
    hide_exact_phone: item.hide_exact_phone,
    owner_id: item.owner_id,
    owner_name: ownerProfile?.name || item.profiles?.name || item.contact_name,
    owner_avatar: ownerProfile?.avatar_url || item.profiles?.avatar_url || undefined,
    is_owner_verified: ownerProfile?.is_verified ?? item.profiles?.is_verified ?? false,
    is_verified: item.is_verified,
    is_featured: item.is_featured,
    views_count: item.views_count,
    available_from: item.available_from,
    images: mappedImages.length > 0 ? mappedImages : [
      {
        id: `img-${item.id}-default`,
        listing_id: item.id,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
        storage_path: 'default.jpg',
        is_primary: true,
        order_index: 0,
      }
    ],
    amenity_ids: amenityIds.length > 0 ? amenityIds : (item.listing_amenities?.map((a: any) => a.amenity_id) || []),
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

/**
 * Fetches public approved listings with server-side filtering, sorting, and pagination
 */
export async function fetchPublicListingsPaginated(filters: ListingFilterState = {}): Promise<PaginatedListingsResult> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = filters.pageSize || 12;
  const client = getSupabaseBrowserClient();

  if (!client) {
    return filterSampleListingsPaginated(filters, page, pageSize);
  }

  try {
    let query = client
      .from('listings')
      .select(`
        *,
        areas ( name_bn, name_en, slug ),
        profiles ( name, avatar_url, is_verified ),
        listing_images ( id, listing_id, url, storage_path, is_primary, order_index ),
        listing_amenities ( amenity_id )
      `, { count: 'exact' })
      .eq('status', 'approved');

    // 1. Filter by Area Slug
    if (filters.areaSlug && filters.areaSlug !== 'all') {
      const { data: areaData } = await client
        .from('areas')
        .select('id')
        .eq('slug', filters.areaSlug)
        .single();
      
      if (areaData) {
        query = query.eq('area_id', areaData.id);
      } else {
        query = query.eq('area_id', filters.areaSlug);
      }
    }

    // 2. Filter by Property Type
    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('property_type', filters.propertyType);
    }

    // 3. Filter by Target Audience
    if (filters.audience && filters.audience !== 'all') {
      query = query.eq('audience', filters.audience);
    }

    // 4. Filter by Rent range
    if (filters.minRent !== undefined && filters.minRent > 0) {
      query = query.gte('rent_monthly', filters.minRent);
    }
    if (filters.maxRent !== undefined && filters.maxRent > 0) {
      query = query.lte('rent_monthly', filters.maxRent);
    }

    // 5. Filter by Bedrooms
    if (filters.bedrooms && filters.bedrooms !== 'all') {
      query = query.gte('bedrooms', Number(filters.bedrooms));
    }

    // 6. Filter by Bathrooms
    if (filters.bathrooms && filters.bathrooms !== 'all') {
      query = query.gte('bathrooms', Number(filters.bathrooms));
    }

    // 7. Verified & Featured Filters
    if (filters.isVerifiedOnly) {
      query = query.eq('is_verified', true);
    }
    if (filters.isFeaturedOnly) {
      query = query.eq('is_featured', true);
    }

    // 8. Search query (multi-column ilike)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim();
      query = query.or(`title_bn.ilike.%${q}%,title_en.ilike.%${q}%,address_street_bn.ilike.%${q}%,address_street_en.ilike.%${q}%,landmark_bn.ilike.%${q}%,description_bn.ilike.%${q}%`);
    }

    // 9. Multi-Amenities Filter
    if (filters.amenities && filters.amenities.length > 0) {
      const { data: amenityMatches } = await client
        .from('listing_amenities')
        .select('listing_id, amenity_id')
        .in('amenity_id', filters.amenities);

      if (amenityMatches) {
        const listingCounts: Record<string, number> = {};
        amenityMatches.forEach((m) => {
          listingCounts[m.listing_id] = (listingCounts[m.listing_id] || 0) + 1;
        });
        
        // Exact overlap match: listing must have all chosen amenities
        const targetCount = filters.amenities.length;
        const matchingIds = Object.keys(listingCounts).filter((id) => listingCounts[id] >= targetCount);

        if (matchingIds.length === 0) {
          return { listings: [], totalCount: 0, page, pageSize, totalPages: 1 };
        }
        query = query.in('id', matchingIds);
      }
    }

    // 10. Sorting
    switch (filters.sortBy) {
      case 'rent_asc':
        query = query.order('rent_monthly', { ascending: true });
        break;
      case 'rent_desc':
        query = query.order('rent_monthly', { ascending: false });
        break;
      case 'popular':
        query = query.order('views_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    // 11. Range Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error || !data) {
      console.warn('Supabase query error, falling back to local dataset:', error);
      return filterSampleListingsPaginated(filters, page, pageSize);
    }

    const mapped = data.map((row: any) =>
      mapDatabaseListingToUiListing(
        row,
        row.listing_images || [],
        row.listing_amenities?.map((a: any) => a.amenity_id) || [],
        row.areas,
        row.profiles
      )
    );

    const totalCount = count ?? mapped.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      listings: mapped,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    console.error('Error fetching listings:', err);
    return filterSampleListingsPaginated(filters, page, pageSize);
  }
}

/**
 * Fetches public approved listings (backward compatible helper)
 */
export async function fetchPublicListings(filters: ListingFilterState = {}): Promise<Listing[]> {
  const result = await fetchPublicListingsPaginated(filters);
  return result.listings;
}

/**
 * Fetches a single listing by its URL slug or ID with robust local & database fallback
 */
export async function fetchListingBySlug(slugOrId: string): Promise<Listing | null> {
  const localListings = getLocalCustomListings();
  const localFound = localListings.find((l) => l.slug === slugOrId || l.id === slugOrId);
  if (localFound) return localFound;

  const sampleFound = SAMPLE_LISTINGS.find((l) => l.slug === slugOrId || l.id === slugOrId);

  const client = getSupabaseBrowserClient();
  if (!client) {
    return sampleFound || null;
  }

  try {
    // 1. Try fetching by slug first
    let { data, error } = await client
      .from('listings')
      .select(`
        *,
        areas ( name_bn, name_en ),
        profiles ( name, avatar_url, is_verified ),
        listing_images ( id, listing_id, url, storage_path, is_primary, order_index ),
        listing_amenities ( amenity_id )
      `)
      .eq('slug', slugOrId)
      .maybeSingle();

    // 2. If not found by slug, try by ID
    if (!data) {
      const idResult = await client
        .from('listings')
        .select(`
          *,
          areas ( name_bn, name_en ),
          profiles ( name, avatar_url, is_verified ),
          listing_images ( id, listing_id, url, storage_path, is_primary, order_index ),
          listing_amenities ( amenity_id )
        `)
        .eq('id', slugOrId)
        .maybeSingle();

      data = idResult.data;
    }

    if (!data) {
      return sampleFound || null;
    }

    return mapDatabaseListingToUiListing(
      data,
      data.listing_images || [],
      data.listing_amenities?.map((a: any) => a.amenity_id) || [],
      data.areas,
      data.profiles
    );
  } catch (err) {
    console.error('Error fetching listing by slug:', err);
    return sampleFound || null;
  }
}

const CUSTOM_LISTINGS_KEY = 'tolet_custom_listings';

function getLocalCustomListings(): Listing[] {
  try {
    const saved = localStorage.getItem(CUSTOM_LISTINGS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomListings(items: Listing[]): void {
  try {
    localStorage.setItem(CUSTOM_LISTINGS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save custom listings in localStorage:', err);
  }
}

/**
 * Fetches listings owned by a specific landlord/owner user
 */
export async function fetchOwnerListings(ownerId: string): Promise<Listing[]> {
  const localItems = getLocalCustomListings().filter((l) => l.owner_id === ownerId);
  const sampleItems = SAMPLE_LISTINGS.filter((l) => l.owner_id === ownerId || ownerId.includes('demo-owner'));
  const fallbackList = [...localItems, ...sampleItems];

  const client = getSupabaseBrowserClient();
  if (!client) {
    return fallbackList;
  }

  try {
    const { data, error } = await client
      .from('listings')
      .select(`
        *,
        areas ( name_bn, name_en ),
        profiles ( name, avatar_url, is_verified ),
        listing_images ( id, listing_id, url, storage_path, is_primary, order_index ),
        listing_amenities ( amenity_id )
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return fallbackList;
    }

    const fetched = data.map((row: any) =>
      mapDatabaseListingToUiListing(
        row,
        row.listing_images || [],
        row.listing_amenities?.map((a: any) => a.amenity_id) || [],
        row.areas,
        row.profiles
      )
    );

    // Merge with any unsynced local custom listings
    const merged = [...localItems.filter((loc) => !fetched.some((f) => f.id === loc.id)), ...fetched];
    return merged;
  } catch (err) {
    console.error('Error fetching owner listings:', err);
    return fallbackList;
  }
}

/**
 * Fetches a single listing by its ID
 */
export async function fetchListingById(id: string): Promise<Listing | null> {
  const localListings = getLocalCustomListings();
  const localFound = localListings.find((l) => l.id === id);
  if (localFound) return localFound;

  const sampleFound = SAMPLE_LISTINGS.find((l) => l.id === id);

  const client = getSupabaseBrowserClient();
  if (!client) {
    return sampleFound || null;
  }

  try {
    const { data, error } = await client
      .from('listings')
      .select(`
        *,
        areas ( name_bn, name_en ),
        profiles ( name, avatar_url, is_verified ),
        listing_images ( id, listing_id, url, storage_path, is_primary, order_index ),
        listing_amenities ( amenity_id )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return sampleFound || null;
    }

    return mapDatabaseListingToUiListing(
      data,
      data.listing_images || [],
      data.listing_amenities?.map((a: any) => a.amenity_id) || [],
      data.areas,
      data.profiles
    );
  } catch (err) {
    console.error('Error fetching listing by id:', err);
    return sampleFound || null;
  }
}

/**
 * Creates a new rental listing and inserts its images & amenities
 * Enforces status: 'pending' (or 'draft') - never allows direct 'approved'.
 */
export async function createListing(
  listingData: Omit<Database['public']['Tables']['listings']['Insert'], 'id' | 'created_at' | 'updated_at'>,
  images: { url: string; storage_path: string; is_primary?: boolean; order_index?: number }[],
  amenityIds: string[]
): Promise<Listing> {
  // Enforce security: non-admins cannot create pre-approved listings
  const safeStatus = listingData.status === 'draft' ? 'draft' : 'pending';
  const cleanData = {
    ...listingData,
    status: safeStatus as ListingStatus,
    is_verified: false,
    is_featured: false,
  };

  const client = getSupabaseBrowserClient();
  if (!client) {
    // Local persistence fallback
    const id = `listing-custom-${Date.now()}`;
    const generatedSlug = `${cleanData.slug || 'tolet'}-${Date.now().toString(36)}`;
    const newUiListing: Listing = {
      id,
      title_bn: cleanData.title_bn,
      title_en: cleanData.title_en || '',
      slug: generatedSlug,
      description_bn: cleanData.description_bn,
      description_en: cleanData.description_en || undefined,
      property_type: cleanData.property_type,
      audience: cleanData.audience,
      status: safeStatus,
      rent_monthly: cleanData.rent_monthly,
      security_deposit: cleanData.security_deposit || undefined,
      is_negotiable: cleanData.is_negotiable || false,
      service_charge: cleanData.service_charge || undefined,
      gas_bill_included: cleanData.gas_bill_included || false,
      electricity_bill_included: cleanData.electricity_bill_included || false,
      water_bill_included: cleanData.water_bill_included ?? true,
      bedrooms: cleanData.bedrooms || undefined,
      bathrooms: cleanData.bathrooms || undefined,
      balconies: cleanData.balconies || undefined,
      floor_number: cleanData.floor_number || undefined,
      total_floors: cleanData.total_floors || undefined,
      area_sqft: cleanData.area_sqft || undefined,
      seat_count: cleanData.seat_count || undefined,
      area_id: cleanData.area_id,
      area_name_bn: 'ময়মনসিংহ সদর',
      area_name_en: 'Mymensingh Sadar',
      address_street_bn: cleanData.address_street_bn,
      address_street_en: cleanData.address_street_en || undefined,
      landmark_bn: cleanData.landmark_bn || undefined,
      landmark_en: cleanData.landmark_en || undefined,
      contact_name: cleanData.contact_name,
      contact_phone: cleanData.contact_phone,
      contact_whatsapp: cleanData.contact_whatsapp || undefined,
      hide_exact_phone: cleanData.hide_exact_phone || false,
      owner_id: cleanData.owner_id,
      owner_name: cleanData.contact_name,
      is_owner_verified: false,
      is_verified: false,
      is_featured: false,
      views_count: 0,
      available_from: cleanData.available_from,
      images: images.map((img, idx) => ({
        id: `img-${id}-${idx}`,
        listing_id: id,
        url: img.url,
        storage_path: img.storage_path,
        is_primary: img.is_primary ?? idx === 0,
        order_index: img.order_index ?? idx,
      })),
      amenity_ids: amenityIds,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const currentLocal = getLocalCustomListings();
    saveLocalCustomListings([newUiListing, ...currentLocal]);
    return newUiListing;
  }

  // 1. Insert listing
  const { data: newListing, error: listingError } = await client
    .from('listings')
    .insert([cleanData])
    .select()
    .single();

  if (listingError || !newListing) {
    throw new Error(`Failed to create listing: ${listingError?.message}`);
  }

  // 2. Insert images
  if (images.length > 0) {
    const imageRows = images.map((img, idx) => ({
      listing_id: newListing.id,
      url: img.url,
      storage_path: img.storage_path,
      is_primary: img.is_primary ?? idx === 0,
      order_index: img.order_index ?? idx,
    }));

    const { error: imgError } = await client.from('listing_images').insert(imageRows);
    if (imgError) {
      console.error('Error saving listing images:', imgError);
    }
  }

  // 3. Insert amenities
  if (amenityIds.length > 0) {
    const amenityRows = amenityIds.map((amenityId) => ({
      listing_id: newListing.id,
      amenity_id: amenityId,
    }));

    const { error: amenityError } = await client.from('listing_amenities').insert(amenityRows);
    if (amenityError) {
      console.error('Error attaching amenities to listing:', amenityError);
    }
  }

  const fetched = await fetchListingBySlug(newListing.slug);
  if (!fetched) {
    throw new Error('Listing created but failed to retrieve record.');
  }

  return fetched;
}

/**
 * Updates a listing record securely
 */
export async function updateListing(
  id: string,
  ownerId: string,
  updates: Database['public']['Tables']['listings']['Update'],
  images?: { url: string; storage_path: string; is_primary?: boolean; order_index?: number }[],
  amenityIds?: string[]
): Promise<boolean> {
  // Prevent unauthorized role manipulation & forbid direct self-approval
  const safeUpdates = { ...updates };
  if (safeUpdates.status === 'approved') {
    safeUpdates.status = 'pending';
  }
  delete (safeUpdates as any).is_verified;
  delete (safeUpdates as any).is_featured;

  // Local storage update if present
  const localListings = getLocalCustomListings();
  const targetIndex = localListings.findIndex((l) => l.id === id);
  if (targetIndex !== -1) {
    const existing = localListings[targetIndex];
    if (existing.owner_id !== ownerId && !ownerId.includes('demo-admin')) {
      console.error('Unauthorized: user is not the owner of this listing');
      return false;
    }
    const updatedImages = images
      ? images.map((img, idx) => ({
          id: `img-${id}-${idx}`,
          listing_id: id,
          url: img.url,
          storage_path: img.storage_path,
          is_primary: img.is_primary ?? idx === 0,
          order_index: img.order_index ?? idx,
        }))
      : existing.images;

    localListings[targetIndex] = {
      ...existing,
      ...safeUpdates,
      images: updatedImages,
      amenity_ids: amenityIds ?? existing.amenity_ids,
      updated_at: new Date().toISOString(),
    } as Listing;
    saveLocalCustomListings(localListings);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return true;

  try {
    const { error } = await client
      .from('listings')
      .update(safeUpdates)
      .eq('id', id)
      .eq('owner_id', ownerId);

    if (error) {
      console.error('Failed to update listing in Supabase:', error);
      return false;
    }

    if (images && images.length > 0) {
      await client.from('listing_images').delete().eq('listing_id', id);
      const imageRows = images.map((img, idx) => ({
        listing_id: id,
        url: img.url,
        storage_path: img.storage_path,
        is_primary: img.is_primary ?? idx === 0,
        order_index: img.order_index ?? idx,
      }));
      await client.from('listing_images').insert(imageRows);
    }

    if (amenityIds) {
      await client.from('listing_amenities').delete().eq('listing_id', id);
      const amenityRows = amenityIds.map((amenityId) => ({
        listing_id: id,
        amenity_id: amenityId,
      }));
      await client.from('listing_amenities').insert(amenityRows);
    }

    return true;
  } catch (err) {
    console.error('Error during listing update:', err);
    return false;
  }
}

/**
 * Deletes a listing
 */
export async function deleteListing(id: string, ownerId: string): Promise<boolean> {
  const localListings = getLocalCustomListings();
  const filtered = localListings.filter((l) => !(l.id === id && (l.owner_id === ownerId || ownerId.includes('demo-admin'))));
  saveLocalCustomListings(filtered);

  const client = getSupabaseBrowserClient();
  if (!client) return true;

  try {
    const { error } = await client
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId);

    if (error) {
      console.error('Failed to delete listing from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error during listing deletion:', err);
    return false;
  }
}

/**
 * Toggles a listing's status to 'rented' or back to 'pending'
 */
export async function toggleListingRented(id: string, ownerId: string, isRented: boolean): Promise<boolean> {
  const newStatus: ListingStatus = isRented ? 'rented' : 'pending';
  return updateListing(id, ownerId, { status: newStatus });
}


/**
 * Client-side filter helper for sample and local custom listings
 */
function filterSampleListings(items: Listing[], filters: ListingFilterState): Listing[] {
  return items.filter((item) => {
    // Only approved listings are shown publicly
    if (item.status !== 'approved') return false;

    if (filters.areaSlug && filters.areaSlug !== 'all') {
      const areaMatch =
        item.area_id === filters.areaSlug ||
        item.area_id.includes(filters.areaSlug) ||
        item.slug.includes(filters.areaSlug);
      if (!areaMatch) return false;
    }

    if (filters.propertyType && filters.propertyType !== 'all') {
      if (item.property_type !== filters.propertyType) return false;
    }

    if (filters.audience && filters.audience !== 'all') {
      if (item.audience !== filters.audience) return false;
    }

    if (filters.minRent !== undefined && filters.minRent > 0 && item.rent_monthly < filters.minRent) {
      return false;
    }

    if (filters.maxRent !== undefined && filters.maxRent > 0 && item.rent_monthly > filters.maxRent) {
      return false;
    }

    if (filters.bedrooms && filters.bedrooms !== 'all') {
      if (!item.bedrooms || item.bedrooms < Number(filters.bedrooms)) return false;
    }

    if (filters.bathrooms && filters.bathrooms !== 'all') {
      if (!item.bathrooms || item.bathrooms < Number(filters.bathrooms)) return false;
    }

    if (filters.isVerifiedOnly && !item.is_verified) return false;

    if (filters.isFeaturedOnly && !item.is_featured) return false;

    if (filters.amenities && filters.amenities.length > 0) {
      const itemAmenities = item.amenity_ids || [];
      const hasAllAmenities = filters.amenities.every((aId) => itemAmenities.includes(aId));
      if (!hasAllAmenities) return false;
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        item.title_bn.toLowerCase().includes(q) ||
        item.title_en.toLowerCase().includes(q) ||
        item.area_name_bn.toLowerCase().includes(q) ||
        item.area_name_en.toLowerCase().includes(q) ||
        item.address_street_bn.toLowerCase().includes(q) ||
        (item.address_street_en && item.address_street_en.toLowerCase().includes(q)) ||
        (item.landmark_bn && item.landmark_bn.toLowerCase().includes(q)) ||
        (item.description_bn && item.description_bn.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

function filterSampleListingsPaginated(
  filters: ListingFilterState,
  page: number = 1,
  pageSize: number = 12
): PaginatedListingsResult {
  const localListings = getLocalCustomListings();
  const allMerged = [...SAMPLE_LISTINGS, ...localListings];
  
  let filtered = filterSampleListings(allMerged, filters);

  // Sorting
  switch (filters.sortBy) {
    case 'rent_asc':
      filtered.sort((a, b) => a.rent_monthly - b.rent_monthly);
      break;
    case 'rent_desc':
      filtered.sort((a, b) => b.rent_monthly - a.rent_monthly);
      break;
    case 'popular':
      filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      break;
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize;
  const sliced = filtered.slice(from, from + pageSize);

  return {
    listings: sliced,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
