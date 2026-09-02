import React, { useState, useEffect } from 'react';
import { 
  User, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Home, 
  ExternalLink, 
  Trash2, 
  X, 
  Eye, 
  AlertCircle,
  Ban,
  Clock
} from 'lucide-react';
import { AdminUserItem, Listing } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { fetchOwnerListingsForAdmin, adminToggleVerifyUser, adminToggleDeactivateUser } from '../../lib/supabase';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface OwnerInspectionModalProps {
  user: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectListingForPreview?: (listing: Listing) => void;
  onUserUpdated?: () => void;
}

export const OwnerInspectionModal: React.FC<OwnerInspectionModalProps> = ({
  user,
  isOpen,
  onClose,
  onSelectListingForPreview,
  onUserUpdated,
}) => {
  const { language } = useLanguage();
  const [ownerListings, setOwnerListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setLoadingListings(true);
      fetchOwnerListingsForAdmin(user.id)
        .then((res) => setOwnerListings(res))
        .finally(() => setLoadingListings(false));
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleToggleVerify = async () => {
    setIsUpdating(true);
    await adminToggleVerifyUser(user.id, !user.is_verified);
    setIsUpdating(false);
    if (onUserUpdated) onUserUpdated();
  };

  const handleToggleDeactivate = async () => {
    setIsUpdating(true);
    await adminToggleDeactivateUser(user.id, !user.is_deactivated);
    setIsUpdating(false);
    if (onUserUpdated) onUserUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-3xl border border-stone-200 p-0 overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header Profile Summary */}
        <div className="p-5 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold overflow-hidden shrink-0 border-2 border-white/20">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">{user.name}</h3>
                {user.is_verified ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-700 text-stone-300">
                    Unverified
                  </span>
                )}
                {user.is_deactivated && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                    <Ban className="h-3 w-3" />
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 font-mono mt-0.5">
                {user.phone} • {user.email || 'No email'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                <span>রোল: <b className="text-emerald-400 uppercase">{user.role}</b></span>
                <span>•</span>
                <span>যুক্ত হয়েছেন: {new Date(user.created_at).toLocaleDateString('bn-BD')}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            <Button
              size="sm"
              onClick={handleToggleVerify}
              disabled={isUpdating}
              className={`h-8 px-3 rounded-xl text-xs font-bold ${
                user.is_verified 
                  ? 'bg-stone-700 hover:bg-stone-600 text-stone-200' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              <span>{user.is_verified ? 'ভেরিফিকেশন প্রত্যাহার' : 'মালিক ভেরিফাই করুন'}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleDeactivate}
              disabled={isUpdating}
              className={`h-8 px-3 rounded-xl text-xs font-bold border-rose-500/50 ${
                user.is_deactivated
                  ? 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-rose-900/40 text-rose-300 hover:bg-rose-900/60'
              }`}
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              <span>{user.is_deactivated ? 'অ্যাকাউন্ট চালু করুন' : 'অ্যাকাউন্ট স্থগিত করুন'}</span>
            </Button>
          </div>
        </div>

        {/* Listings Collection */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Home className="h-4 w-4 text-emerald-600" />
              <span>এই ইউজারের সকল বিজ্ঞাপন ({toBengaliNumber(ownerListings.length, language)} টি)</span>
            </h4>
          </div>

          {loadingListings ? (
            <div className="py-8 text-center text-xs text-stone-500">
              বিজ্ঞাপনসমূহ লোড হচ্ছে...
            </div>
          ) : ownerListings.length === 0 ? (
            <div className="py-8 text-center rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
              এই মালিকের কোনো বিজ্ঞাপন পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-2.5">
              {ownerListings.map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={l.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200'}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {l.title_bn}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span>{l.area_name_bn}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700">{formatPrice(l.rent_monthly, language)}</span>
                        <span>•</span>
                        <span className={`font-semibold ${
                          l.status === 'approved' ? 'text-emerald-600' : l.status === 'pending' ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {l.status === 'approved' ? 'অনুমোদিত' : l.status === 'pending' ? 'অপেক্ষমাণ' : l.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {onSelectListingForPreview && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectListingForPreview(l)}
                      className="h-8 px-2.5 rounded-xl border-stone-200 text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 shrink-0"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>দেখুন</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-stone-200 text-xs font-bold text-stone-700"
          >
            বন্ধ করুন
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};
