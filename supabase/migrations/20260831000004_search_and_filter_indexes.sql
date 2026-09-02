-- Migration: Search & Filter Performance Indexes for ToLet Mymensingh
-- Optimizes query performance on public listings explorer with multi-parameter filters and sorting.

-- 1. Composite index on status + created_at for fast default sorting of approved listings
CREATE INDEX IF NOT EXISTS idx_listings_approved_created_at 
ON public.listings (status, created_at DESC) 
WHERE status = 'approved';

-- 2. Composite index on status + rent_monthly for budget range queries and rent sorting
CREATE INDEX IF NOT EXISTS idx_listings_approved_rent 
ON public.listings (status, rent_monthly ASC) 
WHERE status = 'approved';

-- 3. Composite index on status + views_count for popular sorting
CREATE INDEX IF NOT EXISTS idx_listings_approved_views 
ON public.listings (status, views_count DESC) 
WHERE status = 'approved';

-- 4. Composite index on status + area_id + property_type + audience for quick faceted lookups
CREATE INDEX IF NOT EXISTS idx_listings_approved_area_type_aud 
ON public.listings (status, area_id, property_type, audience) 
WHERE status = 'approved';

-- 5. Composite index on status + bedrooms + bathrooms for room capacity filtering
CREATE INDEX IF NOT EXISTS idx_listings_approved_rooms 
ON public.listings (status, bedrooms, bathrooms) 
WHERE status = 'approved';

-- 6. Full Text Search index for Bengali and English listing search terms
CREATE INDEX IF NOT EXISTS idx_listings_fts_search 
ON public.listings USING gin (
    to_tsvector('simple', coalesce(title_bn, '') || ' ' || coalesce(title_en, '') || ' ' || coalesce(address_street_bn, '') || ' ' || coalesce(landmark_bn, ''))
);
