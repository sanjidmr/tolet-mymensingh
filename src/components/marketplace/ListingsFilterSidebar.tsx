import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  Check, 
  MapPin, 
  DollarSign, 
  Home, 
  Users, 
  Bed, 
  Bath, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  Flame,
  Zap,
  ArrowUpDown,
  Wifi,
  Video,
  Car,
  Sun,
  Utensils,
  Droplets,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Area, ListingFilterState, PropertyType, TargetAudience, Amenity } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AMENITIES_LIST } from '../../data/amenities';

interface ListingsFilterSidebarProps {
  filters: ListingFilterState;
  onFilterChange: (newFilters: Partial<ListingFilterState>) => void;
  onResetFilters: () => void;
  areas: Area[];
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
  totalResultsCount?: number;
  mode?: 'tolet' | 'mess' | 'hostel' | 'sublet';
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'amenity-gas': <Flame className="w-4 h-4 text-orange-500" />,
  'amenity-generator': <Zap className="w-4 h-4 text-amber-500" />,
  'amenity-lift': <ArrowUpDown className="w-4 h-4 text-blue-500" />,
  'amenity-wifi': <Wifi className="w-4 h-4 text-sky-500" />,
  'amenity-security': <ShieldCheck className="w-4 h-4 text-emerald-600" />,
  'amenity-cctv': <Video className="w-4 h-4 text-indigo-500" />,
  'amenity-parking': <Car className="w-4 h-4 text-stone-600" />,
  'amenity-balcony': <Sun className="w-4 h-4 text-amber-500" />,
  'amenity-attached-bath': <Bath className="w-4 h-4 text-teal-600" />,
  'amenity-meal': <Utensils className="w-4 h-4 text-rose-500" />,
  'amenity-water-filter': <Droplets className="w-4 h-4 text-blue-500" />,
  'amenity-geyser': <Sparkles className="w-4 h-4 text-purple-500" />,
};

export const ListingsFilterSidebar: React.FC<ListingsFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  areas,
  isMobileDrawer = false,
  onCloseMobileDrawer,
  totalResultsCount = 0,
  mode = 'tolet',
}) => {
  const { language, t } = useLanguage();

  // Collapsible accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    area: true,
    price: true,
    type: true,
    rooms: true,
    amenities: true,
    badges: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenityId)
      ? current.filter((id) => id !== amenityId)
      : [...current, amenityId];
    onFilterChange({ amenities: updated.length > 0 ? updated : undefined, page: 1 });
  };

  const handleBudgetPreset = (min?: number, max?: number) => {
    onFilterChange({ minRent: min, maxRent: max, page: 1 });
  };

  const propertyTypes: Array<{ value: PropertyType | 'all'; label_bn: string; label_en: string }> = [
    { value: 'all', label_bn: 'সকল ধরন', label_en: 'All Types' },
    { value: 'apartment', label_bn: 'ফ্ল্যাট / অ্যাপার্টমেন্ট', label_en: 'Apartment' },
    { value: 'mess', label_bn: 'মেস / সিট', label_en: 'Mess' },
    { value: 'hostel', label_bn: 'হোস্টেল', label_en: 'Hostel' },
    { value: 'sublet', label_bn: 'সাবলেট', label_en: 'Sublet' },
    { value: 'room', label_bn: 'সিঙ্গেল রুম', label_en: 'Single Room' },
    { value: 'seat', label_bn: 'সিট ভাড়া', label_en: 'Seat' },
  ];

  const audienceTypes: Array<{ value: TargetAudience | 'all'; label_bn: string; label_en: string }> = [
    { value: 'all', label_bn: 'সকলের জন্য', label_en: 'All Audiences' },
    { value: 'family', label_bn: 'ফ্যামিলি', label_en: 'Family' },
    { value: 'bachelor', label_bn: 'ব্যাচেলর', label_en: 'Bachelor' },
    { value: 'student', label_bn: 'শিক্ষার্থী', label_en: 'Students' },
    { value: 'female', label_bn: 'মহিলা / ছাত্রী', label_en: 'Female Only' },
    { value: 'male', label_bn: 'পুরুষ / ছাত্র', label_en: 'Male Only' },
  ];

  return (
    <div className={`flex flex-col h-full ${isMobileDrawer ? 'p-0' : 'bg-white rounded-2xl border border-stone-200 shadow-xs'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-700" />
          <h2 className="font-semibold text-stone-900 text-base">
            {language === 'bn' ? 'ফিল্টারসমূহ' : 'Filters'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-medium text-stone-500 hover:text-emerald-700 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-stone-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {language === 'bn' ? 'রিসেট' : 'Reset'}
          </button>
          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filter Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 divide-y divide-stone-100 text-sm">
        
        {/* 1. Location / Area */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => toggleSection('area')}
            className="flex items-center justify-between w-full font-medium text-stone-900 mb-3"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'এলাকা নির্বাচন করুন' : 'Select Area'}
            </span>
            {openSections.area ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {openSections.area && (
            <div className="space-y-3">
              <select
                value={filters.areaSlug || 'all'}
                onChange={(e) => onFilterChange({ areaSlug: e.target.value === 'all' ? undefined : e.target.value, page: 1 })}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="all">
                  {language === 'bn' ? 'সকল এলাকা (পুরো ময়মনসিংহ)' : 'All Areas (Whole Mymensingh)'}
                </option>
                {areas.map((a) => (
                  <option key={a.id} value={a.slug}>
                    {language === 'bn' ? a.name_bn : a.name_en}
                  </option>
                ))}
              </select>

              {/* Popular Area Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {areas.filter((a) => a.is_popular).slice(0, 6).map((a) => {
                  const isSelected = filters.areaSlug === a.slug;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onFilterChange({ areaSlug: isSelected ? undefined : a.slug, page: 1 })}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      {language === 'bn' ? a.name_bn : a.name_en}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Monthly Rent Budget */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full font-medium text-stone-900 mb-3"
          >
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'মাসিক ভাড়া (বাজেট)' : 'Monthly Rent Range'}
            </span>
            {openSections.price ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {openSections.price && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-stone-500 block mb-1">
                    {language === 'bn' ? 'নূন্যতম (৳)' : 'Min (৳)'}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minRent ?? ''}
                    onChange={(e) => onFilterChange({ minRent: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 block mb-1">
                    {language === 'bn' ? 'সর্বোচ্চ (৳)' : 'Max (৳)'}
                  </label>
                  <input
                    type="number"
                    placeholder="30000"
                    value={filters.maxRent ?? ''}
                    onChange={(e) => onFilterChange({ maxRent: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Budget Presets */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { label_bn: '৳৩,০০০ এর নিচে', label_en: '< ৳3,000', min: undefined, max: 3000 },
                  { label_bn: '৳৩k - ৳৬k', label_en: '৳3k - ৳6k', min: 3000, max: 6000 },
                  { label_bn: '৳৬k - ৳১২k', label_en: '৳6k - ৳12k', min: 6000, max: 12000 },
                  { label_bn: '৳১২k - ৳২০k', label_en: '৳12k - ৳20k', min: 12000, max: 20000 },
                  { label_bn: '৳২০,০০০+', label_en: '৳20k+', min: 20000, max: undefined },
                ].map((preset, idx) => {
                  const isActive = filters.minRent === preset.min && filters.maxRent === preset.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          handleBudgetPreset(undefined, undefined);
                        } else {
                          handleBudgetPreset(preset.min, preset.max);
                        }
                      }}
                      className={`text-xs py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-400'
                      }`}
                    >
                      {language === 'bn' ? preset.label_bn : preset.label_en}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Property Type & Audience */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full font-medium text-stone-900 mb-3"
          >
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'বাসা ও ভাড়ার ধরন' : 'Property & Audience'}
            </span>
            {openSections.type ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {openSections.type && (
            <div className="space-y-4">
              {/* Property Type */}
              <div>
                <label className="text-xs text-stone-500 block mb-1.5 font-medium">
                  {language === 'bn' ? 'প্রপার্টির ধরন' : 'Property Type'}
                </label>
                <select
                  value={filters.propertyType || 'all'}
                  onChange={(e) => onFilterChange({ propertyType: e.target.value as any, page: 1 })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {propertyTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {language === 'bn' ? t.label_bn : t.label_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-xs text-stone-500 block mb-1.5 font-medium">
                  {language === 'bn' ? 'কাদের জন্য প্রযোজ্য' : 'Target Audience'}
                </label>
                <select
                  value={filters.audience || 'all'}
                  onChange={(e) => onFilterChange({ audience: e.target.value as any, page: 1 })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {audienceTypes.map((a) => (
                    <option key={a.value} value={a.value}>
                      {language === 'bn' ? a.label_bn : a.label_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4. Bedrooms & Bathrooms */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection('rooms')}
            className="flex items-center justify-between w-full font-medium text-stone-900 mb-3"
          >
            <span className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'রুম ও বাথরুম সংখ্যা' : 'Rooms & Bathrooms'}
            </span>
            {openSections.rooms ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {openSections.rooms && (
            <div className="space-y-4">
              {/* Bedrooms */}
              <div>
                <label className="text-xs text-stone-500 block mb-1.5 font-medium">
                  {language === 'bn' ? 'বেডরুম (নূন্যতম)' : 'Bedrooms (Min)'}
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { val: 'all', label: language === 'bn' ? 'যেকোনো' : 'Any' },
                    { val: '1', label: '1+' },
                    { val: '2', label: '2+' },
                    { val: '3', label: '3+' },
                    { val: '4', label: '4+' },
                  ].map((b) => {
                    const isSelected = (filters.bedrooms?.toString() || 'all') === b.val;
                    return (
                      <button
                        key={b.val}
                        type="button"
                        onClick={() => onFilterChange({ bedrooms: b.val === 'all' ? undefined : b.val, page: 1 })}
                        className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-400'
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="text-xs text-stone-500 block mb-1.5 font-medium">
                  {language === 'bn' ? 'বাথরুম (নূন্যতম)' : 'Bathrooms (Min)'}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { val: 'all', label: language === 'bn' ? 'যেকোনো' : 'Any' },
                    { val: '1', label: '1+' },
                    { val: '2', label: '2+' },
                    { val: '3', label: '3+' },
                  ].map((b) => {
                    const isSelected = (filters.bathrooms?.toString() || 'all') === b.val;
                    return (
                      <button
                        key={b.val}
                        type="button"
                        onClick={() => onFilterChange({ bathrooms: b.val === 'all' ? undefined : b.val, page: 1 })}
                        className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-400'
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Amenities Checkboxes */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => toggleSection('amenities')}
            className="flex items-center justify-between w-full font-medium text-stone-900 mb-3"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'সুযোগ-সুবিধা (Amenities)' : 'Amenities'}
            </span>
            {openSections.amenities ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {openSections.amenities && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {AMENITIES_LIST.map((amenity) => {
                const isChecked = (filters.amenities || []).includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-colors ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-stone-50/50 border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {AMENITY_ICONS[amenity.id] || <Sparkles className="w-3.5 h-3.5 text-stone-400" />}
                      <span className="text-xs truncate">
                        {language === 'bn' ? amenity.name_bn : amenity.name_en}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Verification & Badges */}
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('badges')}
            className="flex items-center justify-between w-full font-medium text-stone-900 mb-3"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'ভেরিফিকেশন ও স্পেশাল' : 'Trust & Badges'}
            </span>
            {openSections.badges ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {openSections.badges && (
            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-stone-800">
                    {language === 'bn' ? 'শুধুমাত্র ভেরিফাইড প্রপার্টি' : 'Verified Listings Only'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(filters.isVerifiedOnly)}
                  onChange={(e) => onFilterChange({ isVerifiedOnly: e.target.checked ? true : undefined, page: 1 })}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-stone-800">
                    {language === 'bn' ? 'ফিচার্ড প্রপার্টি' : 'Featured Listings Only'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(filters.isFeaturedOnly)}
                  onChange={(e) => onFilterChange({ isFeaturedOnly: e.target.checked ? true : undefined, page: 1 })}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
              </label>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Drawer Bottom Action Bar */}
      {isMobileDrawer && (
        <div className="p-4 border-t border-stone-200 bg-white sticky bottom-0 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="flex-1 rounded-xl text-stone-700"
          >
            {language === 'bn' ? 'রিসেট' : 'Reset'}
          </Button>
          <Button
            variant="default"
            onClick={onCloseMobileDrawer}
            className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
          >
            {language === 'bn'
              ? `ফলাফল দেখুন (${totalResultsCount})`
              : `View Results (${totalResultsCount})`}
          </Button>
        </div>
      )}
    </div>
  );
};
