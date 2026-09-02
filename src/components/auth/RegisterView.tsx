import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Home, 
  UserCheck,
  Check
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { RegisterFormSchema, RegisterFormValues } from '../../validations/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Container } from '../layout/Container';
import { useSEO } from '../../lib/useSEO';

interface RegisterViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  initialRole?: 'tenant' | 'owner';
}

export const RegisterView: React.FC<RegisterViewProps> = ({ 
  onNavigate, 
  initialRole = 'tenant' 
}) => {
  const { language } = useLanguage();
  const { signUpWithEmail } = useAuth();

  useSEO({
    title: language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন | ToLet Mymensingh' : 'Create Account | ToLet Mymensingh',
    description: 'Register as landlord or tenant on ToLet Mymensingh',
    noindex: true,
  });

  const [formData, setFormData] = useState<RegisterFormValues>({
    name: '',
    email: '',
    phone: '',
    role: initialRole,
    password: '',
    confirmPassword: '',
    termsAccepted: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: keyof RegisterFormValues, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    // Zod validation with safe schema parsing
    const result = RegisterFormSchema.safeParse(formData);
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
      // Role is guaranteed by schema to only be 'tenant' | 'owner'
      const res = await signUpWithEmail(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
      });

      if (res.error) {
        setServerError(res.error);
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        res.message || (language === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...' : 'Account created successfully! Redirecting...')
      );

      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-14 bg-stone-50/60 min-h-[calc(100vh-200px)]">
      <Container className="max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div 
            onClick={() => onNavigate('home')} 
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 cursor-pointer hover:bg-emerald-700 transition-all hover:scale-105"
          >
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create an Account'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'bn' 
              ? 'ময়মনসিংহ শহরের সেরা টু-লেট সেবা পেতে যুক্ত হোন' 
              : 'Join Mymensingh’s trusted rental community'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/50 p-6 sm:p-8 space-y-6">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Step 1: Role Selector (Owner vs Tenant) */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-stone-800">
                {language === 'bn' ? 'আপনার অ্যাকাউন্টের ধরন নির্বাচন করুন' : 'Select Your Account Type'}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Tenant Option */}
                <div
                  onClick={() => handleChange('role', 'tenant')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${
                    formData.role === 'tenant'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    formData.role === 'tenant' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                  }`}>
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'ভাড়াটিয়া (Tenant)' : 'Tenant / Student'}</span>
                      {formData.role === 'tenant' && (
                        <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      {language === 'bn' ? 'বাসা, রুম, মেস বা সিট খুঁজছেন' : 'Looking for flats, mess or seats'}
                    </p>
                  </div>
                </div>

                {/* Owner Option */}
                <div
                  onClick={() => handleChange('role', 'owner')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${
                    formData.role === 'owner'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    formData.role === 'owner' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                  }`}>
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'বাড়ির মালিক (Owner)' : 'House Landlord'}</span>
                      {formData.role === 'owner' && (
                        <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      {language === 'bn' ? 'বাসা বা মেস ভাড়া দেওয়ার বিজ্ঞাপন দিতে চান' : 'Want to post rental ads & manage properties'}
                    </p>
                  </div>
                </div>

              </div>
              {formErrors.role && (
                <p className="text-[11px] text-rose-600 font-medium">{formErrors.role}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-stone-800">
                {language === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'}
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: মোঃ আব্দুল্লাহ' : 'e.g. Abdullah Khan'}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`pl-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                    formErrors.name ? 'border-rose-500 focus:ring-rose-500' : ''
                  }`}
                  disabled={isLoading}
                />
              </div>
              {formErrors.name && (
                <p className="text-[11px] text-rose-600 font-medium">{formErrors.name}</p>
              )}
            </div>

            {/* Phone and Email in responsive 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone Field */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01712345678"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`pl-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                      formErrors.phone ? 'border-rose-500 focus:ring-rose-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-600 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                      formErrors.email ? 'border-rose-500 focus:ring-rose-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-600 font-medium">{formErrors.email}</p>
                )}
              </div>

            </div>

            {/* Passwords in responsive 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min 6 chars)'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`pl-10 pr-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                      formErrors.password ? 'border-rose-500 focus:ring-rose-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-rose-600 font-medium">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 h-11 rounded-xl bg-stone-50/50 border-stone-200 focus:bg-white text-sm ${
                      formErrors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-medium">{formErrors.confirmPassword}</p>
                )}
              </div>

            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-stone-600 leading-snug cursor-pointer select-none">
                {language === 'bn' ? (
                  <span>
                    আমি টু-লেট ময়মনসিংহের <span className="font-semibold text-emerald-700">ব্যবহারের নীতিমালা</span> এবং <span className="font-semibold text-emerald-700">গোপনীয়তা শর্তাবলী</span> মেনে নিচ্ছি।
                  </span>
                ) : (
                  <span>
                    I agree to the <span className="font-semibold text-emerald-700">Terms of Service</span> and <span className="font-semibold text-emerald-700">Privacy Policy</span> of ToLet Mymensingh.
                  </span>
                )}
              </label>
            </div>
            {formErrors.termsAccepted && (
              <p className="text-[11px] text-rose-600 font-medium">{formErrors.termsAccepted}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <>
                  <span>
                    {formData.role === 'owner' 
                      ? (language === 'bn' ? 'মালিক হিসেবে রেজিস্টার করুন' : 'Register as Landlord') 
                      : (language === 'bn' ? 'ভাড়াটিয়া হিসেবে রেজিস্টার করুন' : 'Register as Tenant')}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-600">
              {language === 'bn' ? 'ইতোমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer ml-1"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'আপনার ব্যক্তিগত তথ্যের ১০০% সুরক্ষা ও নিরাপত্তা' : '100% Privacy & Data Security'}</span>
          </div>
        </div>
      </Container>
    </div>
  );
};
