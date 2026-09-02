import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Image as ImageIcon, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  LogOut, 
  ArrowLeft,
  Calendar,
  Lock,
  Building,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { ProfileUpdateSchema, ProfileUpdateValues } from '../../validations/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Container } from '../layout/Container';
import { useSEO } from '../../lib/useSEO';

interface UserProfileViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { profile, user, updateProfile, signOut } = useAuth();

  useSEO({
    title: language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings',
    noindex: true,
  });

  const [formData, setFormData] = useState<ProfileUpdateValues>({
    name: profile?.name || '',
    phone: profile?.phone || '',
    whatsapp_number: profile?.whatsapp_number || '',
    avatar_url: profile?.avatar_url || '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: keyof ProfileUpdateValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setServerError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    // Zod validation
    const result = ProfileUpdateSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        whatsapp_number: formData.whatsapp_number || undefined,
        avatar_url: formData.avatar_url || undefined,
      });

      if (res.error) {
        setServerError(res.error);
        return;
      }

      setSuccessMessage(
        language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!'
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setServerError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="py-8 sm:py-12 bg-stone-50/50 min-h-[calc(100vh-200px)]">
      <Container className="max-w-2xl">
        
        {/* Back and Title */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="h-9 px-3 rounded-xl border-stone-200 bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                {language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}
              </h1>
              <p className="text-xs text-stone-500">
                {language === 'bn' ? 'আপনার ব্যক্তিগত তথ্য ও যোগাযোগের নম্বর' : 'Manage your identity and contact info'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-9 px-3 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
          </Button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-8 space-y-6">
          
          {/* Avatar & Role Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-stone-100">
            <div className="relative">
              <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl bg-emerald-100 border-2 border-emerald-500 overflow-hidden flex items-center justify-center text-emerald-800 font-extrabold text-2xl shadow-sm">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt={formData.name || 'User'}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              {profile?.is_verified && (
                <div 
                  title="Verified User"
                  className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-stone-900">
                  {profile?.name || (language === 'bn' ? 'ব্যবহারকারী' : 'User')}
                </h3>
                
                {/* Role Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  profile?.role === 'owner'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : profile?.role === 'admin'
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}>
                  {profile?.role === 'owner' 
                    ? (language === 'bn' ? 'বাড়ির মালিক (Owner)' : 'Landlord / Owner')
                    : profile?.role === 'admin'
                    ? (language === 'bn' ? 'সুপার অ্যাডমিন' : 'Platform Admin')
                    : (language === 'bn' ? 'ভাড়াটিয়া (Tenant)' : 'Tenant')}
                </span>

                {profile?.is_verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600">
                    {language === 'bn' ? 'যাচাই বাকি' : 'Unverified'}
                  </span>
                )}
              </div>

              <div className="text-xs text-stone-500 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-stone-400" />
                  {profile?.email || user?.email || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-stone-400" />
                  {language === 'bn' ? 'যুক্ত হয়েছেন:' : 'Member since:'}{' '}
                  {new Date(profile?.created_at || Date.now()).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-stone-800">
                {language === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'}
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`pl-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                    formErrors.name ? 'border-rose-500' : ''
                  }`}
                  disabled={isLoading}
                />
              </div>
              {formErrors.name && (
                <p className="text-[11px] text-rose-600 font-medium">{formErrors.name}</p>
              )}
            </div>

            {/* Phone & WhatsApp in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'মোবাইল নম্বর (যোগাযোগের জন্য)' : 'Phone Number (For Inquiries)'}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`pl-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                      formErrors.phone ? 'border-rose-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-600 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)' : 'WhatsApp Number (Optional)'}
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="01712345678"
                    value={formData.whatsapp_number}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                    className={`pl-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                      formErrors.whatsapp_number ? 'border-rose-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.whatsapp_number && (
                  <p className="text-[11px] text-rose-600 font-medium">{formErrors.whatsapp_number}</p>
                )}
              </div>

            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <Label htmlFor="avatar" className="text-xs font-bold text-stone-800">
                {language === 'bn' ? 'প্রোফাইল ছবির URL' : 'Avatar Photo URL'}
              </Label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatar_url}
                  onChange={(e) => handleChange('avatar_url', e.target.value)}
                  className={`pl-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                    formErrors.avatar_url ? 'border-rose-500' : ''
                  }`}
                  disabled={isLoading}
                />
              </div>
              {formErrors.avatar_url && (
                <p className="text-[11px] text-rose-600 font-medium">{formErrors.avatar_url}</p>
              )}
            </div>

            {/* Security Notice: Role is immutable client-side */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-start gap-3 text-xs text-stone-600">
              <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-stone-800">
                  {language === 'bn' ? 'রোল সিকিউরিটি ও পলিসি' : 'Role Security Policy'}
                </span>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  {language === 'bn' 
                    ? 'নিরাপত্তার স্বার্থে ব্যবহারকারীর রোল (মালিক/ভাড়াটিয়া) পরিবর্তন করতে অ্যাডমিনের অনুমোদন প্রয়োজন।' 
                    : 'User roles are protected by PostgreSQL Row Level Security and cannot be modified via client input.'}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Changes...'}</span>
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                </>
              )}
            </Button>
          </form>

        </div>

      </Container>
    </div>
  );
};
