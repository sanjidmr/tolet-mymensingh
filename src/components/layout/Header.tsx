import React, { useEffect, useState } from "react";
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
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { useAuth } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Container } from "./Container";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { MYMENSINGH_AREAS } from "../../data/mymensingh-locations";
import { cn } from "../../lib/utils";

interface HeaderProps {
  currentView?: string;
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
  favoritesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = "home",
  onNavigate,
  favoritesCount = 0,
}) => {
  const { language, t, toggleLanguage } = useLanguage();
  const {
    isAuthenticated,
    profile,
    signOut,
    isOwner,
    isAdmin,
  } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = currentView === "home" || currentView === "/";
  const onHero = isHome && !scrolled;

  // Only home uses scroll-aware overlay navbar
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const navItems = [
    { id: "tolet", label: language === "bn" ? "বাসা ভাড়া" : "Home", icon: Home },
    { id: "mess", label: t.findMess, icon: Users },
    { id: "hostel", label: t.findHostel, icon: Bed },
    { id: "sublet", label: t.findSublet, icon: Layers },
  ];

  const navIdToView = (id: string) => (id === "home" ? "home" : id);

  const theme = {
    // Wrapper: home-overlay transparent glass vs solid everywhere else
    wrapper: isHome
      ? onHero
        ? "fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-emerald-950/90 via-emerald-950/35 to-transparent"
        : "fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      : "sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
    text: onHero ? "text-white" : "text-stone-900",
    muted: onHero ? "text-emerald-100/80" : "text-stone-500",
    border: onHero ? "border-white/10" : "border-stone-200",
    navBg: onHero ? "bg-white/10 backdrop-blur-md" : "bg-stone-100/70",
    navItem:
      onHero
        ? "text-emerald-50 hover:text-white hover:bg-white/10"
        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50",
    navItemActive:
      onHero
        ? "bg-emerald-500/25 text-white border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
        : "bg-white text-emerald-800 shadow-2xs",
    iconMuted: onHero ? "text-emerald-200/80" : "text-stone-400",
  };

  return (
    <header className={cn("transition-all duration-300", theme.wrapper)}>
      {/* Top info bar - only on solid/desktop, hidden on the transparent hero */}
      {!onHero && (
        <div
          className={cn(
            "text-[10px] py-0.5 px-4 hidden md:block",
            isHome ? "bg-emerald-950 text-emerald-100" : "bg-stone-900 text-stone-300"
          )}
        >
          <Container className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <MapPin className="h-2.5 w-2.5" />
                {language === "bn" ? "ময়মনসিংহ শহর ও আশপাশের সকল এলাকা" : "Covering all areas of Mymensingh City"}
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
                className="flex items-center gap-1 font-semibold hover:text-white transition-colors"
              >
                <Globe className="h-2.5 w-2.5 text-emerald-400" />
                <span>{language === "bn" ? "English" : "বাংলা"}</span>
              </button>
            </div>
          </Container>
        </div>
      )}

      {/* Main navigation bar */}
      <div className="py-2.5 sm:py-3">
        <Container className="flex items-center justify-between gap-2.5">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => onNavigate?.("home")}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0 text-left"
            aria-label="ToLet Mymensingh home"
          >
            {/* Brand logo (public/logo.png) */}
            <img
              src="/logo.png"
              alt="ToLet Mymensingh"
              className={cn(
                "h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03] sm:h-12",
                onHero ? "drop-shadow-[0_2px_10px_rgba(255,255,255,0.35)]" : "drop-shadow-sm"
              )}
            />
          </button>

          {/* Desktop nav links */}
          <nav
            className={cn(
              "hidden lg:flex items-center gap-0.5 p-0.5 rounded-lg border",
              theme.navBg,
              theme.border
            )}
            aria-label="Primary"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(navIdToView(item.id))}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    isActive ? theme.navItemActive : theme.navItem
                  )}
                >
                  <Icon className={cn("h-3 w-3", isActive ? "text-emerald-400" : theme.iconMuted)} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language toggle (mobile/tablet) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className={cn(
                "lg:hidden h-9 px-2 rounded-lg text-xs font-bold flex items-center gap-1 border transition-colors",
                onHero
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
              )}
              aria-label="Change Language"
            >
              <Globe className="h-3 w-3 text-emerald-500" />
              <span>{language === "bn" ? "EN" : "বাং"}</span>
            </button>

            {/* Favorites */}
            <Button
              variant={onHero ? "outline" : "outline"}
              size="sm"
              onClick={() => onNavigate?.("favorites")}
              className={cn(
                "hidden sm:inline-flex relative h-9 px-2.5 rounded-lg text-xs font-semibold transition-colors",
                onHero
                  ? "border-white/25 bg-white/10 text-white hover:text-white hover:border-emerald-300 hover:bg-white/20"
                  : "border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300"
              )}
            >
              <Heart className="h-3 w-3 mr-1 text-rose-500" />
              <span>{t.favorites}</span>
              {favoritesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold">
                  {favoritesCount}
                </span>
              )}
            </Button>

            {/* Post property CTA */}
            <Button
              onClick={() => onNavigate?.("post-property")}
              className={cn(
                "hidden md:inline-flex h-9 px-3 rounded-lg font-bold text-xs items-center gap-1 cursor-pointer active:scale-95 transition-all",
                onHero
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm shadow-emerald-500/30"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              <PlusCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t.postProperty}</span>
            </Button>

            {/* Auth dropdown / login */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className={cn(
                    "flex items-center gap-1.5 h-9 p-1 pl-1.5 rounded-lg border transition-all cursor-pointer select-none",
                    onHero
                      ? "bg-white/10 border-white/20 hover:bg-white/20"
                      : "border-stone-200 hover:border-emerald-500 bg-stone-50/80 hover:bg-white"
                  )}
                >
                  <div className="h-5.5 w-5.5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  <div className="text-left hidden md:block leading-none pr-0.5">
                    <div className={cn("text-[11px] font-bold line-clamp-1 max-w-[85px]", onHero ? "text-white" : "text-stone-800")}>
                      {profile?.name || "Account"}
                    </div>
                    <span className="text-[8.5px] text-emerald-400 font-semibold uppercase">
                      {profile?.role === "owner" ? "মালিক" : profile?.role === "admin" ? "অ্যাডমিন" : "ভাড়াটিয়া"}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-stone-400" />
                </button>

                {isUserDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-stone-200 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
                      <div className="px-3.5 py-1.5 border-b border-stone-100">
                        <p className="text-xs font-bold text-stone-900 truncate">{profile?.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{profile?.phone || profile?.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.("dashboard");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-emerald-700 cursor-pointer text-left"
                      >
                        <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{language === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.("dashboard/profile");
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-emerald-700 cursor-pointer text-left"
                      >
                        <Settings className="h-3.5 w-3.5 text-stone-500" />
                        <span>{language === "bn" ? "প্রোফাইল সেটিংস" : "Profile Settings"}</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate?.("admin");
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 cursor-pointer text-left"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                          <span>{language === "bn" ? "অ্যাডমিন পোর্টাল" : "Admin Portal"}</span>
                        </button>
                      )}

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate?.("post-property");
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
                            onNavigate?.("home");
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer text-left"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>{language === "bn" ? "লগআউট" : "Sign Out"}</span>
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
                  onClick={() => onNavigate?.("login")}
                  className={cn(
                    "h-8 px-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors",
                    onHero
                      ? "border-white/25 bg-white/10 text-white hover:text-emerald-300 hover:border-emerald-300 hover:bg-white/20"
                      : "border-stone-200 text-stone-700 hover:text-emerald-700"
                  )}
                >
                  <LogIn className="h-3 w-3 mr-1" />
                  <span>{language === "bn" ? "লগইন" : "Login"}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => onNavigate?.("register")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors",
                    onHero ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-stone-900 hover:bg-stone-800 text-white"
                  )}
                >
                  <span>{language === "bn" ? "রেজিস্টার" : "Register"}</span>
                </Button>
              </div>
            )}

            {/* Mobile menu drawer trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "lg:hidden h-9 w-9 rounded-xl touch-target-44",
                    onHero ? "text-white hover:bg-white/15" : "text-stone-700 hover:bg-stone-100"
                  )}
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
                    {language === "bn" ? "ময়মনসিংহের সেরা টু-লেট সেবা" : "Mymensingh Rental Marketplace"}
                  </p>
                </SheetHeader>

                <div className="py-3 space-y-1 flex-1 overflow-y-auto">
                  {isAuthenticated ? (
                    <div className="p-3 bg-emerald-50/80 rounded-xl mb-3 flex items-center justify-between border border-emerald-100">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 line-clamp-1">{profile?.name}</p>
                          <span className="text-[10px] text-emerald-800 font-bold uppercase">
                            {profile?.role === "owner" ? "বাড়ির মালিক" : profile?.role === "admin" ? "অ্যাডমিন" : "ভাড়াটিয়া"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await signOut();
                          setIsMobileMenuOpen(false);
                          onNavigate?.("home");
                        }}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        {language === "bn" ? "লগআউট" : "Logout"}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onNavigate?.("login");
                          setIsMobileMenuOpen(false);
                        }}
                        className="h-9 rounded-xl border-stone-200 text-stone-800 font-bold text-xs"
                      >
                        <LogIn className="h-3.5 w-3.5 mr-1" />
                        <span>{language === "bn" ? "লগইন" : "Login"}</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          onNavigate?.("register");
                          setIsMobileMenuOpen(false);
                        }}
                        className="h-9 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
                      >
                        <span>{language === "bn" ? "রেজিস্টার" : "Register"}</span>
                      </Button>
                    </div>
                  )}

                  {isAuthenticated && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.("dashboard");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <span>{language === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onNavigate?.("dashboard/profile");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                          <Settings className="h-3.5 w-3.5" />
                        </div>
                        <span>{language === "bn" ? "প্রোফাইল সেটিংস" : "Profile Settings"}</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate?.("admin");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 hover:bg-amber-100 transition-colors text-left cursor-pointer"
                        >
                          <div className="h-7 w-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </div>
                          <span>{language === "bn" ? "অ্যাডমিন পোর্টাল" : "Admin Portal"}</span>
                        </button>
                      )}
                    </>
                  )}

                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 my-2 pt-1">
                    {language === "bn" ? "ক্যাটাগরি" : "Categories"}
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate?.(navIdToView(item.id));
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
                    {language === "bn" ? "জনপ্রিয় এলাকা" : "Popular Areas"}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 px-2">
                    {MYMENSINGH_AREAS.slice(0, 6).map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => {
                          onNavigate?.("tolet", { areaSlug: area.slug });
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-1.5 text-[11px] font-medium text-stone-700 bg-stone-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 text-left truncate"
                      >
                        📍 {language === "bn" ? area.name_bn : area.name_en}
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
