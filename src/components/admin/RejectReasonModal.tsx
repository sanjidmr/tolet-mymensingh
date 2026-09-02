import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  listingTitle?: string;
  isSubmitting?: boolean;
}

const PRESET_REASONS = [
  'ভুল বা অস্তিত্বহীন ফোন নম্বর দেওয়া হয়েছে',
  'ছবি অস্পষ্ট বা অপর্যাপ্ত তথ্য রয়েছে',
  'অবাস্তব বা বিভ্রান্তিকর ভাড়ার পরিমাণ উল্লেখ করা হয়েছে',
  'বিজ্ঞাপনের শর্তাবলীতে ত্রুটি রয়েছে',
  'ভুয়া বা স্প্যাম বিজ্ঞাপন সন্দেহ করা হচ্ছে',
  'বাসা ইতোমধ্যে ভাড়া হয়ে গেছে',
];

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  listingTitle,
  isSubmitting = false,
}) => {
  const { language } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirm = () => {
    const finalReason = customReason.trim() || selectedPreset;
    if (!finalReason) return;
    onConfirm(finalReason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-stone-200 p-6">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-stone-900">
                {language === 'bn' ? 'বিজ্ঞাপন প্রত্যাখ্যান করুন' : 'Reject Listing'}
              </DialogTitle>
              <p className="text-xs text-stone-500 line-clamp-1">
                {listingTitle}
              </p>
            </div>
          </div>
          <DialogDescription className="text-xs text-stone-600">
            {language === 'bn' 
              ? 'প্রত্যাখ্যানের সঠিক কারণ নির্বাচন করুন অথবা নিচে কারণটি লিখে দিন। এটি মালিকের কাছে নোটিফিকেশন হিসেবে যাবে।' 
              : 'Specify the reason for rejection. This will be recorded and communicated to the property owner.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label className="text-xs font-bold text-stone-700 block">
            {language === 'bn' ? 'সাধারণ কারণসমূহ (ক্লিক করুন):' : 'Preset Reasons:'}
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {PRESET_REASONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setCustomReason(preset);
                }}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  selectedPreset === preset
                    ? 'border-rose-500 bg-rose-50/70 text-rose-900 font-bold'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                }`}
              >
                • {preset}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-stone-700 block">
              {language === 'bn' ? 'কাস্টম মন্তব্য বা স্পষ্টীকরণ:' : 'Custom Moderator Comment:'}
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder={language === 'bn' ? 'বিজ্ঞাপনটি প্রত্যাখ্যান করার বিশদ কারণ লিখুন...' : 'Write detailed rejection reason...'}
              className="w-full rounded-xl border border-stone-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-stone-800"
            />
          </div>
        </div>

        <DialogFooter className="flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none rounded-xl border-stone-200 text-xs font-bold"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || (!customReason.trim() && !selectedPreset)}
            className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            {isSubmitting 
              ? (language === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...') 
              : (language === 'bn' ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Reject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
