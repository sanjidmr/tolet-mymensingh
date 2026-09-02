import React from 'react';
import { Area } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { toBengaliNumber } from '../../lib/utils';
import { MapPin } from 'lucide-react';

interface AreaFilterPillProps {
  area: Area;
  isSelected?: boolean;
  onSelect?: (slug: string) => void;
}

export const AreaFilterPill: React.FC<AreaFilterPillProps> = ({
  area,
  isSelected = false,
  onSelect,
}) => {
  const { language } = useLanguage();
  const name = language === 'bn' ? area.name_bn : area.name_en;

  return (
    <button
      onClick={() => onSelect?.(area.slug)}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer whitespace-nowrap ${
        isSelected
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
          : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800'
      }`}
    >
      <MapPin className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
      <span>{name}</span>
      {area.listing_count && (
        <span
          className={`ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
            isSelected
              ? 'bg-emerald-700 text-emerald-100'
              : 'bg-stone-100 text-stone-500'
          }`}
        >
          {language === 'bn' ? toBengaliNumber(area.listing_count) : area.listing_count}
        </span>
      )}
    </button>
  );
};
