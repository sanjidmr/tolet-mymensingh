import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Home, 
  Clock, 
  Check, 
  X, 
  MessageSquare, 
  User, 
  PhoneCall, 
  ShieldAlert, 
  Filter,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Listing, ListingReport, ReportReason, ReportStatus } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { 
  fetchAdminReportsWithListings, 
  adminResolveReport,
  adminRejectListing,
  adminDeleteListing
} from '../../lib/supabase';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ListingDetailModal } from './ListingDetailModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

interface AdminReportsViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  const [reports, setReports] = useState<ListingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('pending');

  // Modals
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);
  const [activeResolutionReport, setActiveResolutionReport] = useState<ListingReport | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [listingAction, setListingAction] = useState<'none' | 'reject' | 'remove'>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReportsWithListings(
        statusFilter !== 'all' ? statusFilter : undefined
      );
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const handleDismissReport = async (reportId: string) => {
    setIsProcessing(true);
    await adminResolveReport(reportId, 'dismiss', 'False alarm or dismissed by admin');
    setIsProcessing(false);
    loadReports();
  };

  const handleOpenResolveModal = (report: ListingReport) => {
    setActiveResolutionReport(report);
    setModeratorNotes(report.moderator_notes || '');
    setListingAction('none');
  };

  const handleConfirmResolve = async () => {
    if (!activeResolutionReport) return;
    setIsProcessing(true);
    await adminResolveReport(
      activeResolutionReport.id,
      'resolve',
      moderatorNotes || 'অভিযোগ নিষ্পত্তি করা হয়েছে।',
      listingAction === 'none' ? undefined : listingAction
    );
    setActiveResolutionReport(null);
    setIsProcessing(false);
    loadReports();
  };

  const reasonLabels: Record<ReportReason, { bn: string; en: string; color: string }> = {
    fake_listing: { bn: 'ভুয়া বিজ্ঞাপন', en: 'Fake Listing', color: 'bg-rose-100 text-rose-900 border-rose-200' },
    wrong_phone: { bn: 'ভুল ফোন নম্বর', en: 'Wrong Phone Number', color: 'bg-amber-100 text-amber-900 border-amber-200' },
    already_rented: { bn: 'বাসা ইতোমধ্যে ভাড়া হয়ে গেছে', en: 'Already Rented', color: 'bg-blue-100 text-blue-900 border-blue-200' },
    scam: { bn: 'প্রতারণা / অগ্রিম টাকা দাবি', en: 'Scam / Fraud Attempt', color: 'bg-red-200 text-red-950 border-red-300' },
    incorrect_info: { bn: 'ভুল বা মিথ্যা তথ্য', en: 'Incorrect Information', color: 'bg-orange-100 text-orange-900 border-orange-200' },
    inappropriate_content: { bn: 'আপত্তিকর কন্টেন্ট বা ছবি', en: 'Inappropriate Content', color: 'bg-purple-100 text-purple-900 border-purple-200' },
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900">
              {language === 'bn' ? 'রিপোর্ট ও অভিযোগ ব্যবস্থাপনা' : 'Listing Reports & Dispute Moderation'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">
              {toBengaliNumber(reports.length, language)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'bn' 
              ? 'ব্যবহারকারীদের পাঠানো অভিযোগ যাচাই করুন, বিজ্ঞাপন অপসারণ বা সংশোধনের পদক্ষেপ নিন' 
              : 'Review user-flagged listings, verify authenticity, and take moderation action'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'pending', label_bn: 'অপেক্ষমাণ রিপোর্ট (Action Req.)', label_en: 'Pending Review', count: pendingCount },
            { id: 'all', label_bn: 'সকল রিপোর্ট', label_en: 'All Reports' },
            { id: 'reviewed', label_bn: 'রিভিউকৃত', label_en: 'Reviewed' },
            { id: 'resolved', label_bn: 'নিষ্পত্তিকৃত (Resolved)', label_en: 'Resolved' },
            { id: 'dismissed', label_bn: 'বাতিলকৃত (Dismissed)', label_en: 'Dismissed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>{language === 'bn' ? tab.label_bn : tab.label_en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reports Listing */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          রিপোর্ট লোড হচ্ছে...
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-stone-200 p-8 space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {language === 'bn' ? 'কোনো অভিযোগ বা রিপোর্ট নেই!' : 'No reports found'}
          </h3>
          <p className="text-xs text-stone-500">
            {language === 'bn' ? 'এই ক্যাটাগরিতে বর্তমানে কোনো অনিষ্পন্ন রিপোর্ট নেই।' : 'No reports currently require action in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => {
            const reasonMeta = reasonLabels[rep.reason] || {
              bn: rep.reason,
              en: rep.reason,
              color: 'bg-stone-100 text-stone-800 border-stone-200',
            };

            return (
              <div
                key={rep.id}
                className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-2xs hover:border-rose-300 transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-6"
              >
                {/* Left: Report reason, description, and attached listing info */}
                <div className="space-y-4 flex-1">
                  
                  {/* Top reason tag & status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${reasonMeta.color}`}>
                      {language === 'bn' ? reasonMeta.bn : reasonMeta.en}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rep.status === 'pending'
                        ? 'bg-rose-600 text-white'
                        : rep.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'dismissed'
                        ? 'bg-stone-200 text-stone-700'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rep.status}
                    </span>

                    <span className="text-[11px] text-stone-400 font-mono">
                      {new Date(rep.created_at).toLocaleString('bn-BD', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {/* Reporter note & user info */}
                  <div className="bg-rose-50/60 rounded-2xl p-3.5 border border-rose-100 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-950">
                      <User className="h-3.5 w-3.5 text-rose-600" />
                      <span>অভিযোগকারী: {rep.reporter_name || 'সাধারণ ব্যবহারকারী'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                      "{rep.comment || 'কোনো লিখিত মন্তব্য প্রদান করা হয়নি।'}"
                    </p>
                  </div>

                  {/* Moderator notes if resolved */}
                  {rep.moderator_notes && (
                    <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs text-stone-700">
                      <span className="font-bold text-stone-900 block mb-0.5">মডারেটর নোট:</span>
                      <p>{rep.moderator_notes}</p>
                    </div>
                  )}

                  {/* Reported Listing Card snippet */}
                  {rep.listing ? (
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={rep.listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200'}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {rep.listing.title_bn}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                            <span>{rep.listing.area_name_bn}</span>
                            <span>•</span>
                            <span className="font-bold text-emerald-700">{formatPrice(rep.listing.rent_monthly, language)}</span>
                            <span>•</span>
                            <span>মালিক: {rep.listing.contact_name} ({rep.listing.contact_phone})</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewListing(rep.listing || null)}
                        className="h-8 px-2.5 rounded-xl border-stone-200 text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 shrink-0"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>লিস্টিং দেখুন</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-500 italic">
                      লিস্টিংটি ইতোমধ্যে মুছে ফেলা হয়েছে।
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                  <Button
                    size="sm"
                    onClick={() => handleOpenResolveModal(rep)}
                    className="flex-1 sm:flex-none h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    <span>মীমাংসা করুন (Resolve)</span>
                  </Button>

                  {rep.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissReport(rep.id)}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none h-9 px-3 rounded-xl border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100"
                    >
                      <X className="h-4 w-4 mr-1 text-stone-400" />
                      <span>বাতিল (Dismiss)</span>
                    </Button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Resolution Dialog Modal */}
      <Dialog open={!!activeResolutionReport} onOpenChange={(open) => !open && setActiveResolutionReport(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-stone-200 p-6">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-lg font-bold text-stone-900">
              {language === 'bn' ? 'অভিযোগ নিষ্পত্তি ও ব্যবস্থা গ্রহণ' : 'Resolve Listing Report'}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600">
              {language === 'bn' 
                ? 'এই রিপোর্টের বিপরীতে গৃহীত পদক্ষেপ এবং মডারেটর নোট সংরক্ষণ করুন।' 
                : 'Choose action to apply to the reported listing and save moderation remarks.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            
            {/* Listing Action options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                {language === 'bn' ? 'বিজ্ঞাপনের ওপর পদক্ষেপ:' : 'Action on Listing:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setListingAction('none')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    listingAction === 'none'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  কোনো পরিবর্তন নয়
                </button>
                <button
                  type="button"
                  onClick={() => setListingAction('reject')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    listingAction === 'reject'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  রিজেক্ট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setListingAction('remove')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    listingAction === 'remove'
                      ? 'border-rose-600 bg-rose-50 text-rose-900'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  মুছে ফেলুন
                </button>
              </div>
            </div>

            {/* Moderator Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">
                {language === 'bn' ? 'মডারেটর নোট / সমাধানের বিবরণ:' : 'Moderator Remarks / Notes:'}
              </label>
              <textarea
                rows={3}
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder={language === 'bn' ? 'মালিকের সাথে কথা বলা হয়েছে এবং বিজ্ঞাপন সংশোধন করা হয়েছে...' : 'Describe how the dispute was resolved...'}
                className="w-full rounded-xl border border-stone-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-stone-800"
              />
            </div>

          </div>

          <DialogFooter className="flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveResolutionReport(null)}
              className="flex-1 sm:flex-none rounded-xl border-stone-200 text-xs font-bold"
            >
              বাতিল
            </Button>
            <Button
              type="button"
              onClick={handleConfirmResolve}
              disabled={isProcessing}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              {isProcessing ? 'সংরক্ষণ হচ্ছে...' : 'মীমাংসা নিশ্চিত করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Listing Detail Modal */}
      <ListingDetailModal
        listing={previewListing}
        isOpen={!!previewListing}
        onClose={() => setPreviewListing(null)}
      />

    </div>
  );
};
