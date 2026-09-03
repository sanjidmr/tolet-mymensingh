import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  X,
  Building,
  RefreshCw,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Home
} from 'lucide-react';
import { Listing, Area, PropertyType, TargetAudience, ListingFilterState, ListingSortOption } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { Container } from '../layout/Container';
import { ListingCard } from './ListingCard';
import { ListingsFilterSidebar } from './ListingsFilterSidebar';
import { ActiveFilterChips } from './ActiveFilterChips';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { fetchPublicListingsPaginated, fetchAreas } from '../../lib/supabase';
import { MYMENSINGH_AREAS } from '../../data/mymensingh-locations';
import { parseUrlFilters, serializeFiltersToUrl, countActiveFilters } from '../../lib/filter-url';
import { useSEO } from '../../lib/useSEO';
import { buildCategoryStructuredData } from '../../lib/seo';

interface ListingsExplorerViewProps {
  mode?: 'tolet' | 'mess' | 'hostel' | 'sublet';
  initialFilters?: Partial<ListingFilterState>;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const ListingsExplorerView: React.FC<ListingsExplorerViewProps> = ({
  mode = 'tolet',
  initialFilters,
  onNavigate,
  favorites = [],
  onToggleFavorite,
}) => {
  const { language } = useLanguage();
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Default property type derived from category mode
  const defaultModeType: PropertyType | 'all' = useMemo(() => {
    if (mode === 'mess') return 'mess';
    if (mode === 'hostel') return 'hostel';
    if (mode === 'sublet') return 'sublet';
    return 'all';
  }, [mode]);

  // Read initial filter state from URL query parameters + initialFilters prop
  const [filters, setFilters] = useState<ListingFilterState>(() => {
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const urlState = parseUrlFilters(search, defaultModeType);
    return {
      ...urlState,
      ...(initialFilters || {}),
      propertyType: initialFilters?.propertyType || urlState.propertyType || defaultModeType,
    };
  });

  // Search input with local debounce state
  const [searchInput, setSearchInput] = useState<string>(filters.searchQuery || '');
  const [areas, setAreas] = useState<Area[]>(MYMENSINGH_AREAS);
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Load Areas list
  useEffect(() => {
    let mounted = true;
    async function loadAreas() {
      try {
        const data = await fetchAreas();
        if (mounted && data && data.length > 0) {
          setAreas(data);
        }
      } catch (err) {
        console.error('Failed to load areas:', err);
      }
    }
    loadAreas();
    return () => {
      mounted = false;
    };
  }, []);

  // Synchronize browser history / URL query params when filters change
  const syncUrlWithFilters = useCallback((nextFilters: ListingFilterState) => {
    const searchString = serializeFiltersToUrl(nextFilters, defaultModeType);
    const basePath = mode === 'tolet' ? '/tolet' : `/${mode}`;
    const newUrl = `${basePath}${searchString}`;

    if (window.location.pathname + window.location.search !== newUrl) {
      try {
        window.history.replaceState({ filters: nextFilters }, '', newUrl);
      } catch {
        // Fallback for sandboxed environments
      }
    }
  }, [mode, defaultModeType]);

  // Handle browser PopState (Back / Forward button)
  useEffect(() => {
    const handlePopState = () => {
      const urlState = parseUrlFilters(window.location.search, defaultModeType);
      setFilters(urlState);
      setSearchInput(urlState.searchQuery || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultModeType]);

  // Debounce search input changes (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if ((filters.searchQuery || '') !== trimmed) {
        setFilters((prev) => {
          const updated = { ...prev, searchQuery: trimmed || undefined, page: 1 };
          syncUrlWithFilters(updated);
          return updated;
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, filters.searchQuery, syncUrlWithFilters]);

  // Main data loader function
  const loadData = useCallback(async (currentFilters: ListingFilterState) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const result = await fetchPublicListingsPaginated({
        ...currentFilters,
        pageSize: 12,
      });

      setListings(result.listings);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error fetching public listings:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch listings on filter change
  useEffect(() => {
    loadData(filters);
  }, [filters, loadData]);

  // Filter update handler
  const handleFilterChange = (updates: Partial<ListingFilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      // Clean undefined keys
      Object.keys(next).forEach((k) => {
        if ((next as any)[k] === undefined) {
          delete (next as any)[k];
        }
      });
      syncUrlWithFilters(next);
      return next;
    });
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    const resetState: ListingFilterState = {
      propertyType: defaultModeType,
      sortBy: 'newest',
      page: 1,
    };
    setFilters(resetState);
    setSearchInput('');
    syncUrlWithFilters(resetState);
  };

  // Remove single active filter chip
  const handleRemoveFilter = (key: keyof ListingFilterState, value?: any) => {
    if (key === 'amenities' && value && filters.amenities) {
      const updated = filters.amenities.filter((a) => a !== value);
      handleFilterChange({ amenities: updated.length > 0 ? updated : undefined, page: 1 });
    } else if (key === 'searchQuery') {
      setSearchInput('');
      handleFilterChange({ searchQuery: undefined, page: 1 });
    } else {
      handleFilterChange({ [key]: undefined, page: 1 });
    }
  };

  // Dynamic SEO metadata calculation
  const currentArea = areas.find(
    (a) => a.id === filters.areaSlug || a.slug === filters.areaSlug || a.name_en.toLowerCase() === filters.areaSlug?.toLowerCase()
  );
  const areaNameBn = currentArea ? currentArea.name_bn : '';
  const areaNameEn = currentArea ? currentArea.name_en : '';

  const categoryTitle = useMemo(() => {
    if (mode === 'mess') {
      return areaNameBn ? `${areaNameBn} মেস ও ব্যাচেলর রুম ভাড়া` : (language === 'bn' ? 'ময়মনসিংহ মেস ও ব্যাচেলর রুম ভাড়া' : 'Mymensingh Mess & Bachelor Rooms');
    }
    if (mode === 'hostel') {
      return areaNameBn ? `${areaNameBn} ছাত্র ও ছাত্রী হোস্টেল` : (language === 'bn' ? 'ময়মনসিংহ ছাত্র ও ছাত্রী হোস্টেল' : 'Mymensingh Student Hostels');
    }
    if (mode === 'sublet') {
      return areaNameBn ? `${areaNameBn} সাবলেট বাসা ভাড়া` : (language === 'bn' ? 'ময়মনসিংহ সাবলেট ও ছোট বাসা ভাড়া' : 'Mymensingh Sublet & Small Flat Rent');
    }
    return areaNameBn ? `${areaNameBn} বাসা ও ফ্ল্যাট ভাড়া` : (language === 'bn' ? 'ময়মনসিংহ বাসা ভাড়া ও ফ্যামিলি ফ্ল্যাট' : 'Mymensingh House Rent & Family Apartments');
  }, [mode, areaNameBn, language]);

  const categoryDescription = useMemo(() => {
    if (mode === 'mess') {
      return language === 'bn'
        ? `ময়মনসিংহের ${areaNameBn || 'সকল এলাকার'} সাশ্রয়ী মেস, ব্যাচেলর সিট ও সিঙ্গেল রুম খুঁজুন। ছাত্র এবং চাকরিজীবীদের জন্য আদর্শ।`
        : `Explore bachelor mess seats and shared rooms in ${areaNameEn || 'Mymensingh'} with direct landlord contacts.`;
    }
    if (mode === 'hostel') {
      return language === 'bn'
        ? `ময়মনসিংহের ${areaNameBn || 'বিভিন্ন এলাকার'} নিরাপদ ছাত্রী হোস্টেল ও ছাত্র হোস্টেল। মিল ব্যবস্থা ও সার্বক্ষণিক নিরাপত্তা।`
        : `Find verified male and female student hostels across ${areaNameEn || 'Mymensingh'}.`;
    }
    return language === 'bn'
      ? `ময়মনসিংহের ${areaNameBn || 'চরপাড়া, মাসকান্দা, বাঘমারা, গাঙ্গিনারপাড় সহ সকল এলাকার'} সম্পূর্ণ টাইলস করা ফ্যামিলি ফ্ল্যাট ও বাসা ভাড়া খুঁজুন।`
      : `Browse verified family flats and house rentals in ${areaNameEn || 'Mymensingh'} with zero broker hassle.`;
  }, [mode, areaNameBn, areaNameEn, language]);

  const categoryKeywords = useMemo(() => {
    const base = [
      'ময়মনসিংহ বাসা ভাড়া',
      'Mymensingh house rent',
      'ময়মনসিংহ মেস',
      'Mymensingh mess',
      'Maskanda house rent',
      'মাসকান্দা বাসা ভাড়া',
      'Mymensingh bachelor room',
      'ToLet Mymensingh',
    ];
    if (areaNameBn) base.unshift(`${areaNameBn} বাসা ভাড়া`, `${areaNameEn} house rent`);
    return base;
  }, [areaNameBn, areaNameEn]);

  useSEO({
    title: categoryTitle,
    description: categoryDescription,
    canonicalUrl: `https://toletmymensingh.com/${mode === 'tolet' ? 'tolet' : mode}`,
    keywords: categoryKeywords,
    ogType: 'website',
    structuredData: buildCategoryStructuredData(categoryTitle, mode === 'tolet' ? 'tolet' : mode),
  });

  // Pagination page change handler
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === (filters.page || 1)) return;
    handleFilterChange({ page: newPage });
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Header Title and Description based on Mode
  const getHeaderInfo = () => {
    if (mode === 'mess') {
      return {
        title_bn: 'ময়মনসিংহে মেস ও সিট ভাড়া',
        title_en: 'Mess & Bachelor Seats in Mymensingh',
        desc_bn: 'ছাত্র ও চাকুরিজীবীদের জন্য ময়মনসিংহের সেরা মেস, সিট ও সাবলেট বাসা।',
        desc_en: 'Find verified mess seats and shared accommodations for students and job holders.',
      };
    }
    if (mode === 'hostel') {
      return {
        title_bn: 'ময়মনসিংহে হোস্টেল বাসস্থান',
        title_en: 'Hostels in Mymensingh',
        desc_bn: 'ছাত্র ও ছাত্রীদের জন্য খাবার, নিরাপত্তা ও ওয়াইফাই সুবিধাসহ অনুমোদিত হোস্টেল।',
        desc_en: 'Safe, verified student hostels with meal systems, security, and Wi-Fi.',
      };
    }
    if (mode === 'sublet') {
      return {
        title_bn: 'ময়মনসিংহে সাবলেট ও রুম ভাড়া',
        title_en: 'Sublets & Single Rooms in Mymensingh',
        desc_bn: 'ফ্যামিলি বা ছোট পরিবারের সাথে অ্যাটাচড বাথরুমসহ সাবলেট রুম খুঁজুন।',
        desc_en: 'Rent single rooms or sublets with attached bathrooms in Mymensingh.',
      };
    }
    return {
      title_bn: 'ময়মনসিংহে টু-লেট ও বাসা ভাড়া',
      title_en: 'To-Let & House Rentals in Mymensingh',
      desc_bn: 'চরপাড়া, বাঘমারা, গাঙ্গিনার পাড় সহ ময়মনসিংহ শহরের সকল এলাকার যাচাইকৃত বাসা।',
      desc_en: 'Explore verified apartments, houses, and flats across all areas in Mymensingh.',
    };
  };

  const header = getHeaderInfo();
  const activeFilterCount = countActiveFilters(filters, defaultModeType);
  const currentPage = filters.page || 1;

  return (
    <div className="min-bg-stone-50 bg-stone-50/50 py-8">
      <Container>
        
        {/* View Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                {language === 'bn' ? 'ময়মনসিংহ সিটি টু-লেট' : 'Mymensingh To-Let'}
              </span>
              {totalCount > 0 && (
                <span className="text-xs text-stone-500 font-medium">
                  {language === 'bn' ? `মোট ${totalCount} টি বাসা উপলব্ধ` : `${totalCount} listings available`}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              {language === 'bn' ? header.title_bn : header.title_en}
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              {language === 'bn' ? header.desc_bn : header.desc_en}
            </p>
          </div>

          {/* Share Filtered URL Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white text-stone-700 hover:text-emerald-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
              title="Share filtered results"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">
                    {language === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link Copied!'}
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>{language === 'bn' ? 'ফিল্টার লিংক শেয়ার' : 'Share Filter'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div ref={resultsContainerRef} className="bg-white rounded-2xl border border-stone-200 p-3 md:p-4 mb-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  language === 'bn' 
                    ? 'বাসার নাম, এলাকা, রোড নম্বর বা ল্যান্ডমার্ক দিয়ে খুঁজুন...' 
                    : 'Search by title, road, area, or landmark...'
                }
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-stone-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    handleFilterChange({ searchQuery: undefined, page: 1 });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[170px]">
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as ListingSortOption, page: 1 })}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="newest">
                    {language === 'bn' ? 'নতুন তালিকা আগে' : 'Newest First'}
                  </option>
                  <option value="rent_asc">
                    {language === 'bn' ? 'ভাড়া: কম থেকে বেশি' : 'Price: Low to High'}
                  </option>
                  <option value="rent_desc">
                    {language === 'bn' ? 'ভাড়া: বেশি থেকে কম' : 'Price: High to Low'}
                  </option>
                  <option value="popular">
                    {language === 'bn' ? 'সর্বাধিক ভিউ' : 'Most Viewed'}
                  </option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{language === 'bn' ? 'ফিল্টার' : 'Filters'}</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-white text-emerald-800 text-[11px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Active Filter Chips */}
          <div className="mt-3 border-t border-stone-100 pt-2">
            <ActiveFilterChips
              filters={filters}
              areas={areas}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleResetFilters}
              mode={mode}
            />
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Desktop Left Filter Sidebar (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <ListingsFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              areas={areas}
              totalResultsCount={totalCount}
              mode={mode}
            />
          </div>

          {/* Right Column: Listings Results & Pagination */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Loading Skeleton State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
                    <Skeleton className="w-full h-48 rounded-xl" />
                    <Skeleton className="w-24 h-4 rounded" />
                    <Skeleton className="w-full h-5 rounded" />
                    <Skeleton className="w-3/4 h-4 rounded" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="w-16 h-4 rounded" />
                      <Skeleton className="w-16 h-4 rounded" />
                      <Skeleton className="w-16 h-4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!isLoading && isError && (
              <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-semibold text-stone-900">
                  {language === 'bn' ? 'তথ্য লোড করতে সমস্যা হয়েছে' : 'Failed to load listings'}
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  {language === 'bn'
                    ? 'ইন্টারনেট সংযোগ বা সার্ভারে সমস্যা হতে পারে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
                    : 'A network or server error occurred. Please try again.'}
                </p>
                <Button
                  variant="default"
                  onClick={() => loadData(filters)}
                  className="bg-emerald-700 text-white rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && listings.length === 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-2xs">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Home className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  {language === 'bn' ? 'কোনো বাসা পাওয়া যায়নি' : 'No Listings Found'}
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  {language === 'bn'
                    ? 'আপনার ফিল্টারের সাথে মিলে এমন কোনো টু-লেট এই মুহূর্তে নেই। দয়া করে ফিল্টার পরিবর্তন বা রিসেট করে দেখুন।'
                    : 'We could not find any rental listings matching your exact filter criteria. Try loosening your filters or clearing search.'}
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}
                  </Button>
                </div>
              </div>
            )}

            {/* Listings Grid */}
            {!isLoading && !isError && listings.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onNavigate={onNavigate}
                      isFavorite={favorites.includes(listing.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>

                {/* Pagination Controls Bar */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl border border-stone-200 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                    
                    {/* Pagination Details */}
                    <p className="text-xs text-stone-500 font-medium">
                      {language === 'bn'
                        ? `মোট ${totalCount} টি বাসার মধ্যে ${(currentPage - 1) * 12 + 1}-${Math.min(currentPage * 12, totalCount)} টি দেখানো হচ্ছে`
                        : `Showing ${(currentPage - 1) * 12 + 1}-${Math.min(currentPage * 12, totalCount)} of ${totalCount} listings`}
                    </p>

                    {/* Pagination Page Number Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                          currentPage <= 1
                            ? 'border-stone-200 text-stone-300 cursor-not-allowed bg-stone-50'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-100 bg-white'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {language === 'bn' ? 'আগের পাতা' : 'Prev'}
                        </span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          // Show current page, edges, and adjacent pages
                          return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                        })
                        .map((pageNumber, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && pageNumber - prev > 1;

                          return (
                            <React.Fragment key={pageNumber}>
                              {showEllipsis && (
                                <span className="px-2 text-stone-400 text-xs select-none">...</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handlePageChange(pageNumber)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                  currentPage === pageNumber
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                          currentPage >= totalPages
                            ? 'border-stone-200 text-stone-300 cursor-not-allowed bg-stone-50'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-100 bg-white'
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {language === 'bn' ? 'পরের পাতা' : 'Next'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Mobile Filter Drawer Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Sliding Drawer Container */}
            <div className="relative ml-auto w-full max-w-md bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-200">
              <ListingsFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                areas={areas}
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setShowMobileFilters(false)}
                totalResultsCount={totalCount}
                mode={mode}
              />
            </div>
          </div>
        )}

      </Container>
    </div>
  );
};
