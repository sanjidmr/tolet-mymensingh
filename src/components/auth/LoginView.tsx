import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  Home, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { LoginFormSchema, LoginFormValues } from '../../validations/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Container } from '../layout/Container';
import { useSEO } from '../../lib/useSEO';

interface LoginViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  returnTo?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, returnTo = 'dashboard' }) => {
  const { language } = useLanguage();
  const { signInWithEmail, setDemoUser, isConfigured } = useAuth();

  useSEO({
    title: language === 'bn' ? 'লগইন করুন | ToLet Mymensingh' : 'Login | ToLet Mymensingh',
    description: 'Account login for landlords and tenants on ToLet Mymensingh',
    noindex: true,
  });

  const [formData, setFormData] = useState<LoginFormValues>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: keyof LoginFormValues, value: any) => {
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

    // Zod validation
    const result = LoginFormSchema.safeParse(formData);
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
      const res = await signInWithEmail(formData.email, formData.password);
      if (res.error) {
        setServerError(res.error);
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        language === 'bn' ? 'সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...' : 'Login successful! Redirecting...'
      );
      setTimeout(() => {
        onNavigate(returnTo);
      }, 700);
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: 'owner' | 'tenant' | 'admin') => {
    setDemoUser(role);
    setSuccessMessage(
      language === 'bn' 
        ? `${role === 'owner' ? 'মালিক' : role === 'tenant' ? 'ভাড়াটিয়া' : 'অ্যাডমিন'} হিসেবে দ্রুত লগইন করা হয়েছে!` 
        : `Signed in as Demo ${role.toUpperCase()}!`
    );
    setTimeout(() => {
      onNavigate(returnTo);
    }, 600);
  };

  return (
    <div className="py-8 sm:py-14 bg-stone-50/60 min-h-[calc(100vh-200px)]">
      <Container className="max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div 
            onClick={() => onNavigate('home')} 
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 cursor-pointer hover:bg-emerald-700 transition-all hover:scale-105"
          >
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {language === 'bn' ? 'টু-লেট ময়মনসিংহে লগইন' : 'Sign in to ToLet Mymensingh'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'bn' 
              ? 'আপনার বাসা, মেস অথবা হোস্টেল ম্যানেজ করতে লগইন করুন' 
              : 'Manage your listings, bookmarks, and rental requests'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/50 p-6 sm:p-8 space-y-6">
          {/* Quick Demo Logins for Instant Testing */}
          <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                {language === 'bn' ? 'দ্রুত রোল টেস্ট (১ ক্লিকে লগইন)' : 'Quick Role Test (1-Click Switch)'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                Instant
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('owner')}
                className="p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 font-bold text-stone-700 transition-all text-center flex flex-col items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Home className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px]">{language === 'bn' ? 'মালিক (Owner)' : 'Landlord'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('tenant')}
                className="p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 font-bold text-stone-700 transition-all text-center flex flex-col items-center gap-1 cursor-pointer shadow-2xs"
              >
                <UserCheck className="h-3.5 w-3.5 text-sky-600" />
                <span className="text-[11px]">{language === 'bn' ? 'ভাড়াটিয়া' : 'Tenant'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 font-bold text-stone-700 transition-all text-center flex flex-col items-center gap-1 cursor-pointer shadow-2xs"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-[11px]">{language === 'bn' ? 'অ্যাডমিন' : 'Admin'}</span>
              </button>
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </Label>
                <button
                  type="button"
                  onClick={() => alert(language === 'bn' ? 'পাসওয়ার্ড রিসেট করতে অ্যাডমিনের সাথে যোগাযোগ করুন: 01700-000000' : 'Please contact helpline to reset password: 01700-000000')}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'ভুলে গেছেন?' : 'Forgot?'}
                </button>
              </div>
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...'}</span>
                </div>
              ) : (
                <>
                  <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-600">
              {language === 'bn' ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer ml-1"
              >
                {language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an account'}
              </button>
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'ময়মনসিংহ শহরের নিরাপদ টু-লেট সেবা' : 'End-to-End Encrypted Auth'}</span>
          </div>
        </div>
      </Container>
    </div>
  );
};
