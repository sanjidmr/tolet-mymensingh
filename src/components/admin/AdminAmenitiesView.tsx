import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle2, 
  Flame, 
  Wifi, 
  Droplets, 
  ShieldCheck, 
  Zap, 
  Utensils, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { Amenity } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { 
  fetchAdminAmenities, 
  adminCreateAmenity, 
  adminUpdateAmenity, 
  adminDeleteAmenity 
} from '../../lib/supabase';
import { toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

interface AdminAmenitiesViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

const CATEGORY_META: Record<Amenity['category'], { label_bn: string; label_en: string; color: string }> = {
  core: { label_bn: 'মৌলিক সুবিধা ও ইউটিলিটি (Core)', label_en: 'Core Utilities', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  comfort: { label_bn: 'আরামদায়ক জীবনযাপন (Comfort)', label_en: 'Comfort & Living', color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
  security: { label_bn: 'নিরাপত্তা ও ভবন ব্যবস্থা (Security)', label_en: 'Building & Security', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  meal_service: { label_bn: 'খাবার ও মেস সুবিধা (Meal & Mess)', label_en: 'Meal & Mess Services', color: 'bg-rose-50 text-rose-900 border-rose-200' },
};

const ICON_PRESETS = [
  { name: 'Flame', label: 'গ্যাস / চুলা' },
  { name: 'Droplets', label: 'পানি / সাপ্লাই' },
  { name: 'Zap', label: 'বিদ্যুৎ / জেনারেটর' },
  { name: 'Wifi', label: 'ইন্টারনেট / ওয়াইফাই' },
  { name: 'ShieldCheck', label: 'গার্ড / সিসিটিভি' },
  { name: 'Utensils', label: 'খাবার / ডাইনিং' },
  { name: 'CheckCircle', label: 'সাধারণ সুবিধা' },
];

export const AdminAmenitiesView: React.FC<AdminAmenitiesViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);

  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    icon_name: 'CheckCircle',
    category: 'core' as Amenity['category'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAmenities = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAmenities();
      setAmenities(data);
    } catch (err) {
      console.error('Error loading amenities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmenities();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name_bn: '',
      name_en: '',
      icon_name: 'Flame',
      category: 'core',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name_bn: amenity.name_bn,
      name_en: amenity.name_en,
      icon_name: amenity.icon_name || 'CheckCircle',
      category: amenity.category,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_bn || !formData.name_en) return;

    setIsSubmitting(true);
    if (editingAmenity) {
      await adminUpdateAmenity(editingAmenity.id, {
        name_bn: formData.name_bn,
        name_en: formData.name_en,
        icon_name: formData.icon_name,
        category: formData.category,
      });
      setEditingAmenity(null);
    } else {
      await adminCreateAmenity({
        name_bn: formData.name_bn,
        name_en: formData.name_en,
        icon_name: formData.icon_name,
        category: formData.category,
      });
      setIsAddOpen(false);
    }
    setIsSubmitting(false);
    loadAmenities();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(language === 'bn' ? `আপনি কি "${name}" সুবিধাটি মুছে ফেলতে চান?` : `Delete amenity "${name}"?`)) {
      return;
    }
    await adminDeleteAmenity(id);
    loadAmenities();
  };

  const filteredAmenities = amenities.filter((a) =>
    a.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: Amenity['category'][] = ['core', 'comfort', 'security', 'meal_service'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900">
              {language === 'bn' ? 'সুযোগ-সুবিধা ক্যাটালগ' : 'Amenities & Features Catalog'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-stone-900 text-white">
              {toBengaliNumber(amenities.length, language)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'bn' ? 'বিজ্ঞাপন সাবমিশনের সুযোগ-সুবিধার তালিকা ও ফিল্টার অপশন পরিচালনা করুন' : 'Manage searchable amenity filters available for landlord listings'}
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold h-10 px-4 shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>{language === 'bn' ? 'নতুন সুবিধা যোগ করুন' : 'Add New Amenity'}</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'সুবিধার নাম দিয়ে সার্চ করুন (যেমন: গ্যাস, ওয়াইফাই)...' : 'Search amenities...'}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
          />
        </div>
      </div>

      {/* Grouped Amenities List */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          সুবিধা তালিকা লোড হচ্ছে...
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catItems = filteredAmenities.filter((a) => a.category === cat);
            const meta = CATEGORY_META[cat];
            if (catItems.length === 0 && searchQuery) return null;

            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wide">
                    {language === 'bn' ? meta.label_bn : meta.label_en}
                  </h3>
                  <span className="text-xs text-stone-400 font-bold">
                    ({toBengaliNumber(catItems.length, language)})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {item.name_bn}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate">
                            {item.name_en}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 w-7 rounded-lg text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name_bn)}
                          className="h-7 w-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={isAddOpen || !!editingAmenity} onOpenChange={(open) => !open && (setIsAddOpen(false), setEditingAmenity(null))}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-stone-200 p-6">
          <form onSubmit={handleSave}>
            <DialogHeader className="text-left space-y-1.5">
              <DialogTitle className="text-lg font-bold text-stone-900">
                {editingAmenity ? (language === 'bn' ? 'সুবিধা সম্পাদনা' : 'Edit Amenity') : (language === 'bn' ? 'নতুন সুবিধা যোগ করুন' : 'Add New Amenity')}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600">
                {language === 'bn' ? 'সুবিধার নাম, ক্যাটাগরি এবং আইকন নির্ধারণ করুন।' : 'Set amenity names and select appropriate category.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'সুবিধার নাম (বাংলা) *' : 'Amenity Name (Bangla) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_bn}
                  onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  placeholder="যেমন: তিতাস গ্যাস, ২৪ ঘণ্টা পানি..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'সুবিধার নাম (English) *' : 'Amenity Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Titas Gas, 24/7 Water..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'ক্যাটাগরি নির্বাচন *' : 'Category *'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 text-stone-900"
                >
                  <option value="core">Core Utilities (মৌলিক ও ইউটিলিটি)</option>
                  <option value="comfort">Comfort & Living (আরামদায়ক সুবিধা)</option>
                  <option value="security">Security & Building (নিরাপত্তা ও ভবন)</option>
                  <option value="meal_service">Meal & Mess (খাবার ও মেস)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'আইকন প্রিসেট' : 'Icon Preset'}
                </label>
                <select
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 text-stone-900"
                >
                  {ICON_PRESETS.map((ic) => (
                    <option key={ic.name} value={ic.name}>
                      {ic.label} ({ic.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => (setIsAddOpen(false), setEditingAmenity(null))}
                className="flex-1 sm:flex-none rounded-xl border-stone-200 text-xs font-bold"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};
