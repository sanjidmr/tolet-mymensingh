import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Star, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Building2, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Area } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { 
  fetchAdminAreas, 
  adminCreateArea, 
  adminUpdateArea, 
  adminDeleteArea 
} from '../../lib/supabase';
import { toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

interface AdminAreasViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const AdminAreasView: React.FC<AdminAreasViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name_bn: '',
    name_en: '',
    slug: '',
    description_bn: '',
    description_en: '',
    is_popular: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAreas();
      setAreas(data);
    } catch (err) {
      console.error('Error loading areas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name_bn: '',
      name_en: '',
      slug: '',
      description_bn: '',
      description_en: '',
      is_popular: false,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name_bn: area.name_bn,
      name_en: area.name_en,
      slug: area.slug,
      description_bn: area.description_bn || '',
      description_en: area.description_en || '',
      is_popular: area.is_popular,
    });
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_bn || !formData.name_en) return;

    setIsSubmitting(true);
    const slug = formData.slug || formData.name_en.toLowerCase().replace(/\s+/g, '-');

    if (editingArea) {
      await adminUpdateArea(editingArea.id, {
        name_bn: formData.name_bn,
        name_en: formData.name_en,
        slug,
        description_bn: formData.description_bn,
        description_en: formData.description_en,
        is_popular: formData.is_popular,
      });
      setEditingArea(null);
    } else {
      await adminCreateArea({
        name_bn: formData.name_bn,
        name_en: formData.name_en,
        slug,
        description_bn: formData.description_bn,
        description_en: formData.description_en,
        is_popular: formData.is_popular,
      });
      setIsAddOpen(false);
    }

    setIsSubmitting(false);
    loadAreas();
  };

  const handleTogglePopular = async (id: string, current: boolean) => {
    await adminUpdateArea(id, { is_popular: !current });
    loadAreas();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(language === 'bn' ? `আপনি কি নিশ্চিতভাবে "${name}" এলাকা মুছে ফেলতে চান?` : `Delete area "${name}"?`)) {
      return;
    }
    await adminDeleteArea(id);
    loadAreas();
  };

  const filteredAreas = areas.filter((a) =>
    a.name_bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900">
              {language === 'bn' ? 'ময়মনসিংহ এলাকা ও লোকেশন' : 'Mymensingh Areas & Locations'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-stone-900 text-white">
              {toBengaliNumber(areas.length, language)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'bn' ? 'ময়মনসিংহ শহরের আবাসিক এলাকা ও লোকেশন কনফিগার করুন' : 'Manage searchable neighborhoods and popular hubs in Mymensingh'}
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold h-10 px-4 shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>{language === 'bn' ? 'নতুন এলাকা যোগ করুন' : 'Add New Area'}</span>
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
            placeholder={language === 'bn' ? 'এলাকার নাম (বাংলা বা ইংরেজি) দিয়ে সার্চ করুন...' : 'Search by area name or slug...'}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
          />
        </div>
      </div>

      {/* Area Cards / Table */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          এলাকা লোড হচ্ছে...
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-stone-200 p-8 space-y-2">
          <MapPin className="h-10 w-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">কোনো এলাকা পাওয়া যায়নি</h3>
          <p className="text-xs text-stone-500">নতুন এলাকা যোগ করতে ওপরের বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {area.is_popular && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        পপুলার
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600">
                      {toBengaliNumber(area.listing_count || 0, language)} টি বাসা
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    {area.name_bn}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {area.name_en} <span className="text-[10px] font-mono text-stone-400">({area.slug})</span>
                  </p>
                </div>

                {area.description_bn && (
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed bg-stone-50 p-2 rounded-xl">
                    {area.description_bn}
                  </p>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  onClick={() => handleTogglePopular(area.id, area.is_popular)}
                  className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    area.is_popular ? 'text-amber-600 hover:text-amber-700' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${area.is_popular ? 'fill-current' : ''}`} />
                  <span>{area.is_popular ? 'জনপ্রিয়' : 'জনপ্রিয় করুন'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(area)}
                    className="h-8 w-8 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit area"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id, area.name_bn)}
                    className="h-8 w-8 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete area"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Area Dialog Modal */}
      <Dialog open={isAddOpen || !!editingArea} onOpenChange={(open) => !open && (setIsAddOpen(false), setEditingArea(null))}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-stone-200 p-6">
          <form onSubmit={handleSaveArea}>
            <DialogHeader className="text-left space-y-1.5">
              <DialogTitle className="text-lg font-bold text-stone-900">
                {editingArea ? (language === 'bn' ? 'এলাকা সম্পাদনা' : 'Edit Area') : (language === 'bn' ? 'নতুন এলাকা যুক্ত করুন' : 'Add New Area')}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600">
                {language === 'bn' ? 'ময়মনসিংহ শহরের নতুন এলাকার বাংলা ও ইংরেজি নাম দিন।' : 'Provide Bangla and English names and popular badge flag.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'এলাকার নাম (বাংলা) *' : 'Area Name (Bangla) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_bn}
                  onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  placeholder="যেমন: নতুন বাজার, চরপাড়া..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'এলাকার নাম (English) *' : 'Area Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Nutun Bazar, Charpara..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-emerald-500 text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'স্লাগ (URL Slug)' : 'Slug'}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. nutun-bazar"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'bn' ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Description (Bangla)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description_bn}
                  onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                  placeholder="এলাকা সম্পর্কে সংক্ষেপ বিবরণ..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_popular"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="is_popular" className="text-xs font-bold text-stone-800 cursor-pointer">
                  {language === 'bn' ? 'হোমপেজে জনপ্রিয় (Popular) হিসেবে দেখান' : 'Show as Popular Area on Homepage'}
                </label>
              </div>
            </div>

            <DialogFooter className="flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => (setIsAddOpen(false), setEditingArea(null))}
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
