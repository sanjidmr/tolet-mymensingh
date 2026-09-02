import React, { useState } from 'react';
import { 
  Home, 
  PlusCircle, 
  MapPin, 
  Globe, 
  Menu, 
  Heart, 
  PhoneCall, 
  Building2,
  Users,
  Bed,
  Layers,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Container } from './Container';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '../ui/sheet';
import { MYMENSINGH_AREAS } from '../../data/mymensingh-locations';

interface HeaderProps {
  currentView?: string;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  favoritesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView = 'home', 
  onNavigate, 
  favoritesCount = 0 
}) => {
  const { language, t, toggleLanguage } = useLanguage();
  const { isAuthenticated, profile, signOut, isOwner, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'tolet', label: t.findHome, icon: Home },
    { id: 'mess', label: t.findMess, icon: Users },
    { id: 'hostel', label: t.findHostel, icon: Bed },
    { id: 'sublet', label: t.findSublet, icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all">
      {/* Top Banner for City & Trust (Desktop/Tablet Only) - Ultra Slim */}
      <div className="bg-stone-900 text-stone-300 text-[10px] py-0.5 px-4 hidden md:block">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <MapPin className="h-2.5 w-2.5" />
              {language === 'bn' ? 'ময়মনসিংহ শহর ও আশপাশের সকল এলাকা' : 'Covering all areas of Mymensingh City'}
            </span>
            <span className="text-stone-600">•</span>
            <span className="text-stone-400 text-[9px]">
              {language === 'bn' ? '১০০% বিশ্বস্ত ও স্থানীয় প্ল্যাটফর্ম' : '100% Trusted Local Rental Marketplace'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-stone-300">
            <div className="flex items-center gap-1 text-[10px]">
              <PhoneCall className="h-2.5 w-2.5 text-emerald-400" />
              <span>01700-000000</span>
            </div>
            <span className="text-stone-600">|</span>
            <button 
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-stone-200 hover:text-white font-semibold cursor-pointer transition-colors"
              title="Change Language"
            >
              <Globe className="h-2.5 w-2.5 text-emerald-400" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </Container>
      </div>

      {/* Main Navigation Bar - Super Compact */}
      <div className="py-1 sm:py-1.5">
        <Container className="flex items-center justify-between gap-2.5">
          
          {/* Logo & City Identity */}
          <div 
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
          >
            <div className="h-7 w-7 sm:h-7.5 sm:w-7.5 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-stone-900 leading-none">
                  {language === 'bn' ? 'টু-লেট ময়মনসিংহ' : 'ToLet Mymensingh'}
                </span>
              </div>
              <p className="text-[9px] text-stone-500 font-medium leading-tight">
                {language === 'bn' ? 'বাসা, মেস ও হোস্টেল' : 'Rental Marketplace'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-stone-100/70 p-0.5 rounded-lg border border-stone-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(item.id)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white text-emerald-800 shadow-2xs' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className={`h-3 w-3 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Switcher Button (Mobile/Tablet) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="lg:hidden h-7 px-2 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1 border border-stone-200 hover:bg-stone-200 transition-colors"
              aria-label="Change Language"
            >
              <Globe className="h-3 w-3 text-emerald-600" />
              <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Saved Favorites Button (Tablet/Desktop) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('favorites')}
              className="hidden sm:inline-flex relative h-7.5 px-2.5 rounded-lg border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold"
            >
              <Heart className="h-3 w-3 mr-1 text-rose-500" />
              <span>{t.favorites}</span>
              {favoritesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                  {favoritesCount}
                </span>
              )}
            </Button>

            {/* Post Property Primary CTA (Desktop & Tablet) */}
            <Button
              onClick={() => onNavigate?.('post-property')}
              className="hidden md:inline-flex h-7.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-bold text-xs items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t.postProperty}</span>
            </Button>

            {/* Auth Dropdown / Login Button (Desktop) */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 h-7.5 p-1 pl-1.5 rounded-lg border border-stone-200 hover:border-emerald-500 bg-stone-50/80 hover:bg-white transition-all cursor-pointer select-none"
                >
                  <div className="h-5.5 w-5.5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="text-left hidden md:block leading-none pr-0.5">
                    <div className="text-[11px] font-bold text-stone-800 line-clamp-1 max-w-[85px]">
                      {profile?.name || 'Account'}
                    </div>
                    <span className="text-[8.5px] text-emerald-700 font-semibold uppercase">
                      {profile?.role === 'owner' ? 'মালিক' : profile?.role === 'admin' ? 'অ্যাডমিন' : 'ভাড়াটিয়া'}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-stone-200 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                      <div className="px-3.5 py-1.5 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-900 truncate">{profile?.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{profile?.phone || profile?.email}</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.('dashboard');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-emerald-700 cursor-pointer text-left"
                      >
                        <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.('dashboard/profile');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-emerald-700 cursor-pointer text-left"
                      >
                        <Settings className="h-3.5 w-3.5 text-stone-500" />
                        <span>{language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate?.('admin');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 cursor-pointer text-left"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                          <span>{language === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
                        </button>
                      )}

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate?.('post-property');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-emerald-700 cursor-pointer text-left"
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t.postProperty}</span>
                        </button>
                      )}

                      <div className="border-t border-stone-100 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            await signOut();
                            setIsUserDropdownOpen(false);
                            onNavigate?.('home');
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer text-left"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate?.('login')}
                  className="h-7.5 px-2.5 rounded-lg border-stone-200 text-stone-700 hover:text-emerald-700 text-xs font-bold cursor-pointer"
                >
                  <LogIn className="h-3 w-3 mr-1" />
                  <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => onNavigate?.('register')}
                  className="h-7.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
                >
                  <span>{language === 'bn' ? 'রেজিস্টার' : 'Register'}</span>
                </Button>
              </div>
            )}

            {/* Mobile Menu Drawer Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 rounded-xl text-stone-700 hover:bg-stone-100 touch-target-44"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs flex flex-col p-5">
                <SheetHeader className="text-left pb-3 border-b border-stone-100">
                  <SheetTitle className="flex items-center gap-2 text-stone-900 text-base">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    <span>{t.appName}</span>
                  </SheetTitle>
                  <p className="text-[11px] text-stone-500">
                    {language === 'bn' ? 'ময়মনসিংহের সেরা টু-লেট সেবা' : 'Mymensingh Rental Marketplace'}
                  </p>
                </SheetHeader>

                {/* Mobile Navigation List */}
                <div className="py-3 space-y-1 flex-1 overflow-y-auto">
                  {isAuthenticated ? (
                    <div className="p-3 bg-emerald-50/80 rounded-xl mb-3 flex items-center justify-between border border-emerald-100">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 line-clamp-1">{profile?.name}</p>
                          <span className="text-[10px] text-emerald-800 font-bold uppercase">
                            {profile?.role === 'owner' ? 'বাড়ির মালিক' : profile?.role === 'admin' ? 'অ্যাডমিন' : 'ভাড়াটিয়া'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          setIsMobileMenuOpen(false);
                          onNavigate?.('home');
                        }}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        {language === 'bn' ? 'লগআউট' : 'Logout'}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onNavigate?.('login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="h-9 rounded-xl border-stone-200 text-stone-800 font-bold text-xs"
                      >
                        <LogIn className="h-3.5 w-3.5 mr-1" />
                        <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          onNavigate?.('register');
                          setIsMobileMenuOpen(false);
                        }}
                        className="h-9 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
                      >
                        <span>{language === 'bn' ? 'রেজিস্টার' : 'Register'}</span>
                      </Button>
                    </div>
                  )}

                  {isAuthenticated && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.('dashboard');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.('dashboard/profile');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                          <Settings className="h-3.5 w-3.5" />
                        </div>
                        <span>{language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate?.('admin');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 hover:bg-amber-100 transition-colors text-left cursor-pointer"
                        >
                          <div className="h-7 w-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </div>
                          <span>{language === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}</span>
                        </button>
                      )}
                    </>
                  )}

                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 my-2 pt-1">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate?.(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 my-2 pt-2 border-t border-stone-100">
                    {language === 'bn' ? 'জনপ্রিয় এলাকা' : 'Popular Areas'}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 px-2">
                    {MYMENSINGH_AREAS.slice(0, 6).map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => {
                          onNavigate?.('tolet', { areaSlug: area.slug });
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-1.5 text-[11px] font-medium text-stone-700 bg-stone-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 text-left truncate"
                      >
                        📍 {language === 'bn' ? area.name_bn : area.name_en}
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

          </div>

        </Container>
      </div>
    </header>
  );
};
