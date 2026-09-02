import React, { useState } from 'react';
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
import { Heart, Smartphone, ShieldCheck, Sparkles, LogIn, ArrowRight } from 'lucide-react';

interface GuestFavoritesPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLogin: () => void;
}

export const GuestFavoritesPromptModal: React.FC<GuestFavoritesPromptModalProps> = ({
  isOpen,
  onClose,
  onNavigateToLogin,
}) => {
  const { language } = useLanguage();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('tolet_suppress_guest_fav_prompt', 'true');
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const handleLoginClick = () => {
    onClose();
    onNavigateToLogin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-3xl border-stone-200 shadow-2xl">
        
        {/* Header Illustration */}
        <div className="bg-emerald-700 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mb-4 shadow-sm">
            <Heart className="h-6 w-6 fill-rose-400 text-rose-400" />
          </div>

          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            {language === 'bn' 
              ? 'পছন্দের বাসাগুলো চিরতরে সংরক্ষণ করুন!' 
              : 'Sync Your Saved Favorites!'}
          </DialogTitle>
          <DialogDescription className="text-xs text-emerald-100 mt-1 leading-relaxed">
            {language === 'bn'
              ? 'লগইন করলে আপনার পছন্দের বাসাগুলো সব ডিভাইসে সিঙ্ক থাকবে এবং ব্রাউজার হিস্ট্রি মুছে গেলেও হারিয়ে যাবে না।'
              : 'Log in to access your saved properties from any device (mobile or desktop) anytime without losing data.'}
          </DialogDescription>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">
                {language === 'bn' ? 'সকল ডিভাইসে সহজে এক্সেস' : 'Cross-Device Sync'}
              </span>
              <span className="text-stone-500">
                {language === 'bn' ? 'মোবাইল বা ল্যাপটপ থেকে যেকোনো সময় দেখুন।' : 'View your saved list anytime on phone or PC.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">
                {language === 'bn' ? '১০০% নিরাপদ ও ক্লাউড ব্যাকআপ' : '100% Secure & Cloud Backup'}
              </span>
              <span className="text-stone-500">
                {language === 'bn' ? 'কখনোই আপনার শর্টলিস্ট হারিয়ে যাবে না।' : 'Never lose your property shortlist.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">
                {language === 'bn' ? 'দ্রুত সরাসরি যোগাযোগ' : 'Direct Landlord Contacts'}
              </span>
              <span className="text-stone-500">
                {language === 'bn' ? 'সহজে কল ও হোয়াটসঅ্যাপ মেসেজ পাঠান।' : 'Call or WhatsApp landlords with one tap.'}
              </span>
            </div>
          </div>

          {/* Don't show again checkbox */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="dontShowGuestPrompt"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 text-xs"
            />
            <label htmlFor="dontShowGuestPrompt" className="text-xs text-stone-500 cursor-pointer select-none">
              {language === 'bn' ? 'এই ডিভাইসে আর এই বার্তা দেখাবেন না' : 'Don\'t show this prompt again on this device'}
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 pt-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDismiss}
            className="w-full sm:w-auto h-10 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl cursor-pointer"
          >
            {language === 'bn' ? 'গেস্ট হিসেবে চালিয়ে যান' : 'Continue as Guest'}
          </Button>

          <Button
            type="button"
            onClick={handleLoginClick}
            className="w-full sm:w-auto h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>{language === 'bn' ? 'লগইন / রেজিস্টার করুন' : 'Log In / Register'}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};
