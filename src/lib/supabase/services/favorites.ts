import { getSupabaseBrowserClient } from '../client';
import { Listing } from '../../../types';
import { mapDatabaseListingToUiListing, fetchListingById } from './listings';
import { SAMPLE_LISTINGS } from '../../../data/sample-listings';

/**
 * Fetches the list of listing IDs favorited by a user.
 * Strictly queries the 'user_favorites' table protected by RLS (user_id = auth.uid()).
 */
export async function fetchUserFavoriteIds(userId: string): Promise<string[]> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client
      .from('user_favorites')
      .select('listing_id')
      .eq('user_id', userId);

    if (error || !data) {
      console.error('Error fetching favorite IDs:', error);
      return [];
    }

    return data.map((row: any) => row.listing_id);
  } catch (err) {
    console.error('Error in fetchUserFavoriteIds:', err);
    return [];
  }
}

/**
 * Fetches full listings favorited by a user.
 * Strictly queries the 'user_favorites' table protected by RLS (user_id = auth.uid()).
 */
export async function fetchUserFavoriteListings(userId: string): Promise<Listing[]> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client
      .from('user_favorites')
      .select(`
        listing_id,
        listings (
          *,
          areas ( name_bn, name_en ),
          profiles ( name, avatar_url, is_verified ),
          listing_images ( id, listing_id, url, storage_path, is_primary, order_index ),
          listing_amenities ( amenity_id )
        )
      `)
      .eq('user_id', userId);

    if (error || !data) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return data
      .filter((row: any) => row.listings !== null)
      .map((row: any) =>
        mapDatabaseListingToUiListing(
          row.listings,
          row.listings.listing_images || [],
          row.listings.listing_amenities?.map((a: any) => a.amenity_id) || [],
          row.listings.areas,
          row.listings.profiles
        )
      );
  } catch (err) {
    console.error('Error fetching favorite listings:', err);
    return [];
  }
}

/**
 * Fetches listings matching a list of IDs (supports guest favorites and offline cache)
 */
export async function fetchFavoriteListingsByIds(listingIds: string[]): Promise<Listing[]> {
  if (!listingIds || listingIds.length === 0) return [];

  const client = getSupabaseBrowserClient();
  if (!client) {
    return SAMPLE_LISTINGS.filter((l) => listingIds.includes(l.id));
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
      .in('id', listingIds);

    if (error || !data || data.length === 0) {
      return SAMPLE_LISTINGS.filter((l) => listingIds.includes(l.id));
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

    // Also include any local sample listings if present
    const fetchedIds = new Set(fetched.map((f) => f.id));
    const sampleMatches = SAMPLE_LISTINGS.filter(
      (s) => listingIds.includes(s.id) && !fetchedIds.has(s.id)
    );

    return [...fetched, ...sampleMatches];
  } catch (err) {
    console.error('Error fetching listings by IDs:', err);
    return SAMPLE_LISTINGS.filter((l) => listingIds.includes(l.id));
  }
}

/**
 * Adds a listing to user favorites
 */
export async function addUserFavorite(userId: string, listingId: string): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) return true; // Local simulation succeeds

  const { error } = await client.from('user_favorites').insert({
    user_id: userId,
    listing_id: listingId,
  });

  if (error && error.code !== '23505') { // 23505 is unique violation (already favorited)
    console.error('Error adding favorite:', error);
    return false;
  }
  return true;
}

/**
 * Removes a listing from user favorites
 */
export async function removeUserFavorite(userId: string, listingId: string): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) return true; // Local simulation succeeds

  const { error } = await client
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
  return true;
}

/**
 * Synchronizes locally saved guest favorites into an authenticated user's database records.
 */
export async function syncLocalFavoritesToUser(userId: string, localIds: string[]): Promise<string[]> {
  if (!userId || !localIds || localIds.length === 0) return [];
  const client = getSupabaseBrowserClient();
  if (!client) return localIds;

  try {
    // 1. Fetch existing user favorites
    const dbIds = await fetchUserFavoriteIds(userId);
    const dbIdSet = new Set(dbIds);

    // 2. Identify new IDs to insert
    const idsToInsert = localIds.filter((id) => !dbIdSet.has(id));

    if (idsToInsert.length > 0) {
      const rows = idsToInsert.map((listingId) => ({
        user_id: userId,
        listing_id: listingId,
      }));

      await client.from('user_favorites').insert(rows, { defaultToNull: true });
    }

    // 3. Return all combined IDs
    return Array.from(new Set([...dbIds, ...localIds]));
  } catch (err) {
    console.error('Error syncing local favorites to user account:', err);
    return localIds;
  }
}

