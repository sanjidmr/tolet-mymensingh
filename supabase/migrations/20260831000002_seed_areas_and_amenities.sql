-- ==============================================================================
-- ToLet Mymensingh Database Migration: 00002_seed_areas_and_amenities.sql
-- Description: Seed initial Mymensingh localities and amenity definitions
-- ==============================================================================

-- 1. Seed Mymensingh Localities
INSERT INTO public.areas (id, name_en, name_bn, slug, description_bn, description_en, is_popular, listing_count)
VALUES
    (
        'area-maskanda',
        'Maskanda',
        'মাসকান্দা',
        'maskanda',
        'বাস টার্মিনাল ও মেডিকেল রোডের কাছাকাছি জনপ্রিয় আবাসিক এলাকা।',
        'Close to bus terminal and medical college road, popular residential zone.',
        true,
        42
    ),
    (
        'area-charpara',
        'Charpara',
        'চরপাড়া',
        'charpara',
        'ময়মনসিংহ মেডিকেল কলেজ সংলগ্ন অত্যন্ত ব্যস্ত ও শিক্ষার্থীদের প্রিয় এলাকা।',
        'Near Mymensingh Medical College, vibrant student & doctor hub.',
        true,
        58
    ),
    (
        'area-ganginarpar',
        'Ganginarpar',
        'গাঙ্গিনারপাড়',
        'ganginarpar',
        'শহরের প্রাণকেন্দ্র, শপিংমল ও বাণিজ্যিক এলাকার কাছাকাছি।',
        'The prime commercial heart of Mymensingh city with markets and offices.',
        true,
        31
    ),
    (
        'area-town-hall',
        'Town Hall Mor',
        'টাউন হল মোড়',
        'town-hall',
        'সাংস্কৃতিক কেন্দ্রবিন্দু, জিলা স্কুল ও কোর্ট চত্বরের নিকটে।',
        'Cultural center, close to Zilla School and administrative zone.',
        true,
        24
    ),
    (
        'area-notun-bazar',
        'Notun Bazar',
        'নতুন বাজার',
        'notun-bazar',
        'পরিবার ও মেস উভয়ের জন্য সুবিধাজনক চমৎকার যোগাযোগ ব্যবস্থা।',
        'Great connectivity, ideal for families and students alike.',
        true,
        36
    ),
    (
        'area-sankipara',
        'Sankipara',
        'সংকিপাড়া',
        'sankipara',
        'শান্ত ও নিরিবিলি আবাসিক পরিবেশ, রেলওয়ে স্টেশনের কাছে।',
        'Quiet residential neighborhood, easy reach to railway station.',
        true,
        29
    ),
    (
        'area-keshob-mor',
        'Keshob Mor',
        'কেশব মোড়',
        'keshob-mor',
        'আনন্দ মোহন কলেজ সংলগ্ন শিক্ষার্থীদের মেস ও সাবলেটের সেরা জায়গা।',
        'Near Ananda Mohan College, top spot for student messes and sublets.',
        true,
        45
    ),
    (
        'area-bau',
        'BAU Campus / Sesh Mor',
        'বাকৃবি ক্যাম্পাস / শেষ মোড়',
        'bau-campus',
        'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় সংলগ্ন সবুজ ও প্রাকৃতিক মনোরম পরিবেশ।',
        'Bangladesh Agricultural University vicinity, scenic green surroundings.',
        true,
        38
    ),
    (
        'area-akua',
        'Akua',
        'আকুয়া',
        'akua',
        'বাইপাস রোড ও ঢাকা-ময়মনসিংহ হাইওয়ের কাছাকাছি বিস্তৃত এলাকা।',
        'Near the bypass and Dhaka highway, developing modern residential sector.',
        false,
        19
    ),
    (
        'area-boundary-road',
        'Boundary Road',
        'বাউন্ডারি রোড',
        'boundary-road',
        'অভিজাত ও পরিষ্কার-পরিচ্ছন্ন পরিবারবান্ধব আবাসিক এলাকা।',
        'Upscale, peaceful, and family-friendly residential boulevard.',
        true,
        22
    ),
    (
        'area-gohailkandi',
        'Gohailkandi',
        'গোহাইলকান্দি',
        'gohailkandi',
        'সার্কিট হাউস ও পার্কের নিকটবর্তী শান্ত আবাসিক এলাকা।',
        'Near Circuit House and park areas, quiet green living.',
        false,
        14
    ),
    (
        'area-krishtopur',
        'Krishtopur',
        'খ্রিষ্টপুর',
        'krishtopur',
        'রেলওয়ে স্টেশন ও নাহার প্লাজার পাশে সাশ্রয়ী ভাড়ার এলাকা।',
        'Affordable rentals near the railway station and Nahar Plaza.',
        false,
        16
    )
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    slug = EXCLUDED.slug,
    description_bn = EXCLUDED.description_bn,
    description_en = EXCLUDED.description_en,
    is_popular = EXCLUDED.is_popular,
    listing_count = EXCLUDED.listing_count;

-- 2. Seed Amenities Catalog
INSERT INTO public.amenities (id, name_en, name_bn, icon_name, category)
VALUES
    ('amenity-gas', 'Titas Gas / LPG Gas', 'গ্যাস সংযোগ / সিলিন্ডার', 'Flame', 'core'),
    ('amenity-generator', 'Generator / IPS Backup', 'জেনারেটর / আইপিএস ব্যাকআপ', 'Zap', 'core'),
    ('amenity-lift', 'Elevator / Lift', 'লিফট / এলিভেটর', 'ArrowUpDown', 'comfort'),
    ('amenity-wifi', 'High Speed Wi-Fi', 'উচ্চগতির ওয়াইফাই', 'Wifi', 'comfort'),
    ('amenity-security', '24/7 Security Guard', '২৪ ঘণ্টা সিকিউরিটি গার্ড', 'ShieldCheck', 'security'),
    ('amenity-cctv', 'CCTV Surveillance', 'সিসিটিভি ক্যামেরা নিরাপত্তা', 'Video', 'security'),
    ('amenity-parking', 'Car & Bike Parking', 'গাড়ি ও বাইক পার্কিং', 'Car', 'comfort'),
    ('amenity-balcony', 'South-facing Balcony', 'খোলামেলা বারান্দা', 'Sun', 'comfort'),
    ('amenity-attached-bath', 'Attached Bathroom', 'অ্যাটাচড বাথরুম', 'Bath', 'core'),
    ('amenity-meal', 'Mess Meal System', 'মেস মিল / খালা ব্যবস্থা', 'Utensils', 'meal_service'),
    ('amenity-water-filter', 'Pure Drinking Water Filter', 'বিশুদ্ধ খাবার পানির ফিল্টার', 'Droplets', 'core'),
    ('amenity-geyser', 'Geyser / Hot Water', 'গিজার / গরম পানি', 'Sparkles', 'comfort')
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    icon_name = EXCLUDED.icon_name,
    category = EXCLUDED.category;
