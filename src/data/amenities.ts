import { Amenity } from '../types';

export const AMENITIES_LIST: Amenity[] = [
  { id: 'amenity-gas', name_en: 'Titas Gas / LPG Gas', name_bn: 'গ্যাস সংযোগ / সিলিন্ডার', icon_name: 'Flame', category: 'core' },
  { id: 'amenity-generator', name_en: 'Generator / IPS Backup', name_bn: 'জেনারেটর / আইপিএস ব্যাকআপ', icon_name: 'Zap', category: 'core' },
  { id: 'amenity-lift', name_en: 'Elevator / Lift', name_bn: 'লিফট / এলিভেটর', icon_name: 'ArrowUpDown', category: 'comfort' },
  { id: 'amenity-wifi', name_en: 'High Speed Wi-Fi', name_bn: 'উচ্চগতির ওয়াইফাই', icon_name: 'Wifi', category: 'comfort' },
  { id: 'amenity-security', name_en: '24/7 Security Guard', name_bn: '২৪ ঘণ্টা সিকিউরিটি গার্ড', icon_name: 'ShieldCheck', category: 'security' },
  { id: 'amenity-cctv', name_en: 'CCTV Surveillance', name_bn: 'সিসিটিভি ক্যামেরা নিরাপত্তা', icon_name: 'Video', category: 'security' },
  { id: 'amenity-parking', name_en: 'Car & Bike Parking', name_bn: 'গাড়ি ও বাইক পার্কিং', icon_name: 'Car', category: 'comfort' },
  { id: 'amenity-balcony', name_en: 'South-facing Balcony', name_bn: 'খোলামেলা বারান্দা', icon_name: 'Sun', category: 'comfort' },
  { id: 'amenity-attached-bath', name_en: 'Attached Bathroom', name_bn: 'অ্যাটাচড বাথরুম', icon_name: 'Bath', category: 'core' },
  { id: 'amenity-meal', name_en: 'Mess Meal System', name_bn: 'মেস মিল / খালা ব্যবস্থা', icon_name: 'Utensils', category: 'meal_service' },
  { id: 'amenity-water-filter', name_en: 'Pure Drinking Water Filter', name_bn: 'বিশুদ্ধ খাবার পানির ফিল্টার', icon_name: 'Droplets', category: 'core' },
  { id: 'amenity-geyser', name_en: 'Geyser / Hot Water', name_bn: 'গিজার / গরম পানি', icon_name: 'Sparkles', category: 'comfort' },
];
