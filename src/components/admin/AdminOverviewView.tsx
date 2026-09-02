import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Home, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Eye, 
  TrendingUp, 
  MapPin, 
  Check, 
  X, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Flame,
  AlertCircle,
  FileCheck,
  ArrowUpRight
} from 'lucide-react';
import { AdminDashboardStats, Listing, ListingReport } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { 
  fetchAdminDashboardStats, 
  fetchAdminListings, 
  fetchAdminReportsWithListings,
  adminApproveListing,
  adminRejectListing
} from '../../lib/supabase';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ListingDetailModal } from './ListingDetailModal';
import { RejectReasonModal } from './RejectReasonModal';

interface AdminOverviewViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    reportedListings: 0,
    rejectedListings: 0,
    rentedListings: 0,
    verifiedOwners: 0,
  });

  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [recentReports, setRecentReports] = useState<ListingReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedListingForPreview, setSelectedListingForPreview] = useState<Listing | null>(null);
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, allListings, reps] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchAdminListings({ status: 'pending' }),
        fetchAdminReportsWithListings('pending'),
      ]);
      setStats(s);
      setPendingListings(allListings.slice(0, 5));
      setRecentReports(reps.slice(0, 4));
    } catch (e) {
      console.error('Error loading admin dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickApprove = async (id: string) => {
    setIsProcessing(true);
    await adminApproveListing(id);
    setIsProcessing(false);
    loadData();
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingListingId) return;
    setIsProcessing(true);
    await adminRejectListing(rejectingListingId, reason);
    setRejectingListingId(null);
    setIsProcessing(false);
    loadData();
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'bn' ? 'অ্যাডমিন নিয়ন্ত্রণ কেন্দ্র' : 'Admin Control Hub'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'bn' ? 'টু-লেট ময়মনসিংহ অ্যাডমিনিস্ট্রেশন' : 'ToLet Mymensingh Management'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {language === 'bn' 
              ? 'ময়মনসিংহ শহরের সকল টু-লেট বিজ্ঞাপন মডারেশন, নতুন লিস্টিং অনুমোদন, ইউজার ভেরিফিকেশন এবং অভিযোগ নিষ্পত্তি করুন।' 
              : 'Moderate listings across Mymensingh, verify landlords, audit pending submissions, and resolve user complaints.'}
          </p>
        </div>

        {/* Action shortcut pills */}
        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={() => onNavigate('admin/listings')}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold h-11 px-4 shadow-sm"
          >
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{language === 'bn' ? 'অপেক্ষমাণ লিস্টিং (' : 'Pending Queue ('}</span>
            <span className="font-extrabold">{toBengaliNumber(stats.pendingListings, language)}</span>
            <span>)</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate('admin/reports')}
            className="bg-rose-500/20 border-rose-500/40 hover:bg-rose-500/30 text-rose-200 rounded-2xl text-xs font-bold h-11 px-4"
          >
            <AlertTriangle className="h-4 w-4 mr-1.5 text-rose-400" />
            <span>{language === 'bn' ? 'রিপোর্ট সমূহ (' : 'Active Reports ('}</span>
            <span className="font-extrabold">{toBengaliNumber(stats.reportedListings, language)}</span>
            <span>)</span>
          </Button>
        </div>
      </div>

      {/* Primary Statistics Grid (5 Key Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Users */}
        <div 
          onClick={() => onNavigate('admin/users')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            {language === 'bn' ? 'মোট ব্যবহারকারী' : 'Total Users'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            {loading ? '...' : toBengaliNumber(stats.totalUsers, language)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
            {toBengaliNumber(stats.verifiedOwners, language)} {language === 'bn' ? 'ভেরিফাইড মালিক' : 'Verified Owners'}
          </span>
        </div>

        {/* Total Listings */}
        <div 
          onClick={() => onNavigate('admin/listings')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Home className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            {language === 'bn' ? 'মোট বিজ্ঞাপন' : 'Total Listings'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            {loading ? '...' : toBengaliNumber(stats.totalListings, language)}
          </div>
          <span className="text-[10px] text-stone-500 font-medium mt-1 inline-block">
            {toBengaliNumber(stats.rentedListings, language)} {language === 'bn' ? 'ভাড়া সম্পন্ন' : 'Rented'}
          </span>
        </div>

        {/* Pending Moderation */}
        <div 
          onClick={() => onNavigate('admin/listings')}
          className="bg-amber-50/70 p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900">
              Action Req.
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
            {language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Listings'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
            {loading ? '...' : toBengaliNumber(stats.pendingListings, language)}
          </div>
          <span className="text-[10px] text-amber-700 font-bold mt-1 inline-block">
            {language === 'bn' ? 'রিভিউ করুন →' : 'Review Queue →'}
          </span>
        </div>

        {/* Approved Listings */}
        <div 
          onClick={() => onNavigate('admin/listings')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            {language === 'bn' ? 'অনুমোদিত (লাইভ)' : 'Approved Listings'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            {loading ? '...' : toBengaliNumber(stats.approvedListings, language)}
          </div>
          <span className="text-[10px] text-teal-600 font-bold mt-1 inline-block">
            {language === 'bn' ? 'পাবলিক পেজে সক্রিয়' : 'Active in search'}
          </span>
        </div>

        {/* Reported Listings */}
        <div 
          onClick={() => onNavigate('admin/reports')}
          className="bg-rose-50/70 p-4 sm:p-5 rounded-3xl border border-rose-200 shadow-2xs hover:border-rose-400 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            {stats.reportedListings > 0 && (
              <span className="h-3 w-3 rounded-full bg-rose-600 animate-ping" />
            )}
          </div>
          <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block">
            {language === 'bn' ? 'রিপোর্ট ও কমপ্লেইন' : 'Reported Listings'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-950 mt-1">
            {loading ? '...' : toBengaliNumber(stats.reportedListings, language)}
          </div>
          <span className="text-[10px] text-rose-700 font-bold mt-1 inline-block">
            {language === 'bn' ? 'অভিযোগ নিষ্পত্তি করুন →' : 'Resolve Reports →'}
          </span>
        </div>

      </div>

      {/* Middle Moderation Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Moderation Queue (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900">
                  {language === 'bn' ? 'নতুন বিজ্ঞাপন মডারেশন কিউ' : 'Pending Listing Submissions'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'মালিকদের সাবমিট করা বিজ্ঞাপন যাচাই করুন' : 'Review & moderate submissions before public display'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('admin/listings')}
              className="rounded-xl border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          {pendingListings.length === 0 ? (
            <div className="py-10 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-stone-700">
                {language === 'bn' ? 'বর্তমানে কোনো অপেক্ষমাণ বিজ্ঞাপন নেই!' : 'No pending listings requiring review.'}
              </p>
              <p className="text-[11px] text-stone-500">
                {language === 'bn' ? 'সকল নতুন বিজ্ঞাপন নির্ধারিত সময়ে অনুমোদিত হয়েছে।' : 'All owner submissions are up to date.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingListings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200 hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200'}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover shrink-0 border border-stone-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          {listing.property_type.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-stone-500 truncate">
                          {listing.area_name_bn}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate mt-0.5">
                        {listing.title_bn}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
                        <span className="font-bold text-emerald-700">
                          {formatPrice(listing.rent_monthly, language)}
                        </span>
                        <span>•</span>
                        <span className="text-stone-500">মালিক: {listing.contact_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedListingForPreview(listing)}
                      className="h-8 px-2.5 rounded-xl border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>প্রিভিউ</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectingListingId(listing.id)}
                      className="h-8 px-2.5 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                    >
                      <X className="h-3.5 w-3.5 mr-1 text-rose-500" />
                      <span>রিজেক্ট</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleQuickApprove(listing.id)}
                      disabled={isProcessing}
                      className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span>অনুমোদন</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Reports & Quick Management */}
        <div className="space-y-6">
          
          {/* Active Reports Box */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h3 className="font-extrabold text-base text-stone-900">
                  {language === 'bn' ? 'সাম্প্রতিক রিপোর্ট' : 'Flagged Reports'}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('admin/reports')}
                className="rounded-xl border-stone-200 text-xs font-bold text-stone-700"
              >
                <span>সব দেখুন</span>
              </Button>
            </div>

            {recentReports.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-100">
                কোনো অনিষ্পন্ন রিপোর্ট নেই।
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentReports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => onNavigate('admin/reports')}
                    className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 hover:border-rose-300 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold uppercase">
                        {rep.reason.replace('_', ' ')}
                      </span>
                      <span className="text-stone-500 text-[10px]">
                        {new Date(rep.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-900 line-clamp-1">
                      {rep.listing?.title_bn || 'বিজ্ঞাপন অভিযোগ'}
                    </p>
                    <p className="text-[11px] text-stone-600 line-clamp-2">
                      {rep.comment || 'কোনো মন্তব্য নেই'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-stone-900 text-white rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-stone-300 uppercase tracking-wider">
              {language === 'bn' ? 'সিস্টেম অ্যাকশন ও শর্টকাট' : 'Quick Admin Actions'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('admin/areas')}
                className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-left transition-all border border-stone-700 text-xs font-bold text-stone-200 flex flex-col gap-1 cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>এলাকা কনফিগারেশন</span>
              </button>
              <button
                onClick={() => onNavigate('admin/amenities')}
                className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-left transition-all border border-stone-700 text-xs font-bold text-stone-200 flex flex-col gap-1 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>সুবিধা তালিকা</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modals */}
      <ListingDetailModal
        listing={selectedListingForPreview}
        isOpen={!!selectedListingForPreview}
        onClose={() => setSelectedListingForPreview(null)}
        onApprove={async (id) => {
          await handleQuickApprove(id);
          setSelectedListingForPreview(null);
        }}
        onReject={(id) => {
          setSelectedListingForPreview(null);
          setRejectingListingId(id);
        }}
      />

      <RejectReasonModal
        isOpen={!!rejectingListingId}
        onClose={() => setRejectingListingId(null)}
        onConfirm={handleConfirmReject}
        isSubmitting={isProcessing}
      />

    </div>
  );
};
