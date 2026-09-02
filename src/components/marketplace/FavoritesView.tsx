import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Trash2, 
  ArrowLeft, 
  Building2, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  LogIn, 
  SlidersHorizontal,
  Share2,
  CheckCircle2,
  AlertCircle,
  Home,
  Users,
  Bed,
  Layers
} from 'lucide-react';
import { Listing, PropertyType } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { fetchFavoriteListingsByIds, fetchUserFavoriteListings } from '../../lib/supabase/services/favorites';
import { Container } from '../layout/Container';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { ListingCard } from './ListingCard';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../ui/dialog';
import { useSEO } from '../../lib/useSEO';

interface FavoritesViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onClearAllFavorites?: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onNavigate,
  favorites = [],
  onToggleFavorite,
  onClearAllFavorites,
}) => {
  const { language, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  useSEO({
    title: language === 'bn' ? 'সংরক্ষিত পছন্দের তালিকা' : 'Saved Favorite Listings',
    description: 'Saved rental properties in Mymensingh',
    noindex: true,
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rent_asc' | 'rent_desc'>('newest');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch full details of all favorited listings
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadFavorites = async () => {
      try {
        if (isAuthenticated && user?.id) {
          // Fetch from Supabase for logged-in user
          const userFavs = await fetchUserFavoriteListings(user.id);
          if (isMounted) {
            if (userFavs && userFavs.length > 0) {
              setListings(userFavs);
            } else {
              // Fallback to fetching by local IDs
              const byIds = await fetchFavoriteListingsByIds(favorites);
              if (isMounted) setListings(byIds);
            }
          }
        } else {
          // Guest mode: fetch listings by local array of IDs
          const byIds = await fetchFavoriteListingsByIds(favorites);
          if (isMounted) setListings(byIds);
        }
      } catch (err) {
        console.error('Error fetching favorites view data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [favorites, isAuthenticated, user?.id]);

  // Handle optimistic local remove
  const handleRemoveFavorite = (id: string) => {
    onToggleFavorite(id);
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (onClearAllFavorites) {
      onClearAllFavorites();
    } else {
      favorites.forEach((id) => onToggleFavorite(id));
    }
    setListings([]);
    setIsClearConfirmOpen(false);
  };

  const handleShareList = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Filter and Sort in-memory
  const filteredListings = useMemo(() => {
    // Only display items that are currently in favorites state
    let list = listings.filter((l) => favorites.includes(l.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title_bn.toLowerCase().includes(q) ||
          (l.title_en && l.title_en.toLowerCase().includes(q)) ||
          l.area_name_bn.toLowerCase().includes(q) ||
          (l.area_name_en && l.area_name_en.toLowerCase().includes(q)) ||
          l.address_street_bn.toLowerCase().includes(q)
      );
    }

    if (selectedType !== 'all') {
      list = list.filter((l) => l.property_type === selectedType);
    }

    // Sort
    const sorted = [...list];
    if (sortBy === 'rent_asc') {
      sorted.sort((a, b) => a.rent_monthly - b.rent_monthly);
    } else if (sortBy === 'rent_desc') {
      sorted.sort((a, b) => b.rent_monthly - a.rent_monthly);
    } else {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [listings, favorites, searchQuery, selectedType, sortBy]);

  return (
    <div className="py-6 sm:py-10 bg-stone-50/60 min-h-[80vh]">
      <Container>
        
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('home')}
              className="h-9 px-3 rounded-xl border-stone-200 text-stone-700 hover:text-emerald-700 bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{language === 'bn' ? 'হোমে ফিরুন' : 'Back to Home'}</span>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {t.favorites}
                </h1>
                <Badge className="bg-rose-500 text-white font-bold text-xs px-2 py-0.5">
                  {favorites.length}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'bn' 
                  ? 'আপনার পছন্দ করা টু-লেট, মেস ও হোস্টেলের তালিকা' 
                  : 'Your shortlisted rentals, messes, and hostels'}
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareList}
                className="h-9 px-3 rounded-xl border-stone-200 text-xs font-semibold bg-white text-stone-700 hover:text-emerald-700 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
                <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে!' : 'Link Copied!') : (language === 'bn' ? 'শেয়ার করুন' : 'Share List')}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearConfirmOpen(true)}
                className="h-9 px-3 rounded-xl border-stone-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 bg-white cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                <span>{language === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Guest Cloud Sync Notice */}
        {!isAuthenticated && favorites.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 fill-white" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-stone-900">
                  {language === 'bn' 
                    ? 'গেস্ট মোডে সেভ করা আছে (শুধুমাত্র এই ডিভাইসে)' 
                    : 'Locally Saved Favorites (Guest Mode)'}
                </p>
                <p className="text-stone-600 mt-0.5">
                  {language === 'bn'
                    ? 'লগইন করলে আপনার পছন্দের তালিকাটি অ্যাকাউন্টে স্থায়ীভাবে সেভ হয়ে যাবে।'
                    : 'Sign in to sync your saved listings permanently across all your devices.'}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onNavigate('login')}
              className="h-8 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              <span>{language === 'bn' ? 'লগইন করে সিঙ্ক করুন' : 'Sign In to Sync'}</span>
            </Button>
          </div>
        )}

        {/* Search, Filter & Sort Controls */}
        {favorites.length > 0 && (
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs mb-6 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              
              {/* Search Within Saved */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'পছন্দের তালিকায় খুঁজুন (এলাকা বা শিরোনাম)...' : 'Search within your saved listings...'}
                  className="pl-9 h-10 rounded-xl border-stone-200 text-xs bg-stone-50/50 focus:bg-white"
                />
              </div>

              {/* Property Type Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: language === 'bn' ? 'সকল' : 'All' },
                  { id: 'apartment', label: language === 'bn' ? 'ফ্ল্যাট' : 'Apartment' },
                  { id: 'mess', label: language === 'bn' ? 'মেস' : 'Mess' },
                  { id: 'hostel', label: language === 'bn' ? 'হোস্টেল' : 'Hostel' },
                  { id: 'sublet', label: language === 'bn' ? 'সাবলেট' : 'Sublet' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedType === type.id
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="w-full sm:w-auto shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 cursor-pointer w-full focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="newest">{language === 'bn' ? 'সর্বশেষ যুক্ত' : 'Recently Added'}</option>
                  <option value="rent_asc">{language === 'bn' ? 'ভাড়া: কম থেকে বেশি' : 'Price: Low to High'}</option>
                  <option value="rent_desc">{language === 'bn' ? 'ভাড়া: বেশি থেকে কম' : 'Price: High to Low'}</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3">
                <Skeleton className="aspect-16/10 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={true}
                onSelect={(l) => {
                  const prefix = l.property_type === 'mess' ? 'mess' : l.property_type === 'hostel' ? 'hostel' : l.property_type === 'sublet' ? 'sublet' : 'tolet';
                  onNavigate(`${prefix}/${l.slug || l.id}`);
                }}
                onToggleFavorite={handleRemoveFavorite}
              />
            ))}
          </div>
        ) : favorites.length > 0 && filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
            <Search className="h-10 w-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-stone-800 text-base">
              {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching saved listings'}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'bn' ? 'অনুসন্ধানের ফিল্টার বা কিওয়ার্ড পরিবর্তন করে দেখুন।' : 'Try changing your search keywords or filter criteria.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className="rounded-xl border-stone-200 text-xs"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filter'}
            </Button>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-8 max-w-2xl mx-auto space-y-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-rose-50 border-2 border-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                {language === 'bn' ? 'আপনার পছন্দের তালিকায় কোনো বাসা নেই' : 'Your saved list is empty'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {language === 'bn'
                  ? 'যেকোনো লিস্টিং কার্ডে বা বিস্তারিত পাতায় থাকা হার্ট (❤️) আইকনে ক্লিক করে পছন্দের বাসাগুলো এখানে সংরক্ষণ করে রাখুন।'
                  : 'Click the heart (❤️) icon on any listing card or details page to easily keep track of properties you like.'}
              </p>
            </div>

            {/* Quick Explore Shortcuts */}
            <div className="pt-2">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                {language === 'bn' ? 'ময়মনসিংহের বিভিন্ন ক্যাটাগরি খুঁজুন' : 'Explore Categories in Mymensingh'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => onNavigate('tolet')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-10 px-4 flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  <span>{language === 'bn' ? 'ফ্যামিলি ও ব্যাচেলর টু-লেট' : 'Family & Bachelor Rentals'}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onNavigate('mess')}
                  className="rounded-xl border-stone-200 text-stone-700 hover:text-emerald-700 text-xs font-semibold h-10 px-4 flex items-center gap-2 bg-white"
                >
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'মেস ও সিট' : 'Messes & Seats'}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onNavigate('hostel')}
                  className="rounded-xl border-stone-200 text-stone-700 hover:text-emerald-700 text-xs font-semibold h-10 px-4 flex items-center gap-2 bg-white"
                >
                  <Bed className="h-4 w-4 text-emerald-600" />
                  <span>{language === 'bn' ? 'ছাত্র/ছাত্রী হোস্টেল' : 'Student Hostels'}</span>
                </Button>
              </div>
            </div>

          </div>
        )}

        {/* Clear All Confirmation Dialog */}
        <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
          <DialogContent className="sm:max-w-md bg-white rounded-2xl border-stone-200">
            <DialogHeader>
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                <Trash2 className="h-5 w-5" />
              </div>
              <DialogTitle className="text-base font-bold text-stone-900">
                {language === 'bn' ? 'পছন্দের তালিকা খালি করবেন?' : 'Clear all saved favorites?'}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600">
                {language === 'bn'
                  ? 'আপনার শর্টলিস্টে থাকা সকল বিজ্ঞাপন মুছে যাবে। আপনি কি নিশ্চিত?'
                  : 'This will remove all shortlisted properties from your saved favorites.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearConfirmOpen(false)}
                className="h-9 px-4 rounded-xl border-stone-200 text-xs"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                size="sm"
                onClick={handleClearAll}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Clear All'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </Container>
    </div>
  );
};
