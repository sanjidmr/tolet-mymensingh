import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Filter, 
  Check, 
  X, 
  Star, 
  ShieldCheck, 
  Trash2, 
  Eye, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  MoreVertical, 
  SlidersHorizontal,
  PhoneCall,
  Image as ImageIcon
} from 'lucide-react';
import { AdminUserItem, Listing, PropertyType } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { 
  fetchAdminListings, 
  adminApproveListing, 
  adminRejectListing, 
  adminToggleFeaturedListing, 
  adminToggleVerifiedListing, 
  adminDeleteListing,
  fetchAdminAreas,
  fetchAdminUsers
} from '../../lib/supabase';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ListingDetailModal } from './ListingDetailModal';
import { RejectReasonModal } from './RejectReasonModal';
import { OwnerInspectionModal } from './OwnerInspectionModal';

interface AdminListingsViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const AdminListingsView: React.FC<AdminListingsViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Inspectors
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);
  const [rejectListingId, setRejectListingId] = useState<string | null>(null);
  const [inspectedUser, setInspectedUser] = useState<AdminUserItem | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminListings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        property_type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchQuery || undefined,
      });
      setListings(data);
    } catch (err) {
      console.error('Error loading admin listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    await adminApproveListing(id);
    setIsProcessing(false);
    loadListings();
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectListingId) return;
    setIsProcessing(true);
    await adminRejectListing(rejectListingId, reason);
    setRejectListingId(null);
    setIsProcessing(false);
    loadListings();
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    await adminToggleFeaturedListing(id, isFeatured);
    loadListings();
  };

  const handleToggleVerified = async (id: string, isVerified: boolean) => {
    await adminToggleVerifiedListing(id, isVerified);
    loadListings();
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি মুছে ফেলতে চান?' : 'Are you sure you want to permanently delete this listing?')) {
      return;
    }
    setIsProcessing(true);
    await adminDeleteListing(id);
    setIsProcessing(false);
    loadListings();
  };

  const handleInspectOwner = async (ownerId: string) => {
    const users = await fetchAdminUsers();
    const owner = users.find((u) => u.id === ownerId);
    if (owner) {
      setInspectedUser(owner);
    } else {
      // Create fallback profile representation
      const current = listings.find((l) => l.owner_id === ownerId);
      setInspectedUser({
        id: ownerId,
        name: current?.contact_name || 'বাড়ির মালিক',
        phone: current?.contact_phone || 'N/A',
        role: 'owner',
        is_verified: current?.is_owner_verified || false,
        whatsapp_number: current?.contact_whatsapp,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const countsByStatus = {
    all: listings.length,
    pending: listings.filter((l) => l.status === 'pending').length,
    approved: listings.filter((l) => l.status === 'approved').length,
    rejected: listings.filter((l) => l.status === 'rejected').length,
    rented: listings.filter((l) => l.status === 'rented').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900">
              {language === 'bn' ? 'বিজ্ঞাপন মডারেশন ও ব্যবস্থাপনা' : 'Listing Moderation & Audits'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-stone-900 text-white">
              {toBengaliNumber(listings.length, language)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'bn' ? 'সকল লিস্টিং যাচাই, অনুমোদন, রিজেক্ট বা ফিচারড করুন' : 'Review, approve, feature, verify or remove rental properties'}
          </p>
        </div>

        {/* Quick status counters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>অপেক্ষমাণ: {toBengaliNumber(countsByStatus.pending, language)}</span>
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>লাইভ: {toBengaliNumber(countsByStatus.approved, language)}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label_bn: 'সকল বিজ্ঞাপন', label_en: 'All Listings' },
            { id: 'pending', label_bn: 'অপেক্ষমাণ (Pending)', label_en: 'Pending' },
            { id: 'approved', label_bn: 'অনুমোদিত (Live)', label_en: 'Approved' },
            { id: 'rejected', label_bn: 'প্রত্যাখ্যাত (Rejected)', label_en: 'Rejected' },
            { id: 'rented', label_bn: 'ভাড়া সম্পন্ন (Rented)', label_en: 'Rented' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {language === 'bn' ? tab.label_bn : tab.label_en}
            </button>
          ))}
        </div>

        {/* Search & Property Type Filter */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'শিরোনাম, এলাকা, ফোন বা মালিকের নাম দিয়ে খুঁজুন...' : 'Search by title, phone, area, or owner...'}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label={language === 'bn' ? 'প্রপার্টি টাইপ নির্বাচন' : 'Filter by property type'}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{language === 'bn' ? 'সব ধরনের বাসা' : 'All Property Types'}</option>
              <option value="family">Family (ফ্যামিলি)</option>
              <option value="bachelor">Bachelor (ব্যাচেলর)</option>
              <option value="sublet">Sublet (সাবলেট)</option>
              <option value="hostel">Hostel (ছাত্রাবাস)</option>
              <option value="mess">Mess (মেস)</option>
              <option value="seat">Seat (সিট)</option>
              <option value="office">Office / Commercial</option>
            </select>

            <Button
              type="submit"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold px-4 h-9"
            >
              {language === 'bn' ? 'ফিল্টার' : 'Search'}
            </Button>
          </div>
        </form>
      </div>

      {/* Listings Moderation List */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          বিজ্ঞাপনসমূহ লোড হচ্ছে...
        </div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-stone-200 p-8 space-y-3">
          <Home className="h-10 w-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {language === 'bn' ? 'কোনো বিজ্ঞাপন পাওয়া যায়নি' : 'No listings found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {language === 'bn' ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।' : 'Try adjusting the status or search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Info: Thumbnail, Title, Specs */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                
                {/* Thumbnail with photo count */}
                <div className="relative h-20 w-24 sm:h-24 sm:w-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img
                    src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300'}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold flex items-center gap-0.5">
                    <ImageIcon className="h-2.5 w-2.5" />
                    <span>{item.images?.length || 1}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 space-y-1 flex-1">
                  
                  {/* Status & Category Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      item.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : item.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {item.status}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                      {item.property_type.toUpperCase()}
                    </span>

                    {item.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Featured
                      </span>
                    )}

                    {item.is_verified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                    {item.title_bn}
                  </h3>

                  {/* Location & Rent */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {formatPrice(item.rent_monthly, language)}/মাস
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-stone-500">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" />
                      {item.area_name_bn}
                    </span>
                    <span>•</span>
                    <span className="text-stone-500">
                      {item.bedrooms ? `${toBengaliNumber(item.bedrooms, language)} বেড` : ''} {item.bathrooms ? `${toBengaliNumber(item.bathrooms, language)} বাথ` : ''}
                    </span>
                  </div>

                  {/* Owner snippet */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5">
                    <span>মালিক: <b className="text-stone-800">{item.contact_name}</b> ({item.contact_phone})</span>
                    <button
                      onClick={() => handleInspectOwner(item.owner_id)}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      [মালিক প্রোফাইল]
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100 shrink-0">
                
                {/* Preview Inspector */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewListing(item)}
                  className="h-8 px-2.5 rounded-xl border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
                  title="Preview full details and images"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  <span>প্রিভিউ</span>
                </Button>

                {/* Toggle Featured */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleFeatured(item.id, !item.is_featured)}
                  className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                    item.is_featured ? 'bg-amber-50 border-amber-300 text-amber-800' : 'border-stone-200 text-stone-600'
                  }`}
                  title="Toggle featured status"
                >
                  <Star className={`h-3.5 w-3.5 mr-1 ${item.is_featured ? 'fill-current text-amber-500' : ''}`} />
                  <span>{item.is_featured ? 'Featured' : 'Feature'}</span>
                </Button>

                {/* Toggle Verified */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleVerified(item.id, !item.is_verified)}
                  className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                    item.is_verified ? 'bg-blue-50 border-blue-300 text-blue-800' : 'border-stone-200 text-stone-600'
                  }`}
                  title="Toggle verified badge"
                >
                  <ShieldCheck className={`h-3.5 w-3.5 mr-1 ${item.is_verified ? 'text-blue-600' : ''}`} />
                  <span>{item.is_verified ? 'Verified' : 'Verify'}</span>
                </Button>

                {/* Reject */}
                {item.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectListingId(item.id)}
                    className="h-8 px-2.5 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                  >
                    <X className="h-3.5 w-3.5 mr-1 text-rose-500" />
                    <span>রিজেক্ট</span>
                  </Button>
                )}

                {/* Approve */}
                {item.status !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(item.id)}
                    disabled={isProcessing}
                    className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    <span>Approve</span>
                  </Button>
                )}

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteListing(item.id)}
                  className="h-8 w-8 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Delete listing"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals & Dialogs */}
      <ListingDetailModal
        listing={previewListing}
        isOpen={!!previewListing}
        onClose={() => setPreviewListing(null)}
        onApprove={async (id) => {
          await handleApprove(id);
          setPreviewListing(null);
        }}
        onReject={(id) => {
          setPreviewListing(null);
          setRejectListingId(id);
        }}
        onToggleFeatured={handleToggleFeatured}
        onToggleVerified={handleToggleVerified}
        onDelete={async (id) => {
          await handleDeleteListing(id);
          setPreviewListing(null);
        }}
        onInspectOwner={handleInspectOwner}
      />

      <RejectReasonModal
        isOpen={!!rejectListingId}
        onClose={() => setRejectListingId(null)}
        onConfirm={handleConfirmReject}
        isSubmitting={isProcessing}
      />

      <OwnerInspectionModal
        user={inspectedUser}
        isOpen={!!inspectedUser}
        onClose={() => setInspectedUser(null)}
        onSelectListingForPreview={(l) => {
          setInspectedUser(null);
          setPreviewListing(l);
        }}
        onUserUpdated={loadListings}
      />

    </div>
  );
};
