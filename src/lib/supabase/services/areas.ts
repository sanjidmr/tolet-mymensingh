import { getSupabaseBrowserClient } from '../client';
import { Area } from '../../../types';
import { MYMENSINGH_AREAS } from '../../../data/mymensingh-locations';

/**
 * Fetches all Mymensingh areas from Supabase database.
 * Falls back gracefully to local static dataset if database is not connected.
 */
export async function fetchAreas(): Promise<Area[]> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return MYMENSINGH_AREAS;
  }

  try {
    const { data, error } = await client
      .from('areas')
      .select('*')
      .order('is_popular', { ascending: false })
      .order('name_en', { ascending: true });

    if (error || !data || data.length === 0) {
      return MYMENSINGH_AREAS;
    }

    return data.map((item) => ({
      id: item.id,
      name_en: item.name_en,
      name_bn: item.name_bn,
      slug: item.slug,
      description_bn: item.description_bn || undefined,
      description_en: item.description_en || undefined,
      is_popular: item.is_popular,
      listing_count: item.listing_count,
    }));
  } catch (err) {
    console.warn('Could not fetch areas from Supabase, using local catalog:', err);
    return MYMENSINGH_AREAS;
  }
}
