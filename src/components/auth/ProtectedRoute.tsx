import React from 'react';
import { Lock, ShieldAlert, ArrowRight, UserCheck, LogIn } from 'lucide-react';
import { useAuth } from '../../lib/supabase';
import { useLanguage } from '../../lib/language-context';
import { UserRole } from '../../types';
import { Button } from '../ui/button';
import { Container } from '../layout/Container';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  requiredViewName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onNavigate,
  requiredViewName = 'dashboard',
}) => {
  const { isAuthenticated, profile, isLoading, user } = useAuth();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-10 w-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-stone-500">
          {language === 'bn' ? 'অথেনটিকেশন যাচাই করা হচ্ছে...' : 'Verifying authentication...'}
        </p>
      </div>
    );
  }

  // 1. Unauthenticated Access Check
  if (!isAuthenticated && !user && !profile) {
    return (
      <div className="py-12 sm:py-16 bg-stone-50/50 min-h-[70vh] flex items-center">
        <Container className="max-w-md">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg p-6 sm:p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                {language === 'bn' ? 'লগইন আবশ্যক' : 'Authentication Required'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                {language === 'bn' 
                  ? 'এই পেজটি ব্যবহার করতে আপনাকে প্রথমে আপনার অ্যাকাউন্টে লগইন করতে হবে।' 
                  : 'Please sign in to your ToLet Mymensingh account to view this page.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => onNavigate('login', { returnTo: requiredViewName })}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In Now'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => onNavigate('register')}
                className="w-full h-11 border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-semibold text-sm cursor-pointer"
              >
                <span>{language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create New Account'}</span>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // 2. Role-Based Authorization Check
  if (allowedRoles && allowedRoles.length > 0 && profile) {
    const isAllowed = allowedRoles.includes(profile.role);
    if (!isAllowed) {
      return (
        <div className="py-12 sm:py-16 bg-stone-50/50 min-h-[70vh] flex items-center">
          <Container className="max-w-md">
            <div className="bg-white rounded-3xl border border-rose-200 shadow-lg p-6 sm:p-8 text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                  {language === 'bn' ? 'অননুমোদিত প্রবেশাধিকার' : 'Access Restricted'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600">
                  {language === 'bn' 
                    ? `আপনার বর্তমান রোল (${profile.role === 'tenant' ? 'ভাড়াটিয়া' : profile.role === 'owner' ? 'মালিক' : 'অ্যাডমিন'}) এর জন্য এই সেকশনটি উন্মুক্ত নয়।` 
                    : `Your current role (${profile.role}) does not have permission to view this section.`}
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl text-xs text-stone-600 text-left space-y-1">
                <div className="font-bold text-stone-800">
                  {language === 'bn' ? 'প্রয়োজনীয় রোল:' : 'Required Role:'}
                </div>
                <div className="flex gap-2">
                  {allowedRoles.map((r) => (
                    <span key={r} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => onNavigate('dashboard')}
                className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" />
                <span>{language === 'bn' ? 'আমার ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
              </Button>
            </div>
          </Container>
        </div>
      );
    }
  }

  return <>{children}</>;
};
