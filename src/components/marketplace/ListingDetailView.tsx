import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Layers, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Zap,
  Droplets,
  ArrowUpDown,
  Wifi,
  Video,
  Car,
  Sun,
  Utensils,
  UserCheck,
  Building,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Listing, Area } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Container } from '../layout/Container';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { ListingCard } from './ListingCard';
import { ReportListingModal } from './ReportListingModal';
import { fetchListingBySlug, fetchPublicListings } from '../../lib/supabase/services/listings';
import { AMENITIES_LIST } from '../../data/amenities';
import { useSEO } from '../../lib/useSEO';
import { buildListingStructuredData } from '../../lib/seo';

interface ListingDetailViewProps {
  slugOrId: string;
  categoryPrefix?: 'tolet' | 'mess' | 'hostel';
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const ListingDetailView: React.FC<ListingDetailViewProps> = ({
  slugOrId,
  categoryPrefix = 'tolet',
  onNavigate,
  favorites = [],
  onToggleFavorite,
}) => {
  const { language, t } = useLanguage();

  const [listing, setListing] = useState<Listing | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Load listing by slug/ID from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadListingData() {
      setIsLoading(true);
      try {
        const fetched = await fetchListingBySlug(slugOrId);
        if (isMounted && fetched) {
          // If status is not approved, we should only display if owner/admin or show notice
          setListing(fetched);
          setSelectedImageIndex(0);

          // Fetch similar listings (same area or property type, approved only)
          const allApproved = await fetchPublicListings({
            propertyType: fetched.property_type,
          });

          if (isMounted) {
            const filteredSimilar = allApproved
              .filter((item) => item.id !== fetched.id && item.status === 'approved')
              .slice(0, 3);
            setSimilarListings(filteredSimilar);
          }
        }
      } catch (err) {
        console.error('Failed to load listing detail:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadListingData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  const isFavorite = listing ? favorites.includes(listing.id) : false;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title_bn || 'ToLet Mymensingh Listing',
          text: `Check out this rental property in Mymensingh: ${listing?.title_bn}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // Fallback
    }
  };

  // WhatsApp formatted message link
  const getWhatsAppLink = (phone: string, title: string, rent: number) => {
    let cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = `88${cleanPhone}`;
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1);
    }

    const message = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি ToLet Mymensingh এ আপনার বিজ্ঞাপিত বাসাটি দেখেছি:\n\n*${title}*\nমাসিক ভাড়া: ৳${rent}\nলিংক: ${window.location.href}\n\nবাসাটি কি এখনো খালি আছে? আমি বিস্তারিত জানতে ও দেখতে চাচ্ছি।`
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="h-4 w-4 text-amber-600" />;
      case 'Zap': return <Zap className="h-4 w-4 text-amber-500" />;
      case 'ArrowUpDown': return <ArrowUpDown className="h-4 w-4 text-emerald-600" />;
      case 'Wifi': return <Wifi className="h-4 w-4 text-sky-500" />;
      case 'ShieldCheck': return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      case 'Video': return <Video className="h-4 w-4 text-indigo-500" />;
      case 'Car': return <Car className="h-4 w-4 text-blue-600" />;
      case 'Sun': return <Sun className="h-4 w-4 text-amber-500" />;
      case 'Bath': return <Bath className="h-4 w-4 text-teal-600" />;
      case 'Utensils': return <Utensils className="h-4 w-4 text-rose-500" />;
      case 'Droplets': return <Droplets className="h-4 w-4 text-cyan-600" />;
      default: return <Sparkles className="h-4 w-4 text-emerald-600" />;
    }
  };

  const title = listing ? (language === 'bn' ? listing.title_bn : (listing.title_en || listing.title_bn)) : '';
  const areaName = listing ? (language === 'bn' ? listing.area_name_bn : listing.area_name_en) : '';

  const canonicalUrl = listing
    ? `https://toletmymensingh.com/${categoryPrefix}/${listing.slug || listing.id}`
    : `https://toletmymensingh.com/${categoryPrefix}`;

  const seoTitle = listing
    ? `${title} — ${areaName} | ৳${listing.rent_monthly}/মাস`
    : isLoading
    ? 'বিজ্ঞাপন লোড হচ্ছে...'
    : 'বিজ্ঞাপনটি পাওয়া যায়নি';

  const seoDescription = listing
    ? `${title}। এলাকা: ${areaName}, ময়মনসিংহ। মাসিক ভাড়া: ৳${listing.rent_monthly} (${listing.is_negotiable ? 'আলোচনা সাপেক্ষে' : 'ফিক্সড'})। ${listing.property_type === 'apartment' ? 'ফ্ল্যাট বাসা' : listing.property_type === 'mess' ? 'মেস সিট' : listing.property_type === 'hostel' ? 'হোস্টেল' : 'সাবলেট'}। ${listing.description_bn.slice(0, 130)}...`
    : 'ময়মনসিংহের বিশ্বস্ত ও আধুনিক রেন্টাল মার্কেটপ্লেস — বাসা, মেস ও হোস্টেল খোঁজার সহজ প্ল্যাটফর্ম।';

  const seoKeywords = listing
    ? [
        `${listing.area_name_bn} বাসা ভাড়া`,
        `${listing.area_name_en} house rent`,
        `ময়মনসিংহ ${listing.property_type === 'mess' ? 'মেস' : listing.property_type === 'hostel' ? 'হোস্টেল' : 'বাসা ভাড়া'}`,
        `${listing.area_name_en} ${listing.property_type}`,
        `Mymensingh ${listing.audience} ${listing.property_type}`,
        'ময়মনসিংহ বাসা ভাড়া',
        'Mymensingh house rent',
        'ToLet Mymensingh',
      ]
    : undefined;

  const structuredData = listing ? buildListingStructuredData(listing, canonicalUrl) : undefined;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    canonicalUrl,
    keywords: seoKeywords,
    ogType: 'article',
    ogImage: listing?.images?.[0]?.url || undefined,
    noIndex: !listing && !isLoading,
    structuredData,
  });

  if (isLoading) {
    return (
      <div className="py-8 bg-stone-50/50 min-h-screen">
        <Container>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <Skeleton className="aspect-16/10 w-full rounded-2xl" />
                <div className="flex gap-3">
                  <Skeleton className="h-20 w-24 rounded-xl" />
                  <Skeleton className="h-20 w-24 rounded-xl" />
                  <Skeleton className="h-20 w-24 rounded-xl" />
                </div>
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="py-16 bg-stone-50 min-h-[60vh] flex items-center">
        <Container className="text-center max-w-md">
          <div className="h-16 w-16 bg-stone-200 text-stone-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            {language === 'bn' ? 'বিজ্ঞাপনটি খুঁজে পাওয়া যায়নি' : 'Listing Not Found'}
          </h2>
          <p className="text-stone-600 text-xs mb-6">
            {language === 'bn' 
              ? 'হয়তো বিজ্ঞাপনটি মুছে ফেলা হয়েছে অথবা এখনো অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে।' 
              : 'The listing may have been removed or is awaiting moderation approval.'}
          </p>
          <Button
            onClick={() => onNavigate(categoryPrefix)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'অন্যান্য বিজ্ঞাপন দেখুন' : 'Browse Available Listings'}
          </Button>
        </Container>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : [
    {
      id: 'default-img',
      listing_id: listing.id,
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      storage_path: 'default.jpg',
      is_primary: true,
      order_index: 0
    }
  ];

  const currentImage = images[selectedImageIndex] || images[0];

  const audienceLabel = {
    family: t.family,
    bachelor: t.bachelor,
    student: t.student,
    female: t.femaleOnly,
    male: t.maleOnly,
    mixed: t.mixed,
  }[listing.audience] || listing.audience;

  const propertyTypeLabel = {
    apartment: t.apartment,
    room: t.room,
    sublet: t.sublet,
    mess: t.mess,
    hostel: t.hostel,
    seat: t.seat,
  }[listing.property_type] || listing.property_type;

  const matchingAmenities = AMENITIES_LIST.filter(a => listing.amenity_ids?.includes(a.id));

  return (
    <article className="py-6 sm:py-10 bg-stone-50/60 min-h-screen pb-24 sm:pb-12">
      <Container>
        
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                onNavigate(categoryPrefix);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === 'bn' ? 'তালিকায় ফিরে যান' : 'Back to Listings'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-all cursor-pointer"
              title="Share property"
            >
              <Share2 className="h-3.5 w-3.5 text-stone-500" />
              <span>{copySuccess ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'শেয়ার' : 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(listing.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
              <span>{isFavorite ? (language === 'bn' ? 'পছন্দে সংরক্ষিত' : 'Saved') : (language === 'bn' ? 'সংরক্ষণ' : 'Save')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 text-stone-500 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
              title={t.reportListing}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{language === 'bn' ? 'রিপোর্ট' : 'Report'}</span>
            </button>
          </div>
        </nav>

        {/* Main Listing Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Media & Core Details */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {/* 1. Image Gallery */}
            <div className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/80 shadow-xs space-y-3">
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-stone-900 cursor-zoom-in group select-none"
              >
                <img
                  src={currentImage.url}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                />

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <Badge className="bg-stone-900/80 backdrop-blur-md text-white font-medium text-xs border-0">
                    {propertyTypeLabel}
                  </Badge>
                  {listing.is_verified && (
                    <Badge variant="verified" className="flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t.verified}</span>
                    </Badge>
                  )}
                  {listing.is_featured && (
                    <Badge variant="featured" className="flex items-center gap-1 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
                      <span>{t.featured}</span>
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                    📷 {selectedImageIndex + 1} / {images.length}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImageIndex === idx ? 'border-emerald-600 shadow-sm scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Main Title, Location & Quick Badges */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  👥 {audienceLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                  📅 {language === 'bn' ? `বরাদ্দ: ${listing.available_from}` : `Available: ${listing.available_from}`}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-50 text-stone-500">
                  👁️ {listing.views_count || 1} {language === 'bn' ? 'বার দেখা হয়েছে' : 'views'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
                {title}
              </h1>

              <div className="flex items-start gap-2 text-stone-600 text-sm">
                <MapPin className="h-4 w-4 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-800">{areaName}</span>
                  <span className="mx-1">•</span>
                  <span>{language === 'bn' ? listing.address_street_bn : (listing.address_street_en || listing.address_street_bn)}</span>
                  {listing.landmark_bn && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      📍 {language === 'bn' ? `নিকটস্থ ল্যান্ডমার্ক: ${listing.landmark_bn}` : `Landmark: ${listing.landmark_en || listing.landmark_bn}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-100">
                {listing.property_type === 'mess' || listing.property_type === 'seat' ? (
                  <>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Bed className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{t.seat}</span>
                      <span className="text-base font-bold text-stone-800">
                        {language === 'bn' ? toBengaliNumber(listing.seat_count || 1) : (listing.seat_count || 1)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Bath className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{t.bathrooms}</span>
                      <span className="text-base font-bold text-stone-800">
                        {language === 'bn' ? toBengaliNumber(listing.bathrooms || 1) : (listing.bathrooms || 1)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Layers className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{t.floor}</span>
                      <span className="text-base font-bold text-stone-800">
                        {language === 'bn' ? toBengaliNumber(listing.floor_number || 1) : (listing.floor_number || 1)} {language === 'bn' ? 'তলা' : 'th'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Utensils className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{language === 'bn' ? 'মিল সিস্টেম' : 'Meal'}</span>
                      <span className="text-base font-bold text-stone-800">
                        {listing.amenity_ids?.includes('amenity-meal') ? (language === 'bn' ? 'উপলব্ধ' : 'Yes') : (language === 'bn' ? 'নাই' : 'No')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Bed className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{t.bedrooms}</span>
                      <span className="text-base font-bold text-stone-800">
                        {language === 'bn' ? toBengaliNumber(listing.bedrooms || 1) : (listing.bedrooms || 1)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Bath className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{t.bathrooms}</span>
                      <span className="text-base font-bold text-stone-800">
                        {language === 'bn' ? toBengaliNumber(listing.bathrooms || 1) : (listing.bathrooms || 1)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Maximize2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{t.sqft}</span>
                      <span className="text-base font-bold text-stone-800">
                        {language === 'bn' ? toBengaliNumber(listing.area_sqft || 800) : (listing.area_sqft || 800)}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                      <Layers className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[11px] text-stone-500 block">{t.floor}</span>
                      <span className="text-base font-bold text-stone-800">
                        {language === 'bn' ? toBengaliNumber(listing.floor_number || 1) : (listing.floor_number || 1)}
                        {listing.total_floors ? ` / ${language === 'bn' ? toBengaliNumber(listing.total_floors) : listing.total_floors}` : ''}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 3. Description Section */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-600" />
                <span>{language === 'bn' ? 'বাসা / মেসের বিস্তারিত বিবরণ' : 'Property Description & Rules'}</span>
              </h2>
              <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line pt-2">
                {language === 'bn' ? listing.description_bn : (listing.description_en || listing.description_bn)}
              </div>
            </div>

            {/* 4. Amenities & Facilities */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                <span>{language === 'bn' ? 'সুবিধাসমূহ ও ইউটিলিটি' : 'Available Amenities & Utilities'}</span>
              </h2>

              {matchingAmenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {matchingAmenities.map((amenity) => (
                    <div 
                      key={amenity.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100/80"
                    >
                      <div className="h-9 w-9 rounded-xl bg-white shadow-2xs border border-stone-200 flex items-center justify-center shrink-0">
                        {getAmenityIcon(amenity.icon_name)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">
                          {language === 'bn' ? amenity.name_bn : amenity.name_en}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                          {amenity.category === 'core' ? (language === 'bn' ? 'মৌলিক সুবিধা' : 'Core Utility') : 
                           amenity.category === 'security' ? (language === 'bn' ? 'নিরাপত্তা' : 'Security') : 
                           amenity.category === 'meal_service' ? (language === 'bn' ? 'খাবার ব্যবস্থা' : 'Meal Service') : 
                           (language === 'bn' ? 'আরামদায়ক' : 'Comfort')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">
                  {language === 'bn' ? 'নির্দিষ্ট কোনো বিশেষ সুবিধা যুক্ত করা হয়নি।' : 'No additional amenities listed.'}
                </p>
              )}
            </div>

            {/* 5. Similar Listings in Mymensingh */}
            {similarListings.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-stone-900">
                    {language === 'bn' ? 'অনুরূপ অন্যান্য বাসা ও মেস' : 'Similar Available Listings'}
                  </h2>
                  <button
                    onClick={() => onNavigate(categoryPrefix)}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    {t.viewAll}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarListings.map((sim) => (
                    <ListingCard
                      key={sim.id}
                      listing={sim}
                      onSelect={(item) => onNavigate(`${categoryPrefix}/${item.slug}`)}
                      onToggleFavorite={onToggleFavorite}
                      isFavorite={favorites.includes(sim.id)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Pricing & Contact Action Card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Rent & Bills Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-md sticky top-24 space-y-5">
              
              {/* Rent Main Display */}
              <div>
                <span className="text-xs font-semibold text-stone-500 block mb-1">
                  {t.monthlyRent}
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                      {formatPrice(listing.rent_monthly)}
                    </span>
                    <span className="text-sm font-medium text-stone-500">
                      /{language === 'bn' ? 'মাস' : 'month'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    listing.is_negotiable 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    {listing.is_negotiable ? t.negotiable : t.fixed}
                  </span>
                </div>
              </div>

              {/* Utility Bills Breakdown */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2.5 text-xs">
                <span className="font-bold text-stone-800 block text-[11px] uppercase tracking-wider text-stone-400">
                  {language === 'bn' ? 'বিল ও অগ্রিম জামানত' : 'Bills & Advance Breakdown'}
                </span>
                
                <div className="flex justify-between items-center text-stone-600">
                  <span>{language === 'bn' ? 'সিকিউরিটি ডিপোজিট:' : 'Security Deposit:'}</span>
                  <span className="font-semibold text-stone-900">
                    {listing.security_deposit ? formatPrice(listing.security_deposit) : (language === 'bn' ? 'আলোচনা সাপেক্ষে' : 'Negotiable')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span>{language === 'bn' ? 'গ্যাস বিল:' : 'Gas Bill:'}</span>
                  <span className={`font-semibold ${listing.gas_bill_included ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {listing.gas_bill_included ? (language === 'bn' ? 'ভাড়ার অন্তর্ভুক্ত' : 'Included') : (language === 'bn' ? 'পৃথক / নিজস্ব' : 'Separate')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span>{language === 'bn' ? 'বিদ্যুৎ বিল:' : 'Electricity Bill:'}</span>
                  <span className={`font-semibold ${listing.electricity_bill_included ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {listing.electricity_bill_included ? (language === 'bn' ? 'ভাড়ার অন্তর্ভুক্ত' : 'Included') : (language === 'bn' ? 'মিটার অনুযায়ী' : 'As per meter')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span>{language === 'bn' ? 'পানি ও সার্ভিস চার্জ:' : 'Water & Service Charge:'}</span>
                  <span className={`font-semibold ${listing.water_bill_included ? 'text-emerald-700' : 'text-stone-700'}`}>
                    {listing.water_bill_included ? (language === 'bn' ? 'ভাড়ার অন্তর্ভুক্ত' : 'Included') : (listing.service_charge ? `৳${listing.service_charge}` : (language === 'bn' ? 'পৃথক' : 'Separate'))}
                  </span>
                </div>
              </div>

              {/* Landlord / Owner Profile Preview */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 overflow-hidden">
                  {listing.owner_avatar ? (
                    <img src={listing.owner_avatar} alt={listing.owner_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{listing.owner_name?.charAt(0) || 'L'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-stone-900 truncate">
                      {listing.owner_name}
                    </span>
                    {(listing.is_owner_verified || listing.is_verified) && (
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" title="Verified Landlord" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {language === 'bn' ? 'সরাসরি বাড়িওয়ালা / মেস পরিচালক' : 'Direct Owner / Manager'}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                    {language === 'bn' ? '১০০% বিশ্বস্ত স্থানীয় লিস্টিং' : 'Verified Local Listing'}
                  </p>
                </div>
              </div>

              {/* Direct Contact CTAs (Desktop) */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-98"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{language === 'bn' ? `কল করুন: ${listing.contact_phone}` : `Call: ${listing.contact_phone}`}</span>
                </a>

                {listing.contact_whatsapp || listing.contact_phone ? (
                  <a
                    href={getWhatsAppLink(listing.contact_whatsapp || listing.contact_phone, title, listing.rent_monthly)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-sm transition-all active:scale-98"
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে মেসেজ দিন' : 'Message on WhatsApp'}</span>
                  </a>
                ) : null}
              </div>

              {/* Safety notice */}
              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed">
                <span className="font-semibold text-stone-700 block mb-0.5">
                  💡 {language === 'bn' ? 'ভাড়াটিয়ার জন্য পরামর্শ:' : 'Tenant Advice:'}
                </span>
                {language === 'bn' 
                  ? 'বাসা বা মেস সরাসরি সরেজমিনে দেখে নিশ্চিত হয়ে লেনদেন করুন। অগ্রিম টাকা পাঠানোর আগে সতর্কতা অবলম্বন করুন।' 
                  : 'Inspect the property in person before transferring advance deposits.'}
              </div>

            </div>

          </div>

        </div>

      </Container>

      {/* Lightbox / Fullscreen Image Viewer Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="flex items-center justify-between text-white z-10">
            <span className="text-sm font-semibold text-stone-300">
              {selectedImageIndex + 1} / {images.length} • {title}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div 
            className="relative flex-1 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImageIndex].url}
              alt=""
              className="max-h-[82vh] max-w-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-stone-400 text-xs z-10">
            {language === 'bn' ? 'বন্ধ করতে যেকোনো স্থানে ক্লিক করুন' : 'Click anywhere outside to close'}
          </div>
        </div>
      )}

      {/* Report Listing Modal */}
      <ReportListingModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        listingId={listing.id}
        listingTitle={title}
      />

      {/* Sticky Bottom Contact Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 safe-area-bottom-bar shadow-lg flex items-center justify-between gap-2.5">
        <div>
          <span className="text-[10px] text-stone-500 font-medium block">
            {t.monthlyRent}
          </span>
          <span className="text-base font-extrabold text-emerald-700 leading-tight">
            {formatPrice(listing.rent_monthly)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(listing.id)}
            className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all ${
              isFavorite ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-stone-100 border-stone-200 text-stone-600'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          <a
            href={getWhatsAppLink(listing.contact_whatsapp || listing.contact_phone, title, listing.rent_monthly)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs gap-1.5"
          >
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>

          <a
            href={`tel:${listing.contact_phone}`}
            className="h-11 px-4 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs gap-1.5 shadow-sm active:scale-95"
          >
            <Phone className="h-4 w-4" />
            <span>{language === 'bn' ? 'কল করুন' : 'Call'}</span>
          </a>
        </div>
      </div>

    </article>
  );
};
