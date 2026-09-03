'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

export interface Translations {
  appName: string;
  appTagline: string;
  postProperty: string;
  findHome: string;
  findMess: string;
  findHostel: string;
  findSublet: string;
  findSeat: string;
  searchPlaceholder: string;
  selectArea: string;
  allAreas: string;
  budget: string;
  anyBudget: string;
  searchBtn: string;
  popularAreas: string;
  viewAll: string;
  featuredListings: string;
  latestListings: string;
  browseByType: string;
  monthlyRent: string;
  negotiable: string;
  fixed: string;
  verified: string;
  featured: string;
  availableFrom: string;
  callOwner: string;
  whatsapp: string;
  viewDetails: string;
  reportListing: string;
  saveFavorite: string;
  savedToFavorites: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  floor: string;
  amenities: string;
  whyTrustUs: string;
  howItWorks: string;
  ownerCtaTitle: string;
  ownerCtaDesc: string;
  ownerCtaBtn: string;
  login: string;
  register: string;
  dashboard: string;
  myListings: string;
  favorites: string;
  adminPanel: string;
  emergencyHelpline: string;
  copyright: string;
  family: string;
  bachelor: string;
  student: string;
  femaleOnly: string;
  maleOnly: string;
  mixed: string;
  apartment: string;
  room: string;
  sublet: string;
  mess: string;
  hostel: string;
  seat: string;
}

const translations: Record<Language, Translations> = {
  bn: {
    appName: 'টু-লেট ময়মনসিংহ',
    appTagline: 'ময়মনসিংহে আপনার পছন্দের বাসা, মেস ও সাবলেট খুঁজে নিন সহজেই',
    postProperty: 'বিজ্ঞাপন দিন',
    findHome: 'বাসা খুঁজুন',
    findMess: 'মেস খুঁজুন',
    findHostel: 'হোস্টেল',
    findSublet: 'সাবলেট',
    findSeat: 'সিট ভাড়া',
    searchPlaceholder: 'এলাকা বা বাসার ধরন দিয়ে খুঁজুন...',
    selectArea: 'এলাকা নির্বাচন করুন',
    allAreas: 'সকল এলাকা',
    budget: 'ভাড়া বাজেট',
    anyBudget: 'যেকোনো বাজেট',
    searchBtn: 'খুঁজুন',
    popularAreas: 'জনপ্রিয় এলাকাসমূহ',
    viewAll: 'সবগুলো দেখুন',
    featuredListings: 'প্রিমিয়াম ভেরিফাইড বাসা',
    latestListings: 'নতুন যুক্ত হওয়া টু-লেট',
    browseByType: 'ক্যাটাগরি অনুযায়ী খুঁজুন',
    monthlyRent: 'মাসিক ভাড়া',
    negotiable: 'আলোচনা সাপেক্ষ',
    fixed: 'স্থির ভাড়া',
    verified: 'ভেরিফাইড',
    featured: 'ফিচার্ড',
    availableFrom: 'বরাদ্দ শুরু',
    callOwner: 'মালিককে কল করুন',
    whatsapp: 'হোয়াটসঅ্যাপ',
    viewDetails: 'বিস্তারিত দেখুন',
    reportListing: 'এই লিস্টিংটি রিপোর্ট করুন',
    saveFavorite: 'পছন্দে রাখুন',
    savedToFavorites: 'পছন্দের তালিকায় যুক্ত হয়েছে',
    bedrooms: 'বেডরুম',
    bathrooms: 'বাথরুম',
    sqft: 'বর্গফুট',
    floor: 'তলা',
    amenities: 'সুবিধাসমূহ',
    whyTrustUs: 'কেন টু-লেট ময়মনসিংহ ব্যবহার করবেন?',
    howItWorks: 'কীভাবে কাজ করে?',
    ownerCtaTitle: 'আপনার বাসা বা মেসের সিট ফাঁকা আছে?',
    ownerCtaDesc: 'মাত্র ২ মিনিটে বিনামূল্যে আপনার প্রপার্টির বিজ্ঞাপন দিন এবং হাজারো বিশ্বস্ত ভাড়াটিয়ার কাছে পৌঁছে যান।',
    ownerCtaBtn: 'বিনামূল্যে বিজ্ঞাপন দিন',
    login: 'লগইন',
    register: 'রেজিস্ট্রেশন',
    dashboard: 'ড্যাশবোর্ড',
    myListings: 'আমার বিজ্ঞাপনসমূহ',
    favorites: 'সংরক্ষিত বাসা',
    adminPanel: 'অ্যাডমিন প্যানেল',
    emergencyHelpline: 'হেল্পলাইন: ০৯৬৩৮-টুলেট (সকাল ৯টা - রাত ১০টা)',
    copyright: '© ২০২৬ টু-লেট ময়মনসিংহ। সর্বস্বত্ব সংরক্ষিত। ময়মনসিংহের স্থানীয়দের জন্য নিবেদিত।',
    family: 'পরিবার',
    bachelor: 'ব্যাচেলর',
    student: 'শিক্ষার্থী',
    femaleOnly: 'শুধু ছাত্রী / মহিলা',
    maleOnly: 'শুধু ছাত্র / পুরুষ',
    mixed: 'সকলের জন্য',
    apartment: 'ফ্ল্যাট / বাসা',
    room: 'রুম',
    sublet: 'সাবলেট',
    mess: 'মেস',
    hostel: 'হোস্টেল',
    seat: 'সিট',
  },
  en: {
    appName: 'ToLet Mymensingh',
    appTagline: 'Find your ideal home, mess & sublet in Mymensingh easily',
    postProperty: 'Post Property',
    findHome: 'Find House',
    findMess: 'Find Mess',
    findHostel: 'Hostel',
    findSublet: 'Sublet',
    findSeat: 'Seat Rent',
    searchPlaceholder: 'Search by area, property type...',
    selectArea: 'Select Area',
    allAreas: 'All Areas',
    budget: 'Monthly Budget',
    anyBudget: 'Any Budget',
    searchBtn: 'Search',
    popularAreas: 'Popular Localities',
    viewAll: 'View All',
    featuredListings: 'Verified Premium Listings',
    latestListings: 'Freshly Added Rentals',
    browseByType: 'Browse by Category',
    monthlyRent: 'Monthly Rent',
    negotiable: 'Negotiable',
    fixed: 'Fixed',
    verified: 'Verified',
    featured: 'Featured',
    availableFrom: 'Available From',
    callOwner: 'Call Owner',
    whatsapp: 'WhatsApp',
    viewDetails: 'View Details',
    reportListing: 'Report this listing',
    saveFavorite: 'Save Favorite',
    savedToFavorites: 'Saved to favorites',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    sqft: 'Sq. Ft.',
    floor: 'Floor',
    amenities: 'Amenities',
    whyTrustUs: 'Why ToLet Mymensingh?',
    howItWorks: 'How it works?',
    ownerCtaTitle: 'Have a vacant flat, room or mess seat?',
    ownerCtaDesc: 'List your property in just 2 minutes for free and connect directly with genuine verified tenants.',
    ownerCtaBtn: 'Post Free Listing',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    myListings: 'My Listings',
    favorites: 'Saved Favorites',
    adminPanel: 'Admin Panel',
    emergencyHelpline: 'Helpline: 09638-TOLET (9 AM - 10 PM)',
    copyright: '© 2026 ToLet Mymensingh. All rights reserved. Built for Mymensingh.',
    family: 'Family',
    bachelor: 'Bachelor',
    student: 'Student',
    femaleOnly: 'Female Only',
    maleOnly: 'Male Only',
    mixed: 'Mixed / Anyone',
    apartment: 'Apartment',
    room: 'Room',
    sublet: 'Sublet',
    mess: 'Mess',
    hostel: 'Hostel',
    seat: 'Seat',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bn');

  useEffect(() => {
    const saved = localStorage.getItem('tolet_lang') as Language;
    if (saved === 'bn' || saved === 'en') {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tolet_lang', lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    handleSetLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
