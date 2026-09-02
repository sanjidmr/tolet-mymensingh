import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Area, ListingFilterState } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { AMENITIES_LIST } from '../../data/amenities';

interface ActiveFilterChipsProps {
  filters: ListingFilterState;
  areas: Area[];
  onRemoveFilter: (key: keyof ListingFilterState, value?: any) => void;
  onClearAll: () => void;
  mode?: string;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  areas,
  onRemoveFilter,
  onClearAll,
  mode = 'tolet',
}) => {
  const { language } = useLanguage();

  const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];

  // Search Query Chip
  if (filters.searchQuery && filters.searchQuery.trim()) {
    chips.push({
      id: 'search',
      label: `"${filters.searchQuery}"`,
      onRemove: () => onRemoveFilter('searchQuery'),
    });
  }

  // Area Chip
  if (filters.areaSlug && filters.areaSlug !== 'all') {
    const area = areas.find((a) => a.slug === filters.areaSlug || a.id === filters.areaSlug);
    const areaName = area ? (language === 'bn' ? area.name_bn : area.name_en) : filters.areaSlug;
    chips.push({
      id: 'area',
      label: `${language === 'bn' ? 'এলাকা' : 'Area'}: ${areaName}`,
      onRemove: () => onRemoveFilter('areaSlug'),
    });
  }

  // Property Type Chip (if not default for mode)
  if (filters.propertyType && filters.propertyType !== 'all') {
    const typeLabels: Record<string, { bn: string; en: string }> = {
      apartment: { bn: 'ফ্ল্যাট', en: 'Apartment' },
      mess: { bn: 'মেস', en: 'Mess' },
      hostel: { bn: 'হোস্টেল', en: 'Hostel' },
      sublet: { bn: 'সাবলেট', en: 'Sublet' },
      room: { bn: 'সিঙ্গেল রুম', en: 'Room' },
      seat: { bn: 'সিট', en: 'Seat' },
    };
    const labelObj = typeLabels[filters.propertyType];
    chips.push({
      id: 'propertyType',
      label: `${language === 'bn' ? 'ধরন' : 'Type'}: ${labelObj ? (language === 'bn' ? labelObj.bn : labelObj.en) : filters.propertyType}`,
      onRemove: () => onRemoveFilter('propertyType'),
    });
  }

  // Audience Chip
  if (filters.audience && filters.audience !== 'all') {
    const audLabels: Record<string, { bn: string; en: string }> = {
      family: { bn: 'ফ্যামিলি', en: 'Family' },
      bachelor: { bn: 'ব্যাচেলর', en: 'Bachelor' },
      student: { bn: 'শিক্ষার্থী', en: 'Student' },
      female: { bn: 'মহিলা / ছাত্রী', en: 'Female Only' },
      male: { bn: 'পুরুষ / ছাত্র', en: 'Male Only' },
    };
    const labelObj = audLabels[filters.audience];
    chips.push({
      id: 'audience',
      label: `${language === 'bn' ? 'প্রযোজ্য' : 'For'}: ${labelObj ? (language === 'bn' ? labelObj.bn : labelObj.en) : filters.audience}`,
      onRemove: () => onRemoveFilter('audience'),
    });
  }

  // Rent Budget Chip
  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    let budgetLabel = '';
    if (filters.minRent && filters.maxRent) {
      budgetLabel = `৳${filters.minRent.toLocaleString()} - ৳${filters.maxRent.toLocaleString()}`;
    } else if (filters.minRent) {
      budgetLabel = `৳${filters.minRent.toLocaleString()}+`;
    } else if (filters.maxRent) {
      budgetLabel = `৳${filters.maxRent.toLocaleString()} ${language === 'bn' ? 'এর নিচে' : 'max'}`;
    }

    if (budgetLabel) {
      chips.push({
        id: 'budget',
        label: `${language === 'bn' ? 'ভাড়া' : 'Rent'}: ${budgetLabel}`,
        onRemove: () => {
          onRemoveFilter('minRent');
          onRemoveFilter('maxRent');
        },
      });
    }
  }

  // Bedrooms Chip
  if (filters.bedrooms && filters.bedrooms !== 'all') {
    chips.push({
      id: 'bedrooms',
      label: `${filters.bedrooms}+ ${language === 'bn' ? 'বেডরুম' : 'Beds'}`,
      onRemove: () => onRemoveFilter('bedrooms'),
    });
  }

  // Bathrooms Chip
  if (filters.bathrooms && filters.bathrooms !== 'all') {
    chips.push({
      id: 'bathrooms',
      label: `${filters.bathrooms}+ ${language === 'bn' ? 'বাথরুম' : 'Baths'}`,
      onRemove: () => onRemoveFilter('bathrooms'),
    });
  }

  // Verified Chip
  if (filters.isVerifiedOnly) {
    chips.push({
      id: 'verified',
      label: language === 'bn' ? 'ভেরিফাইড প্রপার্টি' : 'Verified Only',
      onRemove: () => onRemoveFilter('isVerifiedOnly'),
    });
  }

  // Featured Chip
  if (filters.isFeaturedOnly) {
    chips.push({
      id: 'featured',
      label: language === 'bn' ? 'ফিচার্ড প্রপার্টি' : 'Featured Only',
      onRemove: () => onRemoveFilter('isFeaturedOnly'),
    });
  }

  // Amenities Chips
  if (filters.amenities && filters.amenities.length > 0) {
    filters.amenities.forEach((amenityId) => {
      const amenity = AMENITIES_LIST.find((a) => a.id === amenityId);
      const name = amenity ? (language === 'bn' ? amenity.name_bn : amenity.name_en) : amenityId;
      chips.push({
        id: `amenity-${amenityId}`,
        label: name,
        onRemove: () => onRemoveFilter('amenities', amenityId),
      });
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-3">
      <span className="text-xs font-medium text-stone-500 mr-1">
        {language === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}
      </span>

      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-medium transition-colors hover:bg-emerald-100"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="p-0.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-200/60 rounded-full transition-colors"
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors border border-dashed border-stone-300"
      >
        <RotateCcw className="w-3 h-3" />
        {language === 'bn' ? 'সব মুছুন' : 'Clear All'}
      </button>
    </div>
  );
};
