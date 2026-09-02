export type UserRole = 'tenant' | 'owner' | 'admin';

export type ListingStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'rented' 
  | 'expired';

export type PropertyType = 
  | 'apartment' 
  | 'room' 
  | 'sublet' 
  | 'mess' 
  | 'hostel' 
  | 'seat';

export type TargetAudience = 
  | 'family' 
  | 'bachelor' 
  | 'student' 
  | 'male' 
  | 'female' 
  | 'mixed';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar_url?: string;
  is_verified?: boolean;
  whatsapp_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  description_bn?: string;
  description_en?: string;
  is_popular?: boolean;
  listing_count?: number;
}

export interface Amenity {
  id: string;
  name_en: string;
  name_bn: string;
  icon_name: string;
  category: 'core' | 'comfort' | 'security' | 'meal_service';
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string;
  is_primary: boolean;
  order_index: number;
}

export interface Listing {
  id: string;
  title_bn: string;
  title_en: string;
  slug: string;
  description_bn: string;
  description_en?: string;
  property_type: PropertyType;
  audience: TargetAudience;
  status: ListingStatus;
  
  // Pricing
  rent_monthly: number;
  security_deposit?: number;
  is_negotiable: boolean;
  service_charge?: number;
  gas_bill_included?: boolean;
  electricity_bill_included?: boolean;
  water_bill_included?: boolean;

  // Space & Layout
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floor_number?: number;
  total_floors?: number;
  area_sqft?: number;
  seat_count?: number; // for mess/hostel seats

  // Location
  area_id: string;
  area_name_bn: string;
  area_name_en: string;
  address_street_bn: string;
  address_street_en?: string;
  landmark_bn?: string;
  landmark_en?: string;
  latitude?: number;
  longitude?: number;

  // Contact
  contact_name: string;
  contact_phone: string;
  contact_whatsapp?: string;
  hide_exact_phone?: boolean;

  // Ownership & Flags
  owner_id: string;
  owner_name: string;
  owner_avatar?: string;
  is_owner_verified: boolean;
  is_verified: boolean;
  is_featured: boolean;
  views_count: number;
  
  available_from: string; // e.g. "১লা অক্টোবর" or "Immediately"
  images: ListingImage[];
  amenity_ids: string[];
  
  created_at: string;
  updated_at: string;
}

export type ListingSortOption = 'newest' | 'rent_asc' | 'rent_desc' | 'popular';

export interface ListingFilterState {
  areaSlug?: string;
  propertyType?: PropertyType | 'all';
  audience?: TargetAudience | 'all';
  minRent?: number;
  maxRent?: number;
  bedrooms?: number | string | 'all';
  bathrooms?: number | string | 'all';
  amenities?: string[];
  isVerifiedOnly?: boolean;
  isFeaturedOnly?: boolean;
  sortBy?: ListingSortOption;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedListingsResult {
  listings: Listing[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ReportReason = 
  | 'fake_listing' 
  | 'wrong_phone' 
  | 'already_rented' 
  | 'scam' 
  | 'incorrect_info' 
  | 'inappropriate_content';

export interface ListingReport {
  id: string;
  listing_id: string;
  reporter_id?: string;
  reporter_name?: string;
  reason: ReportReason;
  comment?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
  moderator_notes?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at?: string;
  listing?: Listing;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  reportedListings: number;
  rejectedListings: number;
  rentedListings: number;
  verifiedOwners: number;
}

export interface AdminUserItem extends UserProfile {
  listings_count?: number;
  is_deactivated?: boolean;
}

export * from './database';
