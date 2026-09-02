-- ==============================================================================
-- ToLet Mymensingh Database Migration: 00001_create_schema.sql
-- Description: Core Schema, Enums, Tables, Relationships, Triggers & Indexes
-- ==============================================================================

-- 1. PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom PostgreSQL ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('tenant', 'owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'rented', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('apartment', 'room', 'sublet', 'mess', 'hostel', 'seat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE target_audience AS ENUM ('family', 'bachelor', 'student', 'male', 'female', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE amenity_category AS ENUM ('core', 'comfort', 'security', 'meal_service');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM ('fake_listing', 'wrong_phone', 'already_rented', 'scam', 'incorrect_info', 'inappropriate_content');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Utility Trigger Function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. User Profiles Table (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    role user_role DEFAULT 'tenant'::user_role NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    whatsapp_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 5. Areas Table (Mymensingh Municipal Neighborhoods & Hubs)
CREATE TABLE IF NOT EXISTS public.areas (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_bn TEXT,
    description_en TEXT,
    is_popular BOOLEAN DEFAULT false NOT NULL,
    listing_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for areas updated_at
DROP TRIGGER IF EXISTS trg_areas_updated_at ON public.areas;
CREATE TRIGGER trg_areas_updated_at
    BEFORE UPDATE ON public.areas
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 6. Amenities Table
CREATE TABLE IF NOT EXISTS public.amenities (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    category amenity_category DEFAULT 'core'::amenity_category NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Listings Table (Rental Properties & Accommodations)
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title_bn TEXT NOT NULL,
    title_en TEXT,
    slug TEXT UNIQUE NOT NULL,
    description_bn TEXT NOT NULL,
    description_en TEXT,
    property_type property_type NOT NULL,
    audience target_audience NOT NULL,
    status listing_status DEFAULT 'pending'::listing_status NOT NULL,
    
    -- Pricing
    rent_monthly INTEGER NOT NULL CHECK (rent_monthly > 0),
    security_deposit INTEGER DEFAULT 0 CHECK (security_deposit >= 0),
    is_negotiable BOOLEAN DEFAULT false NOT NULL,
    service_charge INTEGER DEFAULT 0 CHECK (service_charge >= 0),
    gas_bill_included BOOLEAN DEFAULT false NOT NULL,
    electricity_bill_included BOOLEAN DEFAULT false NOT NULL,
    water_bill_included BOOLEAN DEFAULT true NOT NULL,

    -- Specs & Measurements
    bedrooms INTEGER CHECK (bedrooms >= 0),
    bathrooms INTEGER CHECK (bathrooms >= 0),
    balconies INTEGER CHECK (balconies >= 0),
    floor_number INTEGER CHECK (floor_number >= 0),
    total_floors INTEGER CHECK (total_floors >= 1),
    area_sqft INTEGER CHECK (area_sqft > 0),
    seat_count INTEGER CHECK (seat_count > 0),

    -- Location
    area_id TEXT NOT NULL REFERENCES public.areas(id) ON DELETE RESTRICT,
    address_street_bn TEXT NOT NULL,
    address_street_en TEXT,
    landmark_bn TEXT,
    landmark_en TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    -- Contacts
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_whatsapp TEXT,
    hide_exact_phone BOOLEAN DEFAULT false NOT NULL,

    -- Marketplace Badges & Metrics
    is_verified BOOLEAN DEFAULT false NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    views_count INTEGER DEFAULT 0 NOT NULL,
    available_from TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for listings updated_at
DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 8. Listing Images Table
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Listing Amenities Join Table
CREATE TABLE IF NOT EXISTS public.listing_amenities (
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    amenity_id TEXT NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (listing_id, amenity_id)
);

-- 10. User Favorites Table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, listing_id)
);

-- 11. Listing Reports Table (User moderation flags)
CREATE TABLE IF NOT EXISTS public.listing_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason report_reason NOT NULL,
    comment TEXT,
    status report_status DEFAULT 'pending'::report_status NOT NULL,
    moderator_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for listing_reports updated_at
DROP TRIGGER IF EXISTS trg_listing_reports_updated_at ON public.listing_reports;
CREATE TRIGGER trg_listing_reports_updated_at
    BEFORE UPDATE ON public.listing_reports
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 12. Saved Searches Table (For tenant alert notifications)
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 13. High-Performance Query Indexes
-- ==============================================================================

-- Listings Filters & Feeds
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_area_id ON public.listings(area_id);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON public.listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_audience ON public.listings(audience);
CREATE INDEX IF NOT EXISTS idx_listings_rent_monthly ON public.listings(rent_monthly);
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_featured_approved ON public.listings(is_featured, created_at DESC) WHERE status = 'approved';

-- Images & Amenities
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id, order_index);
CREATE INDEX IF NOT EXISTS idx_listing_amenities_listing_id ON public.listing_amenities(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_amenities_amenity_id ON public.listing_amenities(amenity_id);

-- User Relations & Moderation
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_listing_id ON public.user_favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status);
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON public.listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
