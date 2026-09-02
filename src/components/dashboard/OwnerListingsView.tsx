import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Eye, 
  AlertCircle, 
  Check, 
  X, 
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Flame,
  Home,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { fetchOwnerListings, deleteListing, toggleListingRented } from '../../lib/supabase/services/listings';
import { Listing, ListingStatus } from '../../types';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Container } from '../layout/Container';
import { useSEO } from '../../lib/useSEO';

interface OwnerListingsViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const OwnerListingsView: React.FC<OwnerListingsViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();

  useSEO({
    title: language === 'bn' ? 'আমার বিজ্ঞাপনসমূহ' : 'My Listings',
    noindex: true,
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const ownerId = user?.id || profile?.id || 'demo-owner-mymensingh';

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await fetchOwnerListings(ownerId);
      setListings(data);
    } catch (err) {
      console.error('Failed to load owner listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [ownerId]);

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      const success = await deleteListing(id, ownerId);
      if (success) {
        setListings((prev) => prev.filter((l) => l.id !== id));
        setFeedbackMessage({
          type: 'success',
          text: language === 'bn' ? 'বিজ্ঞাপনটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Listing deleted successfully.',
        });
      } else {
        setFeedbackMessage({
          type: 'error',
          text: language === 'bn' ? 'বিজ্ঞাপন মুছতে সমস্যা হয়েছে।' : 'Failed to delete listing.',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
      setDeleteConfirmId(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleToggleRented = async (id: string, currentStatus: ListingStatus) => {
    setActionLoading(id);
    const isCurrentlyRented = currentStatus === 'rented';
    try {
      const success = await toggleListingRented(id, ownerId, !isCurrentlyRented);
      if (success) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: isCurrentlyRented ? 'pending' : 'rented' } : l))
        );
        setFeedbackMessage({
          type: 'success',
          text: isCurrentlyRented
            ? (language === 'bn' ? 'বিজ্ঞাপনটি পুনরায় রিভিউয়ের জন্য পাঠানো হয়েছে।' : 'Listing reopened for review.')
            : (language === 'bn' ? 'বিজ্ঞাপনটি "ভাড়া হয়ে গেছে" হিসেবে চিহ্নিত করা হয়েছে।' : 'Listing marked as rented.'),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.title_bn.toLowerCase().includes(q) ||
        item.title_en.toLowerCase().includes(q) ||
        item.address_street_bn.toLowerCase().includes(q) ||
        item.area_name_bn.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const counts = {
    all: listings.length,
    approved: listings.filter((l) => l.status === 'approved').length,
    pending: listings.filter((l) => l.status === 'pending').length,
    rented: listings.filter((l) => l.status === 'rented').length,
    draft: listings.filter((l) => l.status === 'draft').length,
  };

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'লাইভ / অনুমোদিত' : 'Approved (Live)'}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>{language === 'bn' ? 'মডারেশন অপেক্ষমাণ' : 'Pending Moderation'}</span>
          </span>
        );
      case 'rented':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <Check className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'ভাড়া সম্পন্ন' : 'Rented'}</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <FileText className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'খসড়া (Draft)' : 'Draft'}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-stone-50/60 min-h-[calc(100vh-200px)]">
      <Container>
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="h-9 px-3 rounded-xl border-stone-200 bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                {language === 'bn' ? 'আমার টু-লেট বিজ্ঞাপনসমূহ' : 'My Rental Listings'}
              </h1>
              <p className="text-xs text-stone-500">
                {language === 'bn'
                  ? 'আপনার পোস্টকৃত সকল বাসা, মেস ও ফ্ল্যাটের তালিকা ও পরিচালনা'
                  : 'Manage, edit, and track status of all your posted rental properties'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => onNavigate('dashboard/listings/new')}
            className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs gap-2 shrink-0"
          >
            <PlusCircle className="h-5 w-5" />
            <span>{language === 'bn' ? 'নতুন বিজ্ঞাপন যোগ করুন' : 'Post New Listing'}</span>
          </Button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-center justify-between text-sm font-bold border transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-2 sm:p-3 mb-6 shadow-xs flex flex-wrap items-center gap-1 sm:gap-2">
          {[
            { id: 'all', labelBn: 'সকল বিজ্ঞাপন', labelEn: 'All Listings', count: counts.all },
            { id: 'approved', labelBn: 'অনুমোদিত (লাইভ)', labelEn: 'Live / Approved', count: counts.approved },
            { id: 'pending', labelBn: 'মডারেশনে', labelEn: 'Pending Review', count: counts.pending },
            { id: 'rented', labelBn: 'ভাড়া সম্পন্ন', labelEn: 'Rented', count: counts.rented },
            { id: 'draft', labelBn: 'খসড়া', labelEn: 'Drafts', count: counts.draft },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-700'
                }`}
              >
                {toBengaliNumber(tab.count, language)}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'বিজ্ঞাপনের নাম, এলাকা বা ঠিকানা দিয়ে খুঁজুন...'
                : 'Search listings by title, area, or address...'
            }
            className="w-full h-11 pl-10 pr-4 bg-white rounded-xl border border-stone-200 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
          />
        </div>

        {/* Listing Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500">
              {language === 'bn' ? 'বিজ্ঞাপন লোড হচ্ছে...' : 'Loading your properties...'}
            </p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="space-y-4">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Core Details */}
                <div className="flex items-start gap-4 min-w-0 w-full md:w-auto">
                  <div className="relative h-20 w-24 sm:h-24 sm:w-32 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200/80">
                    <img
                      src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop'}
                      alt={item.title_bn}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {item.images?.length || 1} 📷
                    </div>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(item.status)}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {item.property_type}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                      {language === 'bn' ? item.title_bn : item.title_en || item.title_bn}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        <span>{item.area_name_bn}</span>
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {formatPrice(item.rent_monthly, language)}
                        <span className="text-[10px] font-normal text-stone-500"> /মাস</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-stone-500">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{toBengaliNumber(item.views_count || 0, language)} ভিউ</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 justify-end">
                  {/* Mark as Rented Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading === item.id}
                    onClick={() => handleToggleRented(item.id, item.status)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      item.status === 'rented'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {item.status === 'rented'
                        ? (language === 'bn' ? 'পুনরায় চালু করুন' : 'Reopen')
                        : (language === 'bn' ? 'ভাড়া হয়ে গেছে' : 'Mark Rented')}
                    </span>
                  </Button>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('dashboard/listings/edit', { id: item.id })}
                    className="h-9 px-3 rounded-xl text-xs font-bold border-stone-200 hover:border-stone-300 bg-white text-stone-800"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1 text-stone-500" />
                    <span>{language === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                  </Button>

                  {/* Delete Button */}
                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        disabled={actionLoading === item.id}
                        onClick={() => handleDelete(item.id)}
                        className="h-9 px-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                      >
                        {actionLoading === item.id ? '...' : (language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Confirm')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmId(null)}
                        className="h-9 px-2 rounded-xl text-xs border-stone-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="h-9 px-2.5 rounded-xl text-xs font-bold border-rose-100 hover:bg-rose-50 text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-10 text-center space-y-4 shadow-xs">
            <Building2 className="h-12 w-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">
              {language === 'bn' ? 'কোনো বিজ্ঞাপন পাওয়া যায়নি' : 'No listings found'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {language === 'bn'
                ? 'আপনার টু-লেট বিজ্ঞাপন যুক্ত করুন যাতে ময়মনসিংহের হাজারো সম্ভাব্য ভাড়াটিয়া তা সহজে খুঁজে পেতে পারে।'
                : 'Post your rental listing so that thousands of prospective tenants in Mymensingh can connect with you.'}
            </p>
            <Button
              onClick={() => onNavigate('dashboard/listings/new')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>{language === 'bn' ? 'প্রথম বিজ্ঞাপন দিন' : 'Create First Listing'}</span>
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};
