import { z } from 'zod';

export const PropertyTypeEnum = z.enum([
  'apartment',
  'room',
  'sublet',
  'mess',
  'hostel',
  'seat'
]);

export const TargetAudienceEnum = z.enum([
  'family',
  'bachelor',
  'student',
  'male',
  'female',
  'mixed'
]);

export const ImageItemSchema = z.object({
  id: z.string(),
  url: z.string().url('সঠিক ছবির লিঙ্ক বা প্রিভিউ দিন'),
  storage_path: z.string().default(''),
  is_primary: z.boolean().default(false),
  order_index: z.number().default(0),
  file: z.any().optional(),
});

export type ImageItem = z.infer<typeof ImageItemSchema>;

export const ListingFormSchema = z.object({
  // Step 1: Property Type
  property_type: PropertyTypeEnum,
  audience: TargetAudienceEnum,

  // Step 2: Basic Info
  title_bn: z.string().min(5, 'বাংলায় শিরোনাম অন্তত ৫ অক্ষরের হতে হবে'),
  title_en: z.string().min(3, 'Title in English must be at least 3 characters').optional().or(z.literal('')),
  description_bn: z.string().min(15, 'বিস্তারিত বিবরণ অন্তত ১৫ অক্ষরের হতে হবে'),
  description_en: z.string().optional().or(z.literal('')),
  bedrooms: z.coerce.number().int().min(0, 'রুম সংখ্যা ০ বা তার বেশি হতে হবে').max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(10).optional(),
  balconies: z.coerce.number().int().min(0).max(10).optional(),
  floor_number: z.coerce.number().int().min(0, 'ফ্লোর নম্বর দিন').max(50).optional(),
  total_floors: z.coerce.number().int().min(1).max(50).optional(),
  area_sqft: z.coerce.number().positive('আয়তন পজিটিভ সংখ্যা হতে হবে').optional(),
  seat_count: z.coerce.number().int().positive().optional(),
  available_from: z.string().min(1, 'কবে থেকে বরাদ্দ তা উল্লেখ করুন (যেমন: আগামী ১লা তারিখ থেকে)'),

  // Step 3: Rent and Pricing
  rent_monthly: z.coerce.number().positive('মাসিক ভাড়া একটি সঠিক সংখ্যা হতে হবে (টাকায়)'),
  security_deposit: z.coerce.number().min(0).optional(),
  is_negotiable: z.boolean().default(false),
  service_charge: z.coerce.number().min(0).optional(),
  gas_bill_included: z.boolean().default(false),
  electricity_bill_included: z.boolean().default(false),
  water_bill_included: z.boolean().default(true),

  // Step 4: Location
  area_id: z.string().min(1, 'এলাকা নির্বাচন করুন'),
  address_street_bn: z.string().min(3, 'রাস্তা বা পাড়ার নাম লিখুন'),
  address_street_en: z.string().optional().or(z.literal('')),
  landmark_bn: z.string().optional().or(z.literal('')),
  landmark_en: z.string().optional().or(z.literal('')),

  // Step 5: Amenities
  amenity_ids: z.array(z.string()).default([]),

  // Step 6: Photos
  images: z.array(ImageItemSchema).min(1, 'অন্তত ১টি ছবি যুক্ত করতে হবে').max(10, 'সর্বোচ্চ ১০টি ছবি যুক্ত করা যাবে'),

  // Step 7: Contact Information
  contact_name: z.string().min(2, 'যোগাযোগের ব্যক্তির নাম দিন'),
  contact_phone: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 017xxxxxxxx)'),
  contact_whatsapp: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'সঠিক হোয়াটসঅ্যাপ নম্বর দিন').optional().or(z.literal('')),
  hide_exact_phone: z.boolean().default(false),

  // Step 9: Moderation & Agreement
  agree_to_terms: z.boolean().default(true),
  submission_action: z.enum(['draft', 'pending']).default('pending'),
});

export type ListingFormValues = z.infer<typeof ListingFormSchema>;

export const ReportSchema = z.object({
  listing_id: z.string().min(1),
  reason: z.enum([
    'fake_listing',
    'wrong_phone',
    'already_rented',
    'scam',
    'incorrect_info',
    'inappropriate_content'
  ]),
  comment: z.string().max(500, 'মন্তব্য ৫০০ অক্ষরের মধ্যে রাখুন').optional(),
});

export type ReportFormValues = z.infer<typeof ReportSchema>;

