import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { submitListingReport, checkUserReportedListing } from '../../lib/supabase/services/reports';
import { ReportReason } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, Info } from 'lucide-react';

interface ReportListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

export const ReportListingModal: React.FC<ReportListingModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [selectedReason, setSelectedReason] = useState<ReportReason>('incorrect_info');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyReportedInfo, setAlreadyReportedInfo] = useState<{
    hasReported: boolean;
    reason?: ReportReason;
    submittedAt?: string;
  } | null>(null);

  const reportReasons: { id: ReportReason; label_bn: string; label_en: string; desc_bn: string; desc_en: string }[] = [
    {
      id: 'already_rented',
      label_bn: 'বাসাটি ইতোমধ্যে ভাড়া হয়ে গেছে',
      label_en: 'Property already rented out',
      desc_bn: 'মালিক জানিয়েছেন বাসাটি আর খালি নেই বা অন্য কেউ ভাড়া নিয়েছেন।',
      desc_en: 'Landlord confirmed the property is no longer available.',
    },
    {
      id: 'incorrect_info',
      label_bn: 'ভুল বা অসত্য তথ্য (ভাড়া/লোকেশন/ছবি)',
      label_en: 'Incorrect info or misleading photos',
      desc_bn: 'বিজ্ঞাপনে উল্লেখিত তথ্যের সাথে বাস্তবতার অমিল আছে।',
      desc_en: 'Rent price, amenities or photos do not match reality.',
    },
    {
      id: 'wrong_phone',
      label_bn: 'ভুল ফোন নম্বর / যোগাযোগ করা যাচ্ছে না',
      label_en: 'Wrong phone number or unreachable',
      desc_bn: 'ফোন নম্বর বন্ধ, অন্য ব্যক্তির অথবা ভুল নম্বর দেওয়া।',
      desc_en: 'Phone is switched off, wrong person, or non-responsive.',
    },
    {
      id: 'scam',
      label_bn: 'প্রতারণা বা ভুয়া অগ্রিম টাকা দাবি (Scam / Fraud)',
      label_en: 'Suspicious scam or advance fee fraud',
      desc_bn: 'বাসা না দেখিয়ে আগেই বিকাশ/নগদে টাকা চাওয়া বা প্রতারণামূলক আচরণ।',
      desc_en: 'Asking for money before showing property or suspicious behavior.',
    },
    {
      id: 'fake_listing',
      label_bn: 'অবাস্তব বা নকল বাসা (Fake Listing)',
      label_en: 'Fake or non-existent property',
      desc_bn: 'বাস্তবে এই ঠিকানায় এমন কোনো বাসা বা মেস নেই।',
      desc_en: 'No such house or mess exists at this given address.',
    },
    {
      id: 'inappropriate_content',
      label_bn: 'আপত্তিকর বা অশোভন কন্টেন্ট',
      label_en: 'Inappropriate or offensive content',
      desc_bn: 'বিজ্ঞাপনে নিয়মবহির্ভূত বা আপত্তিকর ভাষা ও ছবি রয়েছে।',
      desc_en: 'Content violates community rules or contains offensive material.',
    },
  ];

  // Check if current user or browser has already reported this listing
  useEffect(() => {
    if (isOpen && listingId) {
      checkUserReportedListing(listingId, user?.id).then((res) => {
        if (res.hasReported) {
          setAlreadyReportedInfo(res);
        } else {
          setAlreadyReportedInfo(null);
        }
      });
    }
  }, [isOpen, listingId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyReportedInfo?.hasReported) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitListingReport({
        listing_id: listingId,
        reporter_id: user?.id,
        reason: selectedReason,
        comment: comment.trim() || undefined,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(
          res.error || (language === 'bn' ? 'রিপোর্ট জমা দেওয়া সম্ভব হয়নি।' : 'Failed to submit report. Please try again.')
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setComment('');
    setSelectedReason('incorrect_info');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white rounded-2xl border-stone-200 shadow-xl">
        
        {/* Header */}
        <div className="bg-rose-50/90 border-b border-rose-100 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-stone-900">
                {language === 'bn' ? 'বিজ্ঞাপনটি রিপোর্ট করুন' : 'Report this Listing'}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                {listingTitle}
              </DialogDescription>
            </div>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">
              {language === 'bn' ? 'আপনার রিপোর্ট সফলভাবে গৃহীত হয়েছে' : 'Report Submitted Successfully'}
            </h3>
            <p className="text-sm text-stone-600 mb-6 max-w-sm mx-auto leading-relaxed">
              {language === 'bn' 
                ? 'টু-লেট ময়মনসিংহকে নিরাপদ ও সঠিক রাখতে সহযোগিতার জন্য ধন্যবাদ। আমাদের মডারেশন টিম খুব দ্রুত বিজ্ঞাপনটি যাচাই করে ব্যবস্থা নেবে।' 
                : 'Thank you for helping keep ToLet Mymensingh safe and authentic. Our moderation team will inspect this listing and take prompt action.'}
            </p>
            <div className="bg-stone-50 rounded-xl p-3 mb-6 text-xs text-stone-500 flex items-center justify-center gap-2">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {language === 'bn' 
                  ? 'স্ট্যাটাস: মডারেশন রিভিউধীন' 
                  : 'Status: Under Active Moderation'}
              </span>
            </div>
            <Button
              onClick={handleResetAndClose}
              className="w-full sm:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'ঠিক আছে' : 'Done'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {alreadyReportedInfo?.hasReported && (
              <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {language === 'bn' 
                      ? 'আপনি ইতোমধ্যেই এই বিজ্ঞাপনটি রিপোর্ট করেছেন' 
                      : 'You have already reported this listing'}
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {language === 'bn'
                      ? 'আমাদের অ্যাডমিন টিম এটি পর্যালোচনা করছে। বারবার একই রিপোর্ট পাঠানো প্রয়োজন নেই।'
                      : 'Our moderation team is already reviewing this listing. Duplicate submissions are not required.'}
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-2">
                {language === 'bn' ? 'রিপোর্ট করার প্রধান কারণ নির্বাচন করুন *' : 'Select Primary Reason *'}
              </label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {reportReasons.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <label
                      key={r.id}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-50/40 text-stone-900' 
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.id}
                        disabled={Boolean(alreadyReportedInfo?.hasReported)}
                        checked={isSelected}
                        onChange={() => setSelectedReason(r.id)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div className="text-xs">
                        <span className="font-semibold block">
                          {language === 'bn' ? r.label_bn : r.label_en}
                        </span>
                        <span className="text-[11px] text-stone-500 block mt-0.5">
                          {language === 'bn' ? r.desc_bn : r.desc_en}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'অতিরিক্ত বিবরণ (ঐচ্ছিক)' : 'Additional Comments (Optional)'}
                </label>
                <span className="text-[10px] text-stone-400">
                  {comment.length}/500
                </span>
              </div>
              <textarea
                value={comment}
                disabled={Boolean(alreadyReportedInfo?.hasReported)}
                onChange={(e) => setComment(e.target.value)}
                placeholder={language === 'bn' ? 'সমস্যার বিস্তারিত লিখুন যা আমাদের অনুসন্ধানে সাহায্য করবে...' : 'Provide details that will help our moderation team...'}
                className="w-full h-20 p-2.5 text-xs rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none disabled:bg-stone-50 disabled:text-stone-400"
                maxLength={500}
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
                className="h-9 px-4 rounded-xl border-stone-200 text-xs font-semibold cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || Boolean(alreadyReportedInfo?.hasReported)}
                className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting 
                  ? (language === 'bn' ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...') 
                  : (language === 'bn' ? 'রিপোর্ট জমা দিন' : 'Submit Report')}
              </Button>
            </DialogFooter>
          </form>
        )}

      </DialogContent>
    </Dialog>
  );
};

