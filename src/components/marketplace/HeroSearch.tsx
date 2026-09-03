import React, { useState } from "react";
import {
  Search,
  MapPin,
  Banknote,
  Home,
  Users,
  Bed,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { MYMENSINGH_AREAS } from "../../data/mymensingh-locations";
import { Button } from "../ui/button";
import { PropertyType, TargetAudience } from "../../types";

interface HeroSearchProps {
  onSearch?: (filters: {
    propertyType: PropertyType | "all";
    areaSlug: string;
    audience: TargetAudience | "all";
    budgetRange: string;
    keyword: string;
  }) => void;
}

const inputGlass =
  "w-full h-11 pl-9 pr-8 rounded-xl bg-white/[0.08] border border-white/15 text-white text-xs sm:text-sm font-medium placeholder:text-white/50 focus:bg-white/[0.14] focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all appearance-none cursor-pointer backdrop-blur-sm";

const labelGlass = "block text-[11px] font-bold text-emerald-100/90 mb-1 px-0.5";

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch }) => {
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<PropertyType | "all">("apartment");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience | "all">("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const searchTabs = [
    { id: "apartment", label: t.apartment, icon: Home },
    { id: "mess", label: t.mess, icon: Users },
    { id: "hostel", label: t.hostel, icon: Bed },
    { id: "sublet", label: t.sublet, icon: Layers },
  ];

  const budgetOptions = [
    { id: "all", label_bn: "যেকোনো বাজেট", label_en: "Any Budget" },
    { id: "0-3000", label_bn: "৳৩,০০০ এর নিচে (মেস/সিট)", label_en: "Under ৳3,000" },
    { id: "3000-6000", label_bn: "৳৩,০০০ - ৳৬,০০০", label_en: "৳3,000 - ৳6,000" },
    { id: "6000-12000", label_bn: "৳৬,০০০ - ৳১২,০০০ (ছোট বাসা)", label_en: "৳6,000 - ৳12,000" },
    { id: "12000-20000", label_bn: "৳১২,০০০ - ৳২০,০০০ (ফ্যামিলি)", label_en: "৳12,000 - ৳20,000" },
    { id: "20000-plus", label_bn: "৳২০,০০০+ (লাক্সারি)", label_en: "৳20,000+" },
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
    <div className="w-full max-w-4xl mx-auto rounded-3xl p-3.5 sm:p-5 bg-emerald-950/40 backdrop-blur-md border border-white/15 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.06] rounded-xl sm:rounded-2xl mb-3 sm:mb-4 overflow-x-auto no-scrollbar border border-white/10">
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
                  ? "bg-emerald-500/30 text-white shadow-[0_0_14px_rgba(16,185,129,0.35)] border border-emerald-400/50"
                  : "text-emerald-50/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? "text-emerald-300" : "text-emerald-200/70"}`} />
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
            <label className={labelGlass}>
              {language === "bn" ? "এলাকা / লোকেশন" : "Location / Area"}
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 h-4 w-4 text-emerald-300 pointer-events-none" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className={inputGlass}
              >
                <option value="all" className="text-stone-900">{t.allAreas} (পুরো ময়মনসিংহ)</option>
                {MYMENSINGH_AREAS.map((area) => (
                  <option key={area.id} value={area.slug} className="text-stone-900">
                    {language === "bn" ? area.name_bn : area.name_en} {area.is_popular ? "★" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-emerald-200/80 pointer-events-none" />
            </div>
          </div>

          {/* Budget Selection */}
          <div className="relative">
            <label className={labelGlass}>
              {language === "bn" ? "বাজেট সীমা" : "Monthly Budget"}
            </label>
            <div className="relative flex items-center">
              <Banknote className="absolute left-3 h-4 w-4 text-emerald-300 pointer-events-none" />
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className={inputGlass}
              >
                {budgetOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="text-stone-900">
                    {language === "bn" ? opt.label_bn : opt.label_en}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-emerald-200/80 pointer-events-none" />
            </div>
          </div>

          {/* Audience / Resident Filter */}
          <div className="relative">
            <label className={labelGlass}>
              {language === "bn" ? "ভাড়াটিয়ার ধরন" : "Tenant Type"}
            </label>
            <div className="relative flex items-center">
              <Users className="absolute left-3 h-4 w-4 text-emerald-300 pointer-events-none" />
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value as TargetAudience | "all")}
                className={inputGlass}
              >
                <option value="all" className="text-stone-900">{language === "bn" ? "যে কারো জন্য" : "Anyone / All"}</option>
                <option value="family" className="text-stone-900">{t.family}</option>
                <option value="bachelor" className="text-stone-900">{t.bachelor}</option>
                <option value="student" className="text-stone-900">{t.student}</option>
                <option value="female" className="text-stone-900">{t.femaleOnly}</option>
                <option value="male" className="text-stone-900">{t.maleOnly}</option>
              </select>
              <ChevronDown className="absolute right-3 h-3.5 w-3.5 text-emerald-200/80 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Keyword & Search CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200/70" />
            <input
              type="text"
              placeholder={language === "bn" ? "যেমন: ২ বেডরুম, গ্যাস, বাকৃবি গেট..." : "e.g. 2 Bed flat, Gas, BAU Gate..."}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={`${inputGlass} cursor-text`}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 px-7 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
          >
            <Search className="h-4 w-4" />
            <span>{t.searchBtn}</span>
          </Button>
        </div>

      </form>
    </div>
  );
};
