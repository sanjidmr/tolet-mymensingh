import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Users, 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Home, 
  ArrowLeft, 
  LogOut, 
  Menu, 
  X, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserCog
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Container } from '../layout/Container';
import { Badge } from '../ui/badge';
import { useSEO } from '../../lib/useSEO';

interface AdminLayoutProps {
  currentAdminTab: 'overview' | 'listings' | 'users' | 'reports' | 'areas' | 'amenities';
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  pendingListingsCount?: number;
  pendingReportsCount?: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdminTab,
  onNavigate,
  pendingListingsCount = 0,
  pendingReportsCount = 0,
  children,
}) => {
  const { language, t, toggleLanguage } = useLanguage();
  const { profile, signOut, setDemoUser } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useSEO({
    title: 'Admin Portal | ToLet Mymensingh',
    description: 'Administrative control panel for ToLet Mymensingh',
    noindex: true,
  });

  const navItems = [
    {
      id: 'overview',
      path: 'admin',
      label_bn: 'ড্যাশবোর্ড ওভারভিউ',
      label_en: 'Dashboard Overview',
      icon: Building2,
    },
    {
      id: 'listings',
      path: 'admin/listings',
      label_bn: 'লিস্টিং মডারেশন',
      label_en: 'Listing Moderation',
      icon: Home,
      badge: pendingListingsCount > 0 ? pendingListingsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'users',
      path: 'admin/users',
      label_bn: 'ইউজার ম্যানেজমেন্ট',
      label_en: 'User Management',
      icon: Users,
    },
    {
      id: 'reports',
      path: 'admin/reports',
      label_bn: 'রিপোর্ট ও কমপ্লেইন',
      label_en: 'Reports & Flagged',
      icon: AlertTriangle,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'areas',
      path: 'admin/areas',
      label_bn: 'ময়মনসিংহ এলাকা সমূহ',
      label_en: 'Areas & Locations',
      icon: MapPin,
    },
    {
      id: 'amenities',
      path: 'admin/amenities',
      label_bn: 'সুযোগ-সুবিধা ক্যাটালগ',
      label_en: 'Amenities Catalog',
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Brand & Portal Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
              aria-label="Toggle admin menu"
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div 
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white leading-none">
                    ToLet Mymensingh
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-medium">
                  {language === 'bn' ? 'অ্যাডমিনিস্ট্রেটর কন্ট্রোল প্যানেল' : 'Super Admin & Moderation Panel'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Role Switcher for Testing */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Switcher */}
            <div className="hidden md:flex items-center gap-1.5 bg-stone-800/90 px-2 py-1 rounded-xl border border-stone-700 text-xs">
              <span className="text-stone-400 text-[11px] font-medium pl-1">
                {language === 'bn' ? 'রোল টেস্ট:' : 'Role Test:'}
              </span>
              <button
                onClick={() => setDemoUser('admin')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  profile?.role === 'admin' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setDemoUser('owner')}
                className="px-2 py-0.5 rounded-lg text-xs font-medium text-stone-400 hover:text-white transition-all"
                title="Switch to Owner view"
              >
                Owner
              </button>
              <button
                onClick={() => setDemoUser('tenant')}
                className="px-2 py-0.5 rounded-lg text-xs font-medium text-stone-400 hover:text-white transition-all"
                title="Switch to Tenant view"
              >
                Tenant
              </button>
            </div>

            {/* Back to Public Site */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('home')}
              className="h-9 px-3 rounded-xl border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>{language === 'bn' ? 'মূল ওয়েবসাইটে' : 'Public Site'}</span>
            </Button>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="h-9 px-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-300 hover:text-white text-xs font-bold cursor-pointer"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>

            {/* Logout */}
            <button
              onClick={async () => {
                await signOut();
                onNavigate('home');
              }}
              className="h-9 w-9 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Desktop Admin Tab Bar */}
        <div className="hidden lg:flex items-center gap-1 px-4 sm:px-6 lg:px-8 border-t border-stone-800 bg-stone-900/60 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentAdminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{language === 'bn' ? item.label_bn : item.label_en}</span>
                {item.badge !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileNavOpen && (
        <div className="lg:hidden bg-stone-900 text-white border-b border-stone-800 p-4 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider px-2 pb-1">
            {language === 'bn' ? 'অ্যাডমিন মেনু' : 'Admin Navigation'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentAdminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.path);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-emerald-400" />
                  <span>{language === 'bn' ? item.label_bn : item.label_en}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 py-6 sm:py-8">
        <Container>
          {children}
        </Container>
      </main>

      {/* Admin Footer */}
      <footer className="py-4 bg-white border-t border-stone-200 text-center text-xs text-stone-500">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">ToLet Mymensingh System v2.4</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {language === 'bn' ? 'সার্ভার সচল ও রিয়েলটাইম মোড' : 'Server Live & Authenticated'}
            </span>
          </div>
          <p>
            {language === 'bn' 
              ? 'ময়মনসিংহ জেলা ও স্থানীয় প্রশাসন আইনানুযায়ী সকল বিজ্ঞাপন নিয়ন্ত্রিত।' 
              : 'All listings are moderated per Mymensingh rental governance guidelines.'}
          </p>
        </Container>
      </footer>
    </div>
  );
};
