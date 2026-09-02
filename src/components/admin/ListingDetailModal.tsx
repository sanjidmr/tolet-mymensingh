import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Droplet, 
  Zap, 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  Sparkles, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Check,
  Star
} from 'lucide-react';
import { Listing } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  onToggleVerified?: (id: string, isVerified: boolean) => void;
  onDelete?: (id: string) => void;
  onInspectOwner?: (ownerId: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onToggleFeatured,
  onToggleVerified,
  onDelete,
  onInspectOwner,
}) => {
  const { language } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (!listing) return null;

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [{
        id: 'default',
        listing_id: listing.id,
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
        storage_path: 'default.jpg',
        is_primary: true,
        order_index: 0,
      }];

  const currentImage = images[activeImageIndex] || images[0];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-white rounded-3xl border border-stone-200 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
              listing.status === 'approved' 
                ? 'bg-emerald-100 text-emerald-800'
                : listing.status === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : listing.status === 'rejected'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-stone-200 text-stone-700'
            }`}>
              {listing.status === 'approved' ? 'অনুমোদিত / Live' : listing.status === 'pending' ? 'অনুমোদনের অপেক্ষায় / Pending' : listing.status}
            </span>

            {listing.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-2xs">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </span>
            )}

            {listing.is_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <div className="text-xs text-stone-500 font-mono">
            ID: {listing.id}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Gallery Carousel & Thumbnails */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center">
              <img
                src={currentImage.url}
                alt={listing.title_bn}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-semibold backdrop-blur-xs">
                {activeImageIndex + 1} / {images.length}
              </div>

              {currentImage.is_primary && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                  Primary Cover
                </div>
              )}
            </div>

            {/* Thumbnails strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-emerald-600 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Pricing Block */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-200">
            <div className="space-y-1.5 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                {listing.title_bn}
              </h2>
              {listing.title_en && (
                <p className="text-sm text-stone-500 font-medium">{listing.title_en}</p>
              )}
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 pt-1">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{listing.area_name_bn} • {listing.address_street_bn}</span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-right shrink-0">
              <span className="text-xs font-medium text-emerald-800 block">মাসিক ভাড়া</span>
              <div className="text-2xl font-black text-emerald-700">
                {formatPrice(listing.rent_monthly, language)}
              </div>
              <span className="text-[11px] text-stone-500">
                {listing.is_negotiable ? '(আলোচনা সাপেক্ষ)' : '(ফিক্সড)'}
              </span>
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2.5">
              <Bed className="h-5 w-5 text-stone-500" />
              <div>
                <span className="text-[11px] text-stone-500 block">বেডরুম</span>
                <span className="text-sm font-bold text-stone-800">
                  {listing.bedrooms ? `${toBengaliNumber(listing.bedrooms, language)} টি` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Bath className="h-5 w-5 text-stone-500" />
              <div>
                <span className="text-[11px] text-stone-500 block">বাথরুম</span>
                <span className="text-sm font-bold text-stone-800">
                  {listing.bathrooms ? `${toBengaliNumber(listing.bathrooms, language)} টি` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-stone-500" />
              <div>
                <span className="text-[11px] text-stone-500 block">ফ্লোর</span>
                <span className="text-sm font-bold text-stone-800">
                  {listing.floor_number ? `${toBengaliNumber(listing.floor_number, language)} তলা` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="h-5 w-5 text-stone-500" />
              <div>
                <span className="text-[11px] text-stone-500 block">উপলব্ধতা</span>
                <span className="text-sm font-bold text-stone-800 truncate">
                  {listing.available_from || 'চলতি মাস'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-stone-900">বিস্তারিত বিবরণ</h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-white p-4 rounded-xl border border-stone-200 whitespace-pre-line">
              {listing.description_bn}
            </p>
          </div>

          {/* Utilities & Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">বিল ও পরিষেবা</h4>
              <div className="space-y-1.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span>তিতাস গ্যাস:</span>
                  <span className="font-semibold">{listing.gas_bill_included ? '✅ অন্তর্ভুক্ত' : '❌ আলাদা'}</span>
                </div>
                <div className="flex justify-between">
                  <span>বিদ্যুৎ বিল:</span>
                  <span className="font-semibold">{listing.electricity_bill_included ? '✅ অন্তর্ভুক্ত' : '❌ আলাদা'}</span>
                </div>
                <div className="flex justify-between">
                  <span>পানি বিল:</span>
                  <span className="font-semibold">{listing.water_bill_included ? '✅ অন্তর্ভুক্ত' : '❌ আলাদা'}</span>
                </div>
                {listing.service_charge && (
                  <div className="flex justify-between pt-1 border-t border-stone-200">
                    <span>সার্ভিস চার্জ:</span>
                    <span className="font-bold">{formatPrice(listing.service_charge, language)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Details Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">বাড়ির মালিক / হোস্ট</h4>
                {onInspectOwner && (
                  <button
                    onClick={() => onInspectOwner(listing.owner_id)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>অন্যান্য বিজ্ঞাপন</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {listing.owner_avatar ? (
                    <img src={listing.owner_avatar} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{listing.owner_name?.charAt(0) || 'M'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-stone-900 truncate">{listing.owner_name}</p>
                    {listing.is_owner_verified && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 font-mono">{listing.contact_phone}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${listing.contact_phone}`}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>কল দিন</span>
                </a>
                {listing.contact_whatsapp && (
                  <a
                    href={`https://wa.me/88${listing.contact_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5"
                  >
                    <span>হোয়াটসঅ্যাপ</span>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
          
          {/* Quick toggle badges */}
          <div className="flex items-center gap-2">
            {onToggleFeatured && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleFeatured(listing.id, !listing.is_featured)}
                className={`h-9 text-xs font-bold rounded-xl ${
                  listing.is_featured ? 'bg-amber-50 border-amber-300 text-amber-800' : 'border-stone-200 text-stone-700'
                }`}
              >
                <Star className={`h-3.5 w-3.5 mr-1 ${listing.is_featured ? 'fill-current text-amber-500' : ''}`} />
                <span>{listing.is_featured ? 'Featured বাতিল' : 'Feature করুন'}</span>
              </Button>
            )}

            {onToggleVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleVerified(listing.id, !listing.is_verified)}
                className={`h-9 text-xs font-bold rounded-xl ${
                  listing.is_verified ? 'bg-blue-50 border-blue-300 text-blue-800' : 'border-stone-200 text-stone-700'
                }`}
              >
                <ShieldCheck className={`h-3.5 w-3.5 mr-1 ${listing.is_verified ? 'text-blue-600' : ''}`} />
                <span>{listing.is_verified ? 'Verified বাতিল' : 'Verify করুন'}</span>
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(listing.id)}
                className="h-9 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>মুছে ফেলুন</span>
              </Button>
            )}
          </div>

          {/* Primary Moderation Actions */}
          <div className="flex items-center gap-2">
            {listing.status !== 'rejected' && onReject && (
              <Button
                variant="outline"
                onClick={() => onReject(listing.id)}
                className="h-10 px-4 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
              >
                <AlertTriangle className="h-4 w-4 mr-1 text-rose-500" />
                <span>রিজেক্ট করুন</span>
              </Button>
            )}

            {listing.status !== 'approved' && onApprove && (
              <Button
                onClick={() => onApprove(listing.id)}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>অনুমোদন করুন (Approve)</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border-stone-200 text-xs font-bold text-stone-700"
            >
              বন্ধ করুন
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
};
