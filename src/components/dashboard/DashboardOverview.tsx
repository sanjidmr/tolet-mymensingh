import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Home, 
  Heart, 
  PlusCircle, 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Eye, 
  PhoneCall, 
  User, 
  LogOut, 
  ShieldAlert, 
  AlertTriangle, 
  Layers, 
  Check, 
  X, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Flame,
  Sparkles,
  Users
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { fetchPublicListings } from '../../lib/supabase';
import { SAMPLE_LISTINGS } from '../../data/sample-listings';
import { Listing, PropertyType } from '../../types';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Container } from '../layout/Container';
import { ListingCard } from '../marketplace/ListingCard';
import { useSEO } from '../../lib/useSEO';

interface DashboardOverviewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  favorites = [],
  onToggleFavorite,
}) => {
  const { language, t } = useLanguage();
  const { profile, user, isOwner, isTenant, isAdmin, signOut, setDemoUser } = useAuth();
  
  useSEO({
    title: language === 'bn' ? 'ইউজার ড্যাশবোর্ড' : 'User Dashboard',
    noindex: true,
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'my-listings' | 'saved' | 'admin-moderation'>('overview');
  const [listings, setListings] = useState<Listing[]>(SAMPLE_LISTINGS);
  const [mockReports, setMockReports] = useState([
    { id: 'rep-1', listing_title: 'মডেল স্কুল সংলগ্ন ফ্ল্যাট ৩ রুম', reason: 'ভাড়া অলরেডি হয়ে গেছে', date: '১০ মিনিট আগে', status: 'pending' },
    { id: 'rep-2', listing_title: 'কৃষি বিশ্ববিদ্যালয় গেটে রুম মেস', reason: 'ভুল ফোন নম্বর দেওয়া', date: '১ ঘন্টা আগে', status: 'pending' },
  ]);

  useEffect(() => {
    fetchPublicListings()
      .then((data) => {
        if (data && data.length > 0) {
          setListings(data);
        }
      })
      .catch((e) => console.warn('Using local fallback for dashboard:', e));
  }, []);

  const ownerListings = listings.slice(0, 3);
  const favoriteListings = listings.filter((l) => favorites.includes(l.id));

  const handleApproveReport = (id: string) => {
    setMockReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="py-8 sm:py-12 bg-stone-50/60 min-h-[calc(100vh-200px)]">
      <Container>
        
        {/* Top Profile Banner */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* User Identity */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-emerald-100 border-2 border-emerald-500 overflow-hidden flex items-center justify-center text-emerald-800 font-extrabold text-2xl shadow-sm">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name || 'User'}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}</span>
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

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    {profile?.name || (language === 'bn' ? 'সম্মানিত ব্যবহারকারী' : 'Valued User')}
                  </h1>

                  {/* Role Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    isOwner
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isAdmin
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-sky-50 text-sky-800 border-sky-200'
                  }`}>
                    {isOwner 
                      ? (language === 'bn' ? 'বাড়ির মালিক (Owner)' : 'House Landlord')
                      : isAdmin
                      ? (language === 'bn' ? 'সুপার অ্যাডমিন (Admin)' : 'Platform Admin')
                      : (language === 'bn' ? 'ভাড়াটিয়া (Tenant)' : 'Tenant')}
                  </span>

                  {profile?.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 flex flex-wrap items-center gap-3">
                  <span>📱 {profile?.phone || '017xxxxxxxx'}</span>
                  <span>•</span>
                  <span>✉️ {profile?.email || user?.email || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {isOwner && (
                <>
                  <Button
                    onClick={() => onNavigate('dashboard/listings/new')}
                    className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{language === 'bn' ? 'নতুন বিজ্ঞাপন দিন' : 'Post Rental Ad'}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => onNavigate('dashboard/listings')}
                    className="h-10 px-3.5 rounded-xl border-emerald-300 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'বিজ্ঞাপন পরিচালনা' : 'Manage Listings'}</span>
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => onNavigate('dashboard/profile')}
                className="h-10 px-3.5 rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="h-4 w-4 text-stone-500" />
                <span>{language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Edit Profile'}</span>
              </Button>

              <Button
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  onNavigate('home');
                }}
                className="h-10 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs sm:text-sm cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>


          </div>

          {/* Interactive Role Switcher Pill for instant live testing */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{language === 'bn' ? 'রোল প্রিভিউ টেস্ট:' : 'Test Other Account Roles:'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDemoUser('owner')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  isOwner ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'bn' ? 'মালিক ভিউ' : 'Owner View'}
              </button>
              <button
                onClick={() => setDemoUser('tenant')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  isTenant ? 'bg-sky-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'bn' ? 'ভাড়াটিয়া ভিউ' : 'Tenant View'}
              </button>
              <button
                onClick={() => setDemoUser('admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  isAdmin ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {language === 'bn' ? 'অ্যাডমিন ভিউ' : 'Admin View'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Role-Based Content */}

        {/* 1. OWNER ACCOUNT FLOW */}
        {isOwner && (
          <div className="space-y-8">
            
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>{language === 'bn' ? 'মোট বিজ্ঞাপন' : 'Total Listings'}</span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {toBengaliNumber(ownerListings.length, language)}
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {language === 'bn' ? 'সবগুলো সক্রিয় আছে' : 'Active & Live'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>{language === 'bn' ? 'মোট ভিউ' : 'Total Views'}</span>
                  <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {toBengaliNumber(1420, language)}
                </div>
                <span className="text-[11px] text-sky-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {language === 'bn' ? '+২৪% এই সপ্তাহে' : '+24% this week'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>{language === 'bn' ? 'সরাসরি কল রিকোয়েস্ট' : 'Direct Inquiries'}</span>
                  <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {toBengaliNumber(38, language)}
                </div>
                <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {language === 'bn' ? 'সর্বশেষ আজ ৩টি' : '3 calls today'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>{language === 'bn' ? 'পছন্দের তালিকায় যুক্ত' : 'Times Favorited'}</span>
                  <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {toBengaliNumber(86, language)}
                </div>
                <span className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                  <Flame className="h-3 w-3 text-rose-500" />
                  {language === 'bn' ? 'উচ্চ চাহিদাসম্পন্ন' : 'High tenant interest'}
                </span>
              </div>
            </div>

            {/* My Listings Management Section */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                    {language === 'bn' ? 'আমার দেওয়া বিজ্ঞাপনসমূহ' : 'My Property Listings'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'bn' ? 'বিজ্ঞাপনের স্ট্যাটাস পরিবর্তন করুন অথবা নতুন তথ্য যোগ করুন' : 'Manage your listed apartments, mess, or rooms'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('dashboard/listings')}
                    size="sm"
                    className="border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl font-bold text-xs"
                  >
                    <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
                  </Button>
                  <Button
                    onClick={() => onNavigate('dashboard/listings/new')}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    <span>{language === 'bn' ? 'নতুন বিজ্ঞাপন' : 'Add New'}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {ownerListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 rounded-2xl border border-stone-200/80 hover:border-emerald-500/50 hover:bg-stone-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={listing.images[0]?.url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'}
                        alt={listing.title_bn}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                            {listing.status === 'approved' ? (language === 'bn' ? 'অনুমোদিত' : 'Approved') : listing.status}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-600" />
                            {language === 'bn' ? listing.area_name_bn : listing.area_name_en}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 line-clamp-1">
                          {language === 'bn' ? listing.title_bn : listing.title_en}
                        </h3>
                        <p className="text-xs font-extrabold text-emerald-700">
                          {formatPrice(listing.rent_monthly, language)} / {language === 'bn' ? 'মাস' : 'mo'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('dashboard/listings/edit', { id: listing.id })}
                        className="h-8 px-3 rounded-lg text-xs font-semibold border-stone-200 text-stone-700 hover:bg-stone-100"
                      >
                        {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onNavigate('dashboard/listings')}
                        className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {language === 'bn' ? 'ম্যানেজ করুন' : 'Manage'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        )}

        {/* 2. TENANT ACCOUNT FLOW */}
        {isTenant && (
          <div className="space-y-8">
            
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>{language === 'bn' ? 'পছন্দের বাসা' : 'Saved Listings'}</span>
                  <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {toBengaliNumber(favoriteListings.length, language)}
                </div>
                <p className="text-[11px] text-stone-500">
                  {language === 'bn' ? 'সংরক্ষিত বাসার তালিকা' : 'Quick access from any device'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>{language === 'bn' ? 'যোগাযোগ কৃত বাড়িওয়ালা' : 'Contacted Landlords'}</span>
                  <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {toBengaliNumber(4, language)}
                </div>
                <p className="text-[11px] text-stone-500">
                  {language === 'bn' ? 'চারপাড়া ও গাঙ্গিনারপাড় এলাকা' : 'Charpara & Ganginarpar'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                  <span>{language === 'bn' ? 'নোটিফিকেশন অ্যালার্ট' : 'Saved Search Alerts'}</span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {language === 'bn' ? 'সক্রিয়' : 'Active'}
                </div>
                <p className="text-[11px] text-stone-500">
                  {language === 'bn' ? 'নতুন বাসা পোস্ট হলে নোটিফিকেশন পাবেন' : 'Get notified when new flats post'}
                </p>
              </div>
            </div>

            {/* Saved Favorites Showcase */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                    {language === 'bn' ? 'আমার পছন্দের টু-লেটসমূহ' : 'My Saved Bookmarks'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {language === 'bn' ? 'সহজেই মালিকের সাথে সরাসরি যোগাযোগ করুন' : 'Call or WhatsApp verified landlords directly'}
                  </p>
                </div>
                <Button
                  onClick={() => onNavigate('home')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                >
                  {language === 'bn' ? 'আরও বাসা খুঁজুন' : 'Explore More'}
                </Button>
              </div>

              {favoriteListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favoriteListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isFavorite={true}
                      onSelect={(l) => {
                        const prefix = l.property_type === 'mess' ? 'mess' : l.property_type === 'hostel' ? 'hostel' : l.property_type === 'sublet' ? 'sublet' : 'tolet';
                        onNavigate(`${prefix}/${l.slug || l.id}`);
                      }}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <Heart className="h-10 w-10 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500">
                    {language === 'bn' ? 'আপনার পছন্দের তালিকায় এখনও কোনো বাসা যুক্ত করেননি।' : 'No saved listings yet.'}
                  </p>
                  <Button
                    onClick={() => onNavigate('home')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'bn' ? 'হোমে ফিরে টু-লেট খুঁজুন' : 'Browse Rentals Now'}
                  </Button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. ADMIN AUTHORIZATION & MODERATION FLOW */}
        {isAdmin && (
          <div className="space-y-8">
            
            {/* Admin Header Shield */}
            <div className="p-4 bg-purple-900 text-white rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-800 flex items-center justify-center text-purple-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {language === 'bn' ? 'ময়মনসিংহ মডারেশন কন্ট্রোল প্যানেল' : 'Mymensingh Admin & Moderation Queue'}
                  </h3>
                  <p className="text-xs text-purple-200">
                    {language === 'bn' ? 'বিজ্ঞাপন অনুমোদন ও ব্যবহারকারী রিপোর্ট পর্যালোচনা' : 'Review pending listings and reported fraudulent ads'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-3 py-1 bg-purple-700/80 rounded-full font-bold border border-purple-500/40">
                Security Master
              </span>
            </div>

            {/* Moderation Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-xs text-stone-500">{language === 'bn' ? 'মোট লিস্টিং' : 'Total Listings'}</span>
                <div className="text-2xl font-black text-stone-900">{toBengaliNumber(listings.length, language)}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-xs text-stone-500">{language === 'bn' ? 'যাচাইকৃত মালিক' : 'Verified Owners'}</span>
                <div className="text-2xl font-black text-emerald-700">{toBengaliNumber(24, language)}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-xs text-stone-500">{language === 'bn' ? 'অমীমাংসিত রিপোর্ট' : 'Pending Reports'}</span>
                <div className="text-2xl font-black text-rose-600">{toBengaliNumber(mockReports.length, language)}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-xs text-stone-500">{language === 'bn' ? 'ডাটাবেজ ও আরএলএস' : 'Database & RLS'}</span>
                <div className="text-sm font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Enforced</span>
                </div>
              </div>
            </div>

            {/* Moderation Queue */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4">
              <h3 className="font-bold text-base text-stone-900">
                {language === 'bn' ? 'ইউজার রিপোর্ট ও অভিযোগ পর্যালোচনা' : 'Community Moderation Queue'}
              </h3>
              
              {mockReports.length > 0 ? (
                <div className="space-y-3">
                  {mockReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-bold">
                            Reported
                          </span>
                          <span className="text-xs text-stone-500">{report.date}</span>
                        </div>
                        <h4 className="font-bold text-sm text-stone-900">{report.listing_title}</h4>
                        <p className="text-xs text-rose-700 font-semibold">
                          {language === 'bn' ? 'অভিযোগের কারণ:' : 'Reason:'} {report.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveReport(report.id)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          <span>{language === 'bn' ? 'সমাধান হয়েছে' : 'Mark Resolved'}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveReport(report.id)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold border-stone-200 text-stone-600"
                        >
                          <X className="h-3 w-3 mr-1" />
                          <span>{language === 'bn' ? 'বাতিল' : 'Dismiss'}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400 text-xs font-semibold">
                  {language === 'bn' ? 'কোনো অমীমাংসিত অভিযোগ বা রিপোর্ট নেই।' : 'Moderation queue is all clear!'}
                </div>
              )}
            </div>

          </div>
        )}

      </Container>
    </div>
  );
};
