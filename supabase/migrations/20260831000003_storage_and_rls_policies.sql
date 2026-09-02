-- ==============================================================================
-- ToLet Mymensingh Database Migration: 00003_storage_and_rls_policies.sql
-- Description: Row Level Security (RLS) Policies, Admin Role Checks & Storage Buckets
-- ==============================================================================

-- 1. Helper Function to Check Admin Privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'::user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Automatically Create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, phone, name, email, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '01700000000'),
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'tenant'::user_role),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = CASE WHEN profiles.name = 'User' THEN EXCLUDED.name ELSE profiles.name END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. Enable Row Level Security (RLS) on all public tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 4. RLS Policies: Profiles
-- ==============================================================================

-- Anyone can view public profile details of listing landlords/contacts
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile; Admins can update any profile
CREATE POLICY "Users can update own profile or admins can update any"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- ==============================================================================
-- 5. RLS Policies: Areas & Amenities (Catalog Data)
-- ==============================================================================

-- Public can view all areas
CREATE POLICY "Areas are viewable by everyone"
    ON public.areas
    FOR SELECT
    USING (true);

-- Only admins can modify areas
CREATE POLICY "Admins can manage areas"
    ON public.areas
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Public can view all amenities
CREATE POLICY "Amenities are viewable by everyone"
    ON public.amenities
    FOR SELECT
    USING (true);

-- Only admins can modify amenities
CREATE POLICY "Admins can manage amenities"
    ON public.amenities
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. RLS Policies: Listings
-- ==============================================================================

-- SELECT Policy:
-- 1. Anyone (anonymous + authenticated) can view approved listings
-- 2. Property owners can view their own listings in any state (draft, pending, rejected, etc.)
-- 3. Admins can view all listings across all states
CREATE POLICY "Public approved listings, owner listings, or admin view"
    ON public.listings
    FOR SELECT
    USING (
        status = 'approved'::listing_status
        OR (auth.uid() IS NOT NULL AND owner_id = auth.uid())
        OR public.is_admin()
    );

-- INSERT Policy:
-- Authenticated users can post listings as the owner
CREATE POLICY "Authenticated users can create their own listings"
    ON public.listings
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND owner_id = auth.uid()
    );

-- UPDATE Policy:
-- 1. Owners can update their own listings (e.g. details, price, status to rented/draft)
-- 2. Admins can update any listing (e.g. moderate status, verify, feature)
CREATE POLICY "Owners can update own listings or admins can update all"
    ON public.listings
    FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL AND owner_id = auth.uid())
        OR public.is_admin()
    )
    WITH CHECK (
        (auth.uid() IS NOT NULL AND owner_id = auth.uid())
        OR public.is_admin()
    );

-- DELETE Policy:
-- Owners can delete their own listings; Admins can delete any listing
CREATE POLICY "Owners can delete own listings or admins can delete all"
    ON public.listings
    FOR DELETE
    USING (
        (auth.uid() IS NOT NULL AND owner_id = auth.uid())
        OR public.is_admin()
    );

-- ==============================================================================
-- 7. RLS Policies: Listing Images
-- ==============================================================================

-- SELECT: Public can view images of approved listings; Owners can view images of their listings; Admins view all
CREATE POLICY "Listing images viewable for approved or owned listings"
    ON public.listing_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_images.listing_id
            AND (
                l.status = 'approved'::listing_status
                OR (auth.uid() IS NOT NULL AND l.owner_id = auth.uid())
                OR public.is_admin()
            )
        )
    );

-- INSERT: Property owners can attach images to their listings; Admins can attach
CREATE POLICY "Listing owners or admins can insert images"
    ON public.listing_images
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_images.listing_id
            AND (
                (auth.uid() IS NOT NULL AND l.owner_id = auth.uid())
                OR public.is_admin()
            )
        )
    );

-- UPDATE: Listing owners or Admins
CREATE POLICY "Listing owners or admins can update images"
    ON public.listing_images
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_images.listing_id
            AND (
                (auth.uid() IS NOT NULL AND l.owner_id = auth.uid())
                OR public.is_admin()
            )
        )
    );

-- DELETE: Listing owners or Admins
CREATE POLICY "Listing owners or admins can delete images"
    ON public.listing_images
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_images.listing_id
            AND (
                (auth.uid() IS NOT NULL AND l.owner_id = auth.uid())
                OR public.is_admin()
            )
        )
    );

-- ==============================================================================
-- 8. RLS Policies: Listing Amenities
-- ==============================================================================

CREATE POLICY "Listing amenities viewable for approved or owned listings"
    ON public.listing_amenities
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_amenities.listing_id
            AND (
                l.status = 'approved'::listing_status
                OR (auth.uid() IS NOT NULL AND l.owner_id = auth.uid())
                OR public.is_admin()
            )
        )
    );

CREATE POLICY "Listing owners or admins can manage amenities"
    ON public.listing_amenities
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_amenities.listing_id
            AND (
                (auth.uid() IS NOT NULL AND l.owner_id = auth.uid())
                OR public.is_admin()
            )
        )
    );

-- ==============================================================================
-- 9. RLS Policies: User Favorites
-- ==============================================================================

-- SELECT: Users can only see their own favorites; Admins can see all
CREATE POLICY "Users can view their own favorites"
    ON public.user_favorites
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR public.is_admin()
    );

-- INSERT: Authenticated users can favorite listings
CREATE POLICY "Users can insert their own favorites"
    ON public.user_favorites
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND user_id = auth.uid()
    );

-- DELETE: Authenticated users can remove their favorites
CREATE POLICY "Users can delete their own favorites"
    ON public.user_favorites
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND user_id = auth.uid()
    );

-- ==============================================================================
-- 10. RLS Policies: Listing Reports (Moderation Flags)
-- ==============================================================================

-- SELECT: Reporter can view their own submitted reports; Admins can view all reports
CREATE POLICY "Reporters can view own reports or admins can view all"
    ON public.listing_reports
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND reporter_id = auth.uid())
        OR public.is_admin()
    );

-- INSERT: Anyone (logged in or anonymous) can submit a listing report
CREATE POLICY "Anyone can submit a listing report"
    ON public.listing_reports
    FOR INSERT
    WITH CHECK (
        (reporter_id IS NULL)
        OR (auth.uid() IS NOT NULL AND reporter_id = auth.uid())
    );

-- UPDATE: Only Admins can moderate/update reports (status, notes, resolution)
CREATE POLICY "Only admins can update reports"
    ON public.listing_reports
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- DELETE: Only Admins can delete reports
CREATE POLICY "Only admins can delete reports"
    ON public.listing_reports
    FOR DELETE
    USING (public.is_admin());

-- ==============================================================================
-- 11. RLS Policies: Saved Searches
-- ==============================================================================

CREATE POLICY "Users can manage their own saved searches"
    ON public.saved_searches
    FOR ALL
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ==============================================================================
-- 12. Supabase Storage: Listing Images Bucket & Storage Policies
-- ==============================================================================

-- Insert 'listing-images' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    true,
    10485760, -- 10MB limit per image
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

-- Storage Object Policies for 'listing-images' bucket:

-- 1. Public Read Access
CREATE POLICY "Listing images are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'listing-images');

-- 2. Authenticated Users can upload listing images
CREATE POLICY "Authenticated users can upload listing images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'listing-images'
        AND auth.role() = 'authenticated'
    );

-- 3. Users can update and delete their own uploaded images (or Admin)
CREATE POLICY "Users can update their own listing images or admin"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'listing-images'
        AND (
            (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
            OR public.is_admin()
        )
    );

CREATE POLICY "Users can delete their own listing images or admin"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'listing-images'
        AND (
            (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
            OR public.is_admin()
        )
    );
