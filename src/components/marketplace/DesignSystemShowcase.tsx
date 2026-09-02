import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Bed, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  Building,
  Database,
  Lock,
  Server,
  FolderOpen
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { Container } from '../layout/Container';
import { HeroSearch } from './HeroSearch';
import { ListingCard } from './ListingCard';
import { AreaFilterPill } from './AreaFilterPill';
import { MYMENSINGH_AREAS } from '../../data/mymensingh-locations';
import { SAMPLE_LISTINGS } from '../../data/sample-listings';
import { AMENITIES_LIST } from '../../data/amenities';
import { Listing, PropertyType, Area } from '../../types';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { fetchPublicListings, fetchAreas, isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle
} from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';

interface DesignSystemShowcaseProps {
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const DesignSystemShowcase: React.FC<DesignSystemShowcaseProps> = ({
  onNavigate,
  favorites = [],
  onToggleFavorite,
}) => {
  const { language, t } = useLanguage();
  
  const [areasList, setAreasList] = useState<Area[]>(MYMENSINGH_AREAS);
  const [allListings, setAllListings] = useState<Listing[]>(SAMPLE_LISTINGS);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(false);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [selectedListingDetail, setSelectedListingDetail] = useState<Listing | null>(null);
  const [activeTabShowcase, setActiveTabShowcase] = useState<'all' | PropertyType>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSandbox, setShowSandbox] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoadingListings(true);
        const [areas, listings] = await Promise.all([
          fetchAreas(),
          fetchPublicListings()
        ]);
        if (isMounted) {
          if (areas && areas.length > 0) setAreasList(areas);
          if (listings && listings.length > 0) setAllListings(listings);
        }
      } catch (err) {
        console.warn('Using local catalog:', err);
      } finally {
        if (isMounted) setIsLoadingListings(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFavoriteAction = (id: string) => {
    onToggleFavorite?.(id);
    const isNowFavorite = !favorites.includes(id);
    showToast(isNowFavorite ? t.savedToFavorites : (language === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from favorites'));
  };

  const filteredListings = allListings.filter((item) => {
    if (selectedAreaFilter !== 'all' && item.area_id !== selectedAreaFilter && item.area_name_en.toLowerCase() !== selectedAreaFilter) {
      const matchedArea = areasList.find(a => a.slug === selectedAreaFilter);
      if (matchedArea && item.area_id !== matchedArea.id) return false;
    }
    if (activeTabShowcase !== 'all' && item.property_type !== activeTabShowcase) {
      return false;
    }
    return true;
  });

  const categoryCards = [
    { id: 'apartment', title_bn: 'পারিবারিক বাসা / ফ্ল্যাট', title_en: 'Family Apartments', count: 124, icon: Home, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'mess', title_bn: 'ছাত্র ও ব্যাচেলর মেস', title_en: 'Student & Bachelor Mess', count: 86, icon: Users, color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 'seat', title_bn: 'সিট ভাড়া (মেস ও হোস্টেল)', title_en: 'Seat Rent (Mess & Hostel)', count: 94, icon: Bed, color: 'bg-violet-50 text-violet-700 border-violet-200' },
    { id: 'hostel', title_bn: 'ছাত্রী ও মহিলা হোস্টেল', title_en: 'Female Student Hostels', count: 42, icon: Sparkles, color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { id: 'sublet', title_bn: 'এক রুমের সাবলেট', title_en: 'Single Room Sublets', count: 35, icon: Layers, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-12 bg-linear-to-b from-emerald-50/60 via-stone-50 to-stone-50 border-b border-stone-200/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10 space-y-3">
            
            {/* City Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold tracking-wide">
              <MapPin className="h-3.5 w-3.5 text-emerald-700" />
              <span>{language === 'bn' ? 'ময়মনসিংহ শহরের অফিসিয়াল রেন্টাল মার্কেটপ্লেস' : 'Mymensingh\'s Dedicated Rental Marketplace'}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              {language === 'bn' ? 'ময়মনসিংহে আপনার পরের বাসা খুঁজে নিন সহজে' : 'Find Your Ideal Rental Home in Mymensingh'}
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
              {language === 'bn'
                ? 'মাসকান্দা, চরপাড়া, আনন্দ মোহন কলেজ এলাকা ও বাকৃবি সংলগ্ন শত শত বিশ্বস্ত ফ্ল্যাট, রুম, মেস ও হোস্টেল—সরাসরি মালিকের সাথে কথা বলুন কোনো দালাল ছাড়াই।'
                : 'Browse verified family flats, bachelor messes, student seats, and female hostels with direct landlord phone and WhatsApp.'}
            </p>
          </div>

          {/* Master Search Engine */}
          <HeroSearch 
            onSearch={(filters) => {
              showToast(language === 'bn' ? `খোঁজা হচ্ছে: ${filters.keyword || filters.propertyType}` : `Searching for: ${filters.keyword || filters.propertyType}`);
            }} 
          />

          {/* Quick Stats Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {language === 'bn' ? '১০০% ফ্রি বিজ্ঞাপন প্রকাশ' : '100% Free Listing'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {language === 'bn' ? 'সরাসরি মালিকের মোবাইল ও হোয়াটসঅ্যাপ' : 'Direct Landlord Contacts'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {language === 'bn' ? 'দালাল ও মিডিয়া ফি মুক্ত' : 'Zero Broker Fees'}
            </span>
          </div>

        </Container>
      </section>

      {/* 2. POPULAR AREAS SECTION */}
      <section>
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                {language === 'bn' ? 'লোকেশন ব্রাউজার' : 'Localities'}
              </div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                {t.popularAreas}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              {language === 'bn' ? 'আপনার পছন্দের এলাকার ওপর ক্লিক করে বাসা দেখুন' : 'Click an area to filter properties'}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedAreaFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                selectedAreaFilter === 'all'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {t.allAreas}
            </button>
            {MYMENSINGH_AREAS.map((area) => (
              <AreaFilterPill
                key={area.id}
                area={area}
                isSelected={selectedAreaFilter === area.slug}
                onSelect={(slug) => {
                  setSelectedAreaFilter(selectedAreaFilter === slug ? 'all' : slug);
                }}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 3. BROWSE BY CATEGORY */}
      <section>
        <Container>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                {language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
              </div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                {t.browseByType}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {categoryCards.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTabShowcase === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTabShowcase(activeTabShowcase === cat.id ? 'all' : (cat.id as PropertyType));
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all group cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white hover:border-stone-300 hover:shadow-sm border-stone-200/80 text-stone-900'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isActive ? 'bg-white/20 text-white' : cat.color
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm leading-tight mb-1 ${isActive ? 'text-white' : 'text-stone-900 group-hover:text-emerald-700'}`}>
                      {language === 'bn' ? cat.title_bn : cat.title_en}
                    </h3>
                    <p className={`text-xs font-medium ${isActive ? 'text-emerald-100' : 'text-stone-500'}`}>
                      {language === 'bn' ? `${toBengaliNumber(cat.count)}+ লিস্টিং` : `${cat.count}+ listings`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. FEATURED / LATEST LISTINGS GRID */}
      <section>
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {language === 'bn' ? 'সরাসরি প্রাপ্ত প্রপার্টি' : 'Live Listings'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
                {language === 'bn' ? 'ময়মনসিংহের নির্বাচিত ভেরিফাইড টু-লেট' : 'Featured & Fresh Rentals in Mymensingh'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                {language === 'bn' ? `মোট ${toBengaliNumber(filteredListings.length)} টি প্রপার্টি` : `Showing ${filteredListings.length} properties`}
              </span>
            </div>
          </div>

          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorite={favorites.includes(listing.id)}
                  onToggleFavorite={handleFavoriteAction}
                  onSelect={(item) => setSelectedListingDetail(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 space-y-3">
              <Building className="h-12 w-12 text-stone-400 mx-auto" />
              <h3 className="font-bold text-stone-900 text-lg">
                {language === 'bn' ? 'কোনো বাসা পাওয়া যায়নি' : 'No listings found in this filter'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {language === 'bn' ? 'অনুগ্রহ করে অন্য কোনো এলাকা অথবা সব ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।' : 'Try selecting all areas or clearing your active filters.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAreaFilter('all');
                  setActiveTabShowcase('all');
                }}
                className="mt-2"
              >
                {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* 5. OWNER PROMOTION CTA BANNER */}
      <section>
        <Container>
          <div className="rounded-3xl bg-linear-to-r from-emerald-800 to-stone-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-700/20 blur-2xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{language === 'bn' ? 'বাড়িওয়ালা ও মেস মালিকদের জন্য' : 'For Landlords & Mess Managers'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {t.ownerCtaTitle}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                {t.ownerCtaDesc}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => onNavigate?.('post-property')}
                  className="bg-white hover:bg-stone-100 text-emerald-950 font-bold px-6 h-12 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <PlusCircle className="h-5 w-5 text-emerald-700" />
                  <span>{t.ownerCtaBtn}</span>
                </Button>

                <div className="text-xs text-stone-300 flex items-center gap-1.5 ml-1 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'কোনো ফি বা কমিশন নেই' : '100% Free & No Brokerage'}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. FOUNDATION & DESIGN SYSTEM INSPECTOR */}
      <section className="pt-6">
        <Container>
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Foundation Verification & UI Sandbox
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-1">
                  {language === 'bn' ? 'ডিজাইন সিস্টেম ও ইউআই কম্পোনেন্ট ফাউন্ডেশন' : 'Design System & UI Components Foundation'}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSandbox(!showSandbox)}
                className="text-xs font-bold border-stone-200"
              >
                {showSandbox ? 'Hide Sandbox' : 'Inspect Primitives'}
              </Button>
            </div>

            {showSandbox && (
              <div className="space-y-8 animate-in fade-in duration-200 pt-2">
                
                {/* Button Variants */}
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Button Variants & States</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Primary Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="whatsapp">WhatsApp Direct</Button>
                    <Button variant="call">Call Owner</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button disabled variant="default">Disabled</Button>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Marketplace Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="verified">✓ Verified Landlord</Badge>
                    <Badge variant="featured">★ Featured Property</Badge>
                    <Badge variant="family">Family Flat</Badge>
                    <Badge variant="bachelor">Bachelor Only</Badge>
                    <Badge variant="student">Student Friendly</Badge>
                    <Badge variant="female">Female Only</Badge>
                    <Badge variant="rented">Already Rented</Badge>
                  </div>
                </div>

                {/* Form Controls */}
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Input & Form Controls</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input placeholder="মালিকের নাম লিখুন..." />
                    <Input icon={<MapPin className="h-4 w-4" />} placeholder="লোকেশন বা সড়ক নম্বর..." />
                    <Input icon={<Phone className="h-4 w-4" />} placeholder="017xxxxxxxx" />
                  </div>
                </div>

                {/* Skeletons */}
                <div>
                  <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Skeleton Loading States</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <Skeleton className="h-28 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>

                {/* Supabase Architecture & RLS Verification */}
                <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">Supabase PostgreSQL Schema & RLS Architecture</h4>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      Production Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 font-semibold">
                        <Lock className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Row Level Security</span>
                      </div>
                      <p className="text-stone-300">
                        Strict RLS policies enabled on all 9 tables (Public, Owner-owned, Favorites, Reports, Admin).
                      </p>
                    </div>

                    <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 font-semibold">
                        <FolderOpen className="h-3.5 w-3.5 text-sky-400" />
                        <span>Storage & Buckets</span>
                      </div>
                      <p className="text-stone-300">
                        <code className="text-sky-300">listing-images</code> bucket configured with authenticated uploads and public reads.
                      </p>
                    </div>

                    <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 font-semibold">
                        <Server className="h-3.5 w-3.5 text-amber-400" />
                        <span>Key Isolation</span>
                      </div>
                      <p className="text-stone-300">
                        Client uses public Anon Key. Service Role Key is strictly isolated server-side.
                      </p>
                    </div>

                    <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>SQL Migrations</span>
                      </div>
                      <p className="text-stone-300">
                        3 versioned migrations with triggers, indexes, and seeded Mymensingh localities.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 7. PROPERTY DETAIL MODAL DIALOG */}
      {selectedListingDetail && (
        <Dialog open={!!selectedListingDetail} onOpenChange={(open) => !open && setSelectedListingDetail(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl">
            {/* Modal Image Header */}
            <div className="relative aspect-16/9 w-full bg-stone-900">
              <img
                src={selectedListingDetail.images?.[0]?.url}
                alt={selectedListingDetail.title_bn}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="default" className="bg-stone-900/80 backdrop-blur-xs text-white">
                  {selectedListingDetail.property_type.toUpperCase()}
                </Badge>
                {selectedListingDetail.is_verified && (
                  <Badge variant="verified" className="bg-white/90">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                    {t.verified}
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Title & Price Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {language === 'bn' ? selectedListingDetail.area_name_bn : selectedListingDetail.area_name_en}, {selectedListingDetail.address_street_bn}
                    </span>
                  </div>
                  <DialogTitle className="text-xl font-bold text-stone-900 leading-snug">
                    {language === 'bn' ? selectedListingDetail.title_bn : (selectedListingDetail.title_en || selectedListingDetail.title_bn)}
                  </DialogTitle>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-2xl font-black text-emerald-700">
                    {formatPrice(selectedListingDetail.rent_monthly)}
                  </div>
                  <div className="text-xs text-stone-500 font-medium">
                    /{language === 'bn' ? 'মাসিক ভাড়া' : 'month'} • {selectedListingDetail.is_negotiable ? t.negotiable : t.fixed}
                  </div>
                </div>
              </div>

              {/* Specs Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-xs text-stone-500">{t.bedrooms}</div>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {language === 'bn' ? toBengaliNumber(selectedListingDetail.bedrooms || selectedListingDetail.seat_count || 1) : (selectedListingDetail.bedrooms || selectedListingDetail.seat_count || 1)}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-xs text-stone-500">{t.bathrooms}</div>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {language === 'bn' ? toBengaliNumber(selectedListingDetail.bathrooms || 1) : (selectedListingDetail.bathrooms || 1)}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-xs text-stone-500">{t.sqft}</div>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {language === 'bn' ? toBengaliNumber(selectedListingDetail.area_sqft || 800) : (selectedListingDetail.area_sqft || 800)}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-xs text-stone-500">{t.availableFrom}</div>
                  <div className="text-xs font-bold text-stone-900 mt-1 truncate">
                    {selectedListingDetail.available_from}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-2">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ' : 'Description'}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed bg-stone-50/70 p-4 rounded-xl border border-stone-100">
                  {language === 'bn' ? selectedListingDetail.description_bn : (selectedListingDetail.description_en || selectedListingDetail.description_bn)}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-2">
                  {t.amenities}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedListingDetail.amenity_ids.map((amenityId) => {
                    const am = AMENITIES_LIST.find(a => a.id === amenityId);
                    return (
                      <span key={amenityId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{language === 'bn' ? (am?.name_bn || amenityId) : (am?.name_en || amenityId)}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Landlord Contact Actions */}
              <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={`tel:${selectedListingDetail.contact_phone}`}
                  className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <Phone className="h-4 w-4" />
                  <span>{t.callOwner}: {selectedListingDetail.contact_phone}</span>
                </a>

                {selectedListingDetail.contact_whatsapp && (
                  <a
                    href={`https://wa.me/88${selectedListingDetail.contact_whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:flex-1 h-12 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md"
                  >
                    <span>{t.whatsapp} Chat</span>
                  </a>
                )}
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};
