import { getSupabaseBrowserClient } from '../client';
import { Amenity } from '../../../types';
import { AMENITIES_LIST } from '../../../data/amenities';

/**
 * Fetches all available amenities from Supabase.
 * Falls back gracefully to local catalog if not connected.
 */
export async function fetchAmenities(): Promise<Amenity[]> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return AMENITIES_LIST;
  }

  try {
    const { data, error } = await client
      .from('amenities')
      .select('*')
      .order('category', { ascending: true });

    if (error || !data || data.length === 0) {
      return AMENITIES_LIST;
    }

    return data.map((item) => ({
      id: item.id,
      name_en: item.name_en,
      name_bn: item.name_bn,
      icon_name: item.icon_name,
      category: item.category as Amenity['category'],
    }));
  } catch (err) {
    console.warn('Could not fetch amenities from Supabase, using local catalog:', err);
    return AMENITIES_LIST;
  }
}
