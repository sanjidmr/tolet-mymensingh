import React from 'react';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Heart, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Listing } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface ListingCardProps {
  listing: Listing;
  onSelect?: (listing: Listing) => void;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  onToggleFavorite?: (listingId: string) => void;
  isFavorite?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onNavigate,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const { language, t } = useLanguage();

  const title = language === 'bn' ? listing.title_bn : (listing.title_en || listing.title_bn);
  const areaName = language === 'bn' ? listing.area_name_bn : listing.area_name_en;

  const audienceLabel = {
    family: t.family,
    bachelor: t.bachelor,
    student: t.student,
    female: t.femaleOnly,
    male: t.maleOnly,
    mixed: t.mixed,
  }[listing.audience] || listing.audience;

  const propertyTypeLabel = {
    apartment: t.apartment,
    room: t.room,
    sublet: t.sublet,
    mess: t.mess,
    hostel: t.hostel,
    seat: t.seat,
  }[listing.property_type] || listing.property_type;

  const primaryImage = listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop';

  const handleClick = () => {
    if (onSelect) {
      onSelect(listing);
    } else if (onNavigate) {
      const prefix = listing.property_type === 'mess' || listing.property_type === 'seat' 
        ? 'mess' 
        : listing.property_type === 'hostel' 
        ? 'hostel' 
        : 'tolet';
      onNavigate(`${prefix}/${listing.slug || listing.id}`);
    }
  };

  return (
    <Card 
      onClick={handleClick}
      className="group cursor-pointer hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs"
    >
      {/* Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <img
          src={primaryImage}
          alt={title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
          <Badge variant="default" className="bg-stone-900/85 backdrop-blur-xs text-white border-0 font-bold text-[10px] sm:text-[11px] px-2 py-0.5">
            {propertyTypeLabel}
          </Badge>
          {listing.is_featured && (
            <Badge variant="featured" className="flex items-center gap-1 shadow-xs text-[10px] sm:text-[11px] px-2 py-0.5">
              <Sparkles className="h-2.5 w-2.5 text-amber-600 fill-amber-600" />
              <span>{t.featured}</span>
            </Badge>
          )}
          {listing.is_verified && (
            <Badge variant="verified" className="flex items-center gap-1 shadow-xs text-[10px] sm:text-[11px] px-2 py-0.5">
              <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
              <span>{t.verified}</span>
            </Badge>
          )}
        </div>

        {/* Target Audience Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-white/95 backdrop-blur-xs text-stone-800 shadow-2xs border border-stone-100">
            👥 {audienceLabel}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(listing.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 touch-target-44 ${
            isFavorite 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-rose-500 shadow-xs'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <CardContent className="p-3.5 sm:p-4 flex flex-col flex-1">
        
        {/* Pricing */}
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700 tracking-tight">
              {formatPrice(listing.rent_monthly)}
            </span>
            <span className="text-[11px] font-medium text-stone-500">
              /{language === 'bn' ? 'মাস' : 'mo'}
            </span>
          </div>

          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
            {listing.is_negotiable ? t.negotiable : t.fixed}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-stone-900 text-sm sm:text-base line-clamp-1 group-hover:text-emerald-700 transition-colors mb-1">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-stone-500 mb-2.5">
          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">
            {areaName}, {language === 'bn' ? listing.address_street_bn : (listing.address_street_en || listing.address_street_bn)}
          </span>
        </div>

        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-stone-50 border border-stone-100 text-stone-700 text-[11px] font-semibold mb-1 mt-auto">
          {listing.property_type === 'seat' || listing.property_type === 'mess' ? (
            <>
              <div className="flex items-center gap-1 truncate">
                <Bed className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{language === 'bn' ? toBengaliNumber(listing.seat_count || 1) : (listing.seat_count || 1)} {t.seat}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Bath className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{language === 'bn' ? toBengaliNumber(listing.bathrooms || 1) : (listing.bathrooms || 1)} {t.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Layers className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{language === 'bn' ? toBengaliNumber(listing.floor_number || 1) : (listing.floor_number || 1)} {t.floor}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 truncate">
                <Bed className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{language === 'bn' ? toBengaliNumber(listing.bedrooms || 1) : (listing.bedrooms || 1)} {t.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Bath className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{language === 'bn' ? toBengaliNumber(listing.bathrooms || 1) : (listing.bathrooms || 1)} {t.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Maximize2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{language === 'bn' ? toBengaliNumber(listing.area_sqft || 800) : (listing.area_sqft || 800)} {t.sqft}</span>
              </div>
            </>
          )}
        </div>

      </CardContent>
    </Card>
  );
};
