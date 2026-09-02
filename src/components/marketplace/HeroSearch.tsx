import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Banknote, 
  Home, 
  Users, 
  Bed, 
  Layers
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { MYMENSINGH_AREAS } from '../../data/mymensingh-locations';
import { Button } from '../ui/button';
import { PropertyType, TargetAudience } from '../../types';

interface HeroSearchProps {
  onSearch?: (filters: {
    propertyType: PropertyType | 'all';
    areaSlug: string;
    audience: TargetAudience | 'all';
    budgetRange: string;
    keyword: string;
  }) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch }) => {
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<PropertyType | 'all'>('apartment');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience | 'all'>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const searchTabs = [
    { id: 'apartment', label: t.apartment, icon: Home },
    { id: 'mess', label: t.mess, icon: Users },
    { id: 'hostel', label: t.hostel, icon: Bed },
    { id: 'sublet', label: t.sublet, icon: Layers },
  ];

  const budgetOptions = [
    { id: 'all', label_bn: 'যেকোনো বাজেট', label_en: 'Any Budget' },
    { id: '0-3000', label_bn: '৳৩,০০০ এর নিচে (মেস/সিট)', label_en: 'Under ৳3,000' },
    { id: '3000-6000', label_bn: '৳৩,০০০ - ৳৬,০০০', label_en: '৳3,000 - ৳6,000' },
    { id: '6000-12000', label_bn: '৳৬,০০০ - ৳১২,০০০ (ছোট বাসা)', label_en: '৳6,000 - ৳12,000' },
    { id: '12000-20000', label_bn: '৳১২,০০০ - ৳২০,০০০ (ফ্যামিলি)', label_en: '৳12,000 - ৳20,000' },
    { id: '20000-plus', label_bn: '৳২০,০০০+ (লাক্সারি)', label_en: '৳20,000+' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({
      propertyType: activeTab,
      areaSlug: selectedArea,
      audience: selectedAudience,
      budgetRange: selectedBudget,
      keyword: searchKeyword,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-lg border border-stone-200/80">
      
      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 overflow-x-auto no-scrollbar">
        {searchTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as PropertyType)}
              className={`flex-1 min-w-[76px] sm:min-w-[100px] flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer touch-target-44 active:scale-95 ${
                isActive 
                  ? 'bg-white text-emerald-800 shadow-xs' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Inputs Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          
          {/* Area Selection */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-stone-600 mb-1 px-0.5">
              {language === 'bn' ? 'এলাকা / লোকেশন' : 'Location / Area'}
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 h-4 w-4 text-emerald-600 pointer-events-none" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">{t.allAreas} (পুরো ময়মনসিংহ)</option>
                {MYMENSINGH_AREAS.map((area) => (
                  <option key={area.id} value={area.slug}>
                    {language === 'bn' ? area.name_bn : area.name_en} {area.is_popular ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Selection */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-stone-600 mb-1 px-0.5">
              {language === 'bn' ? 'বাজেট সীমা' : 'Monthly Budget'}
            </label>
            <div className="relative flex items-center">
              <Banknote className="absolute left-3 h-4 w-4 text-emerald-600 pointer-events-none" />
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {budgetOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {language === 'bn' ? opt.label_bn : opt.label_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audience / Resident Filter */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-stone-600 mb-1 px-0.5">
              {language === 'bn' ? 'ভাড়াটিয়ার ধরন' : 'Tenant Type'}
            </label>
            <div className="relative flex items-center">
              <Users className="absolute left-3 h-4 w-4 text-emerald-600 pointer-events-none" />
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value as TargetAudience | 'all')}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">{language === 'bn' ? 'যে কারো জন্য' : 'Anyone / All'}</option>
                <option value="family">{t.family}</option>
                <option value="bachelor">{t.bachelor}</option>
                <option value="student">{t.student}</option>
                <option value="female">{t.femaleOnly}</option>
                <option value="male">{t.maleOnly}</option>
              </select>
            </div>
          </div>

        </div>

        {/* Keyword & Search CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'যেমন: ২ বেডরুম, গ্যাস, বাকৃবি গেট...' : 'e.g. 2 Bed flat, Gas, BAU Gate...'}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shrink-0 shadow-sm shadow-emerald-600/20 active:scale-95 transition-transform"
          >
            <Search className="h-4 w-4" />
            <span>{t.searchBtn}</span>
          </Button>
        </div>

      </form>
    </div>
  );
};
