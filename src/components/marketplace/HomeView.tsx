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
  Building2,
  Search,
  ArrowRight,
  Shield,
  Eye,
  Check,
  ChevronDown,
  Star,
  BadgeCheck
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { Container } from '../layout/Container';
import { HeroSearch } from './HeroSearch';
import { ListingCard } from './ListingCard';
import { AreaFilterPill } from './AreaFilterPill';
import { MYMENSINGH_AREAS } from '../../data/mymensingh-locations';
import { Listing, PropertyType, Area } from '../../types';
import { fetchPublicListings, fetchAreas } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { useSEO } from '../../lib/useSEO';
import { buildHomepageStructuredData, DEFAULT_KEYWORDS } from '../../lib/seo';

interface HomeViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  favorites = [],
  onToggleFavorite,
}) => {
  const { language, t } = useLanguage();

  const [areasList, setAreasList] = useState<Area[]>(MYMENSINGH_AREAS);
  const [allApprovedListings, setAllApprovedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLatestTab, setActiveLatestTab] = useState<'all' | PropertyType>('all');

  useSEO({
    title: language === 'bn' 
      ? 'ময়মনসিংহের সেরা বাসা, মেস ও হোস্টেল মার্কেটপ্লেস' 
      : 'Find House Rent, Mess & Hostels in Mymensingh',
    description: language === 'bn'
      ? 'ময়মনসিংহ শহরের চরপাড়া, মাসকান্দা, বাঘমারা, গাঙ্গিনারপাড়, কৃষি বিশ্ববিদ্যালয় ও মেডিকেল কলেজ এলাকাসহ সকল এলাকার ফ্যামিলি ফ্ল্যাট বাসা ভাড়া, ব্যাচেলর মেস ও ছাত্রী হোস্টেল খুঁজুন।'
      : 'Find verified family flats, bachelor rooms, student mess seats, and female hostels across Mymensingh with zero broker fees.',
    canonicalUrl: 'https://toletmymensingh.com/',
    keywords: DEFAULT_KEYWORDS,
    ogType: 'website',
    structuredData: buildHomepageStructuredData(),
  });

  useEffect(() => {
    let isMounted = true;
    async function loadHomepageData() {
      try {
        setIsLoading(true);
        const [areas, listings] = await Promise.all([
          fetchAreas(),
          fetchPublicListings()
        ]);
        if (isMounted) {
          if (areas && areas.length > 0) setAreasList(areas);
          if (listings && listings.length > 0) {
            setAllApprovedListings(listings.filter((l) => l.status === 'approved'));
          }
        }
      } catch (err) {
        console.warn('Error loading homepage data from Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomepageData();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredListings = allApprovedListings.filter((l) => l.is_featured);
  const latestListings = allApprovedListings.filter((l) => {
    if (activeLatestTab === 'all') return true;
    return l.property_type === activeLatestTab;
  });

  const categories = [
    {
      id: 'apartment',
      route: 'tolet',
      title_bn: 'ফ্যামিলি ফ্ল্যাট / বাসা',
      title_en: 'Family Apartments',
      desc_bn: '২-৪ বেডরুমের সম্পূর্ণ ফ্ল্যাট',
      desc_en: '2-4 Bed family apartments',
      icon: Home,
      count: allApprovedListings.filter((l) => l.property_type === 'apartment').length,
    },
    {
      id: 'mess',
      route: 'mess',
      title_bn: 'ছাত্র ও ব্যাচেলর মেস',
      title_en: 'Bachelor & Student Mess',
      desc_bn: 'BAU, MMC ও শহরে সিট ও মেস',
      desc_en: 'Near BAU, MMC & Town',
      icon: Users,
      count: allApprovedListings.filter((l) => l.property_type === 'mess' || l.property_type === 'seat').length,
    },
    {
      id: 'hostel',
      route: 'hostel',
      title_bn: 'ছাত্র-ছাত্রী হোস্টেল',
      title_en: 'Hostels',
      desc_bn: 'খাবার ব্যবস্থা ও নিরাপত্তা সম্বলিত',
      desc_en: 'With meals & 24/7 security',
      icon: Bed,
      count: allApprovedListings.filter((l) => l.property_type === 'hostel').length,
    },
    {
      id: 'sublet',
      route: 'sublet',
      title_bn: 'সাবলেট রুম',
      title_en: 'Sublet Rooms',
      desc_bn: 'একাকী বা ছোট পরিবারের জন্য',
      desc_en: 'Single rooms & portions',
      icon: Layers,
      count: allApprovedListings.filter((l) => l.property_type === 'sublet' || l.property_type === 'room').length,
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-16 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="relative flex w-full items-center overflow-hidden bg-emerald-950 text-white">
        
        {/* Background: Mymensingh cityscape (existing asset) */}
        <img
          src="/mymensingh.jpg"
          alt=""
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Cinematic dark-green overlay (very light — background image stays vivid) */}
        <div className="absolute inset-0 bg-emerald-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/35 via-emerald-950/15 to-emerald-900/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/25 via-transparent to-emerald-950/10" />

        {/* Subtle decorative arcs / glow (pure CSS, behind content) */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full border-2 border-emerald-300/30" />
          <div className="absolute top-1/3 -right-10 h-72 w-72 rounded-full border border-emerald-200/20" />
          <div className="absolute -bottom-16 right-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        </div>

        <Container className="relative z-10 flex w-full flex-col justify-center px-4 pt-28 pb-14 sm:pt-32 sm:pb-16 md:min-h-[100svh] md:pt-36 md:pb-20">
          
          {/* City Badge */}
          <div className="hero-fade-up mb-4 inline-flex w-fit mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-semibold shadow-xs backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            <span>
              {language === 'bn' ? 'ময়মনসিংহ শহরের এক নম্বর টু-লেট প্ল্যাটফর্ম' : 'Mymensingh\'s Rental Marketplace'}
            </span>
          </div>

          {/* Hero Headline - centered editorial */}
          <h1 className="hero-fade-up-1 max-w-3xl mx-auto text-center text-[clamp(1.9rem,5.4vw,4.4rem)] font-black leading-[1.12] tracking-tight text-white [text-shadow:0_2px_14px_rgba(6,45,44,0.55),0_1px_3px_rgba(6,45,44,0.35)]">
            {language === 'bn' ? (
              <>
                ময়মনসিংহে
                <br />
                আপনার পরের
                <br />
                <span className="text-emerald-400">বাসা</span> খুঁজে নিন
              </>
            ) : (
              <>
                Find your next
                <br />
                <span className="text-emerald-400">home</span> in
                <br />
                Mymensingh
              </>
            )}
          </h1>

          {/* Hero Description */}
          <p className="hero-fade-up-2 mt-4 max-w-[560px] mx-auto text-center text-sm leading-relaxed text-white [text-shadow:0_1px_8px_rgba(6,45,44,0.6)] sm:text-base">
            {language === 'bn' 
              ? 'গাঙ্গিনার পাড়, চরপাড়া, নতুন বাজার, মাসকান্দা ও মেডিকেল কলেজ এলাকাসহ সব জায়গায় যাচাই করা বাসা, মেস ও হোস্টেল।' 
              : 'Verified apartments, student messes and hostels across Gagina Bar, Charpara, Notun Bazar, Maskanda & more.'}
          </p>

          {/* Trust Badge */}
          <div className="hero-fade-up-2 mt-5 inline-flex w-fit mx-auto flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl bg-emerald-950/45 backdrop-blur-sm border border-white/10 px-3.5 py-2 text-[11px] font-medium text-white/85 sm:text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <BadgeCheck className="h-4 w-4" />
              <span className="font-bold">{language === 'bn' ? '১০০% যাচাইকৃত লিস্টিং' : '100% Verified'}</span>
            </span>
            <span className="text-white/30">•</span>
            <span>{language === 'bn' ? 'নিরাপদ' : 'Safe'}</span>
            <span className="text-white/30">•</span>
            <span>{language === 'bn' ? 'নির্ভরযোগ্য' : 'Trusted'}</span>
            <span className="text-white/30">•</span>
            <span>{language === 'bn' ? 'সহজ' : 'Easy'}</span>
          </div>

          {/* Hero Search Panel */}
          <div className="hero-fade-up-3 mt-7 sm:mt-8 w-full">
            <HeroSearch
              onSearch={(filters) => {
                const targetView = filters.propertyType === 'mess' 
                  ? 'mess' 
                  : filters.propertyType === 'hostel' 
                  ? 'hostel' 
                  : filters.propertyType === 'sublet' 
                  ? 'sublet' 
                  : 'tolet';
                onNavigate(targetView, filters);
              }}
            />
          </div>

          {/* Trust Statistics — honest, configurable labels (no fabricated counts) */}
          <div className="hero-fade-up-4 mt-8 grid max-w-3xl mx-auto grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: BadgeCheck, value: '১০০%', label: language === 'bn' ? 'যাচাইকৃত লিস্টিং' : 'Verified' },
              { icon: ShieldCheck, value: '০%', label: language === 'bn' ? 'দালাল / ফি' : 'Zero Broker' },
              { icon: MapPin, value: '১২+', label: language === 'bn' ? 'প্রধান এলাকা' : 'Areas' },
              { icon: Phone, value: '২৪/৭', label: language === 'bn' ? 'সাপোর্ট' : 'Support' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center justify-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-emerald-300">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-base font-black text-white sm:text-lg">{s.value}</span>
                    <span className="block text-[10px] text-white/60 sm:text-xs">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll indicator — desktop/tablet only */}
          <div className="hero-fade-up-4 mt-10 hidden sm:flex flex-col items-center gap-1 text-white/55">
            <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/30 p-1">
              <div className="h-1.5 w-1 rounded-full bg-emerald-300 animate-bounce" />
            </div>
            <span className="text-[10px] font-medium tracking-wide">
              {language === 'bn' ? 'নিচে স্ক্রল করুন' : 'Scroll down'}
            </span>
          </div>

        </Container>
      </section>


      {/* 2. POPULAR LOCALITIES / AREAS */}
      <section className="px-4">
        <Container>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-stone-900 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>{language === 'bn' ? 'জনপ্রিয় এলাকা নির্বাচন করুন' : 'Popular Locations'}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'bn' ? 'আপনার পছন্দের এলাকার বাসা ও মেস দেখতে ক্লিক করুন' : 'Tap to filter rentals by Mymensingh area'}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('tolet')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold p-1 h-auto"
            >
              <span>{language === 'bn' ? 'সব এলাকা' : 'All Areas'}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {areasList.slice(0, 10).map((area) => (
              <AreaFilterPill
                key={area.id}
                area={area}
                isSelected={false}
                onSelect={() => onNavigate('tolet', { areaSlug: area.slug })}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 3. CATEGORY DISCOVERY (2x2 on mobile, 4 cols on desktop) */}
      <section className="px-4">
        <Container>
          <div className="mb-4">
            <h2 className="text-base sm:text-xl font-bold text-stone-900">
              {language === 'bn' ? 'প্রপার্টি ক্যাটাগরি' : 'Property Categories'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'bn' ? 'আপনার প্রয়োজন অনুযায়ী সঠিক ক্যাটাগরি বেছে নিন' : 'Choose the right rental category for you'}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate(cat.route)}
                  className="group bg-white rounded-2xl p-3.5 sm:p-5 border border-stone-200/90 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-stone-900 text-xs sm:text-base leading-snug mb-0.5">
                      {language === 'bn' ? cat.title_bn : cat.title_en}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-2">
                      {language === 'bn' ? cat.desc_bn : cat.desc_en}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-emerald-700 font-bold text-[11px] sm:text-xs">
                    <span>{language === 'bn' ? 'খুঁজুন' : 'Explore'}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. FEATURED LISTINGS */}
      {featuredListings.length > 0 && (
        <section className="px-4">
          <Container>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="featured" className="text-[10px] px-2 py-0.2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {language === 'bn' ? 'স্পেশাল চয়েস' : 'Featured'}
                  </Badge>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-stone-900 mt-1">
                  {language === 'bn' ? 'প্রিমিয়াম ও হাইলাইটেড বাসা' : 'Featured Verified Listings'}
                </h2>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('tolet', { featured: true })}
                className="h-8 px-3 rounded-xl text-xs font-bold border-stone-200"
              >
                <span>{language === 'bn' ? 'সকল স্পেশাল' : 'View All'}</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-72 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {featuredListings.slice(0, 3).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onNavigate={onNavigate}
                    isFavorite={favorites.includes(listing.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* 5. LATEST LISTINGS WITH FILTER TABS */}
      <section className="px-4">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-stone-900">
                {language === 'bn' ? 'সর্বশেষ বিজ্ঞাপিত বাসা ও মেস' : 'Latest Rental Listings'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'bn' ? 'ময়মনসিংহে প্রতিদিন যুক্ত হওয়া নতুন খালি বাসা' : 'Recently added properties in Mymensingh'}
              </p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label_bn: 'সকল', label_en: 'All' },
                { id: 'apartment', label_bn: 'ফ্ল্যাট', label_en: 'Flats' },
                { id: 'mess', label_bn: 'মেস', label_en: 'Mess' },
                { id: 'hostel', label_bn: 'হোস্টেল', label_en: 'Hostel' },
                { id: 'sublet', label_bn: 'সাবলেট', label_en: 'Sublet' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLatestTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeLatestTab === tab.id
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {language === 'bn' ? tab.label_bn : tab.label_en}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : latestListings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
              <p className="text-stone-500 text-sm">
                {language === 'bn' ? 'এই ক্যাটাগরিতে এই মুহূর্তে কোনো বিজ্ঞাপন নেই।' : 'No properties found in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {latestListings.slice(0, 6).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onNavigate={onNavigate}
                  isFavorite={favorites.includes(listing.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}

          {/* View All Listings CTA */}
          <div className="text-center mt-6">
            <Button
              size="lg"
              onClick={() => onNavigate('tolet')}
              className="h-11 px-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-sm"
            >
              <span>{language === 'bn' ? 'সকল বাসা ও মেস দেখুন' : 'Explore All Listings'}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </Container>
      </section>

      {/* 6. OWNER CTA BANNER */}
      <section className="px-4">
        <Container>
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-md">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-xl">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-bold">
                  🏠 {language === 'bn' ? 'বাড়ির মালিকদের জন্য' : 'For House Landlords'}
                </span>
                <h3 className="text-lg sm:text-2xl font-black tracking-tight">
                  {language === 'bn' ? 'আপনার বাসা বা মেস কি খালি রয়েছে?' : 'Have a vacant flat or mess seat?'}
                </h3>
                <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                  {language === 'bn'
                    ? 'হাজার হাজার পরিবার ও শিক্ষার্থী প্রতিদিন বাসা খুঁজছেন। আজই বিনামূল্যে আপনার বিজ্ঞাপন পোস্ট করুন।'
                    : 'Reach thousands of genuine tenants in Mymensingh with zero hassle.'}
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => onNavigate('post-property')}
                  className="h-11 px-6 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-sm active:scale-95"
                >
                  <PlusCircle className="h-4 w-4 mr-1.5 text-emerald-700" />
                  <span>{t.postProperty}</span>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
};
