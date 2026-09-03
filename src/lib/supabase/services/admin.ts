import { getSupabaseBrowserClient } from '../client';
import { 
  AdminDashboardStats, 
  AdminUserItem, 
  Amenity, 
  Area, 
  Listing, 
  ListingReport, 
  ListingStatus, 
  ReportStatus, 
  UserProfile, 
  UserRole 
} from '../../../types';
import { SAMPLE_LISTINGS } from '../../../data/sample-listings';
import { MYMENSINGH_AREAS } from '../../../data/mymensingh-locations';
import { AMENITIES_LIST } from '../../../data/amenities';
import { mapDatabaseListingToUiListing } from './listings';

// Storage keys for persistent admin updates in local / demo modes
const ADMIN_LISTINGS_KEY = 'tolet_admin_listings_store';
const ADMIN_USERS_KEY = 'tolet_admin_users_store';
const ADMIN_REPORTS_KEY = 'tolet_admin_reports_store';
const ADMIN_AREAS_KEY = 'tolet_admin_areas_store';
const ADMIN_AMENITIES_KEY = 'tolet_admin_amenities_store';

// Default mock users for management
const INITIAL_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 'user-admin-1',
    name: 'অ্যাডমিন মডারেটর (ময়মনসিংহ)',
    email: 'admin@toletmymensingh.com',
    phone: '01900112233',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    whatsapp_number: '01900112233',
    created_at: '2026-01-10T08:30:00Z',
    updated_at: '2026-08-30T10:00:00Z',
    listings_count: 0,
    is_deactivated: false,
  },
  {
    id: 'owner-1',
    name: 'হাজী মোঃ রফিকুল ইসলাম',
    email: 'rafiqul.owner@gmail.com',
    phone: '01711223344',
    role: 'owner',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    whatsapp_number: '01711223344',
    created_at: '2026-02-15T11:20:00Z',
    updated_at: '2026-08-25T14:30:00Z',
    listings_count: 3,
    is_deactivated: false,
  },
  {
    id: 'owner-2',
    name: 'ইঞ্জিঃ সারোয়ার জাহান',
    email: 'sarwar.builder@yahoo.com',
    phone: '01722334455',
    role: 'owner',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    whatsapp_number: '01722334455',
    created_at: '2026-03-01T09:15:00Z',
    updated_at: '2026-08-28T16:45:00Z',
    listings_count: 2,
    is_deactivated: false,
  },
  {
    id: 'owner-3',
    name: 'বেগম নাসরিন আক্তার',
    email: 'nasrin.hostel@gmail.com',
    phone: '01833445566',
    role: 'owner',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    is_verified: false,
    whatsapp_number: '01833445566',
    created_at: '2026-04-12T14:00:00Z',
    updated_at: '2026-08-20T11:10:00Z',
    listings_count: 2,
    is_deactivated: false,
  },
  {
    id: 'owner-4',
    name: 'মোঃ জহিরুল হক',
    email: 'zahirul.estate@outlook.com',
    phone: '01944556677',
    role: 'owner',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    is_verified: false,
    whatsapp_number: '01944556677',
    created_at: '2026-05-18T16:40:00Z',
    updated_at: '2026-08-22T09:25:00Z',
    listings_count: 1,
    is_deactivated: false,
  },
  {
    id: 'tenant-1',
    name: 'তানভীর আহমেদ (শিক্ষার্থী)',
    email: 'tanvir.student@gmail.com',
    phone: '01899887766',
    role: 'tenant',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    is_verified: false,
    whatsapp_number: '01899887766',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-08-29T12:00:00Z',
    listings_count: 0,
    is_deactivated: false,
  },
  {
    id: 'tenant-2',
    name: 'ডাঃ আফরিন সুলতানা',
    email: 'afrin.doc@mmc.edu.bd',
    phone: '01755667788',
    role: 'tenant',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    whatsapp_number: '01755667788',
    created_at: '2026-06-15T15:30:00Z',
    updated_at: '2026-08-27T18:00:00Z',
    listings_count: 0,
    is_deactivated: false,
  }
];

// Initial mock reports for moderation
const INITIAL_ADMIN_REPORTS: ListingReport[] = [
  {
    id: 'report-1',
    listing_id: 'listing-2',
    reporter_id: 'tenant-1',
    reporter_name: 'তানভীর আহমেদ',
    reason: 'already_rented',
    comment: 'এই রুম মেসের সিটগুলো গত সপ্তাহে বুক হয়ে গেছে। এখনো বিজ্ঞাপন লাইভ রয়েছে।',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'report-2',
    listing_id: 'listing-4',
    reporter_id: 'tenant-2',
    reporter_name: 'ডাঃ আফরিন সুলতানা',
    reason: 'wrong_phone',
    comment: 'প্রদত্ত নম্বরে কল দিলে অন্য কেউ রিসিভ করে এবং বলে এটি ভুল নম্বর।',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'report-3',
    listing_id: 'listing-1',
    reporter_id: 'tenant-1',
    reporter_name: 'তানভীর আহমেদ',
    reason: 'incorrect_info',
    comment: 'ভাড়া বিজ্ঞাপনে ১৬৫০০ লেখা থাকলেও বাড়িওয়ালা ফোনে ১৮০০০ টাকা দাবি করছেন।',
    status: 'reviewed',
    moderator_notes: 'মালিকের সাথে যোগাযোগ করে ভাড়া আপডেট করার নির্দেশ দেওয়া হয়েছে।',
    reviewed_by: 'user-admin-1',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  }
];

// Initial sample listings with varying statuses for admin moderation demo
const INITIAL_ADMIN_LISTINGS: Listing[] = [
  ...SAMPLE_LISTINGS,
  {
    id: 'listing-pending-1',
    title_bn: 'নতুন বাজার মেইন রোডে ২ রুমের অ্যাটাচ বাথসহ চমৎকার সাবলেট',
    title_en: '2 Room Sublet with Attached Bath at Nutun Bazar Main Road',
    slug: '2-room-sublet-nutun-bazar',
    description_bn: 'নতুন বাজার মোড়ের নিকটে ৩ তলা ভবনের ২য় তলায় ছোট পরিবারের জন্য খোলামেলা ২টি বেডরুম ও ১টি রান্নাঘর ভাড়া দেওয়া হবে। ২৪ ঘণ্টা পানি ও তিতাস গ্যাস সুবিধা।',
    description_en: '2 bedroom sublet with kitchen and attached bathroom at Nutun Bazar for small family or students.',
    property_type: 'sublet',
    audience: 'family',
    status: 'pending',
    rent_monthly: 8500,
    security_deposit: 10000,
    is_negotiable: true,
    gas_bill_included: true,
    electricity_bill_included: false,
    water_bill_included: true,
    bedrooms: 2,
    bathrooms: 1,
    balconies: 1,
    floor_number: 2,
    total_floors: 4,
    area_sqft: 650,
    area_id: 'area-nutun-bazar',
    area_name_bn: 'নতুন বাজার',
    area_name_en: 'Nutun Bazar',
    address_street_bn: 'নতুন বাজার মসজিদ লেন, বাড়ি নং-৪৫',
    contact_name: 'মোঃ জহিরুল হক',
    contact_phone: '01944556677',
    contact_whatsapp: '01944556677',
    owner_id: 'owner-4',
    owner_name: 'মোঃ জহিরুল হক',
    is_owner_verified: false,
    is_verified: false,
    is_featured: false,
    views_count: 14,
    available_from: '১লা নভেম্বর ২০২৬',
    images: [
      {
        id: 'img-p1',
        listing_id: 'listing-pending-1',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
        storage_path: 'pending/1.jpg',
        is_primary: true,
        order_index: 0,
      }
    ],
    amenity_ids: ['am-titas-gas', 'am-water-24', 'am-cctv'],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'listing-pending-2',
    title_bn: 'কৃষি বিশ্ববিদ্যালয় শেষ মোড়ে ৩ সিটের ছাত্র মেস',
    title_en: '3 Seat Student Mess near BAU Last Gate',
    slug: '3-seat-student-mess-bau-gate',
    description_bn: 'বাকৃবি শিক্ষার্থীদের জন্য মনোরম পরিবেশে ৩ সিটের প্রশস্ত রুম। মিল সিস্টেম, ওয়াইফাই ও পড়ার উপযোগী শান্ত পরিবেশ।',
    description_en: '3 seat student mess with WiFi and meal management for BAU students.',
    property_type: 'seat',
    audience: 'student',
    status: 'pending',
    rent_monthly: 2200,
    security_deposit: 2000,
    is_negotiable: false,
    gas_bill_included: true,
    electricity_bill_included: true,
    water_bill_included: true,
    seat_count: 3,
    area_id: 'area-bau',
    area_name_bn: 'কৃষি বিশ্ববিদ্যালয় এলাকা',
    area_name_en: 'BAU Campus Area',
    address_street_bn: 'শেষ মোড়, হাজী কাশেম লেন',
    contact_name: 'বেগম নাসরিন আক্তার',
    contact_phone: '01833445566',
    owner_id: 'owner-3',
    owner_name: 'বেগম নাসরিন আক্তার',
    is_owner_verified: false,
    is_verified: false,
    is_featured: false,
    views_count: 42,
    available_from: 'তাৎক্ষণিক',
    images: [
      {
        id: 'img-p2',
        listing_id: 'listing-pending-2',
        url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop',
        storage_path: 'pending/2.jpg',
        is_primary: true,
        order_index: 0,
      }
    ],
    amenity_ids: ['am-wifi', 'am-water-24', 'am-filter'],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  }
];

// Helper functions for local fallback storage
function getStoredListings(): Listing[] {
  try {
    const raw = localStorage.getItem(ADMIN_LISTINGS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(ADMIN_LISTINGS_KEY, JSON.stringify(INITIAL_ADMIN_LISTINGS));
    return INITIAL_ADMIN_LISTINGS;
  } catch {
    return INITIAL_ADMIN_LISTINGS;
  }
}

function saveStoredListings(listings: Listing[]): void {
  try {
    localStorage.setItem(ADMIN_LISTINGS_KEY, JSON.stringify(listings));
  } catch (e) {
    console.error('Failed to save admin listings to storage', e);
  }
}

function getStoredUsers(): AdminUserItem[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
    return INITIAL_ADMIN_USERS;
  } catch {
    return INITIAL_ADMIN_USERS;
  }
}

function saveStoredUsers(users: AdminUserItem[]): void {
  try {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save admin users to storage', e);
  }
}

function getStoredReports(): ListingReport[] {
  try {
    const raw = localStorage.getItem(ADMIN_REPORTS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(ADMIN_REPORTS_KEY, JSON.stringify(INITIAL_ADMIN_REPORTS));
    return INITIAL_ADMIN_REPORTS;
  } catch {
    return INITIAL_ADMIN_REPORTS;
  }
}

function saveStoredReports(reports: ListingReport[]): void {
  try {
    localStorage.setItem(ADMIN_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save admin reports to storage', e);
  }
}

function getStoredAreas(): Area[] {
  try {
    const raw = localStorage.getItem(ADMIN_AREAS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(ADMIN_AREAS_KEY, JSON.stringify(MYMENSINGH_AREAS));
    return MYMENSINGH_AREAS;
  } catch {
    return MYMENSINGH_AREAS;
  }
}

function saveStoredAreas(areas: Area[]): void {
  try {
    localStorage.setItem(ADMIN_AREAS_KEY, JSON.stringify(areas));
  } catch (e) {
    console.error('Failed to save admin areas to storage', e);
  }
}

function getStoredAmenities(): Amenity[] {
  try {
    const raw = localStorage.getItem(ADMIN_AMENITIES_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(ADMIN_AMENITIES_KEY, JSON.stringify(AMENITIES_LIST));
    return AMENITIES_LIST;
  } catch {
    return AMENITIES_LIST;
  }
}

function saveStoredAmenities(amenities: Amenity[]): void {
  try {
    localStorage.setItem(ADMIN_AMENITIES_KEY, JSON.stringify(amenities));
  } catch (e) {
    console.error('Failed to save admin amenities to storage', e);
  }
}

/**
 * Server-Side / Service Authorization Validator
 * Ensures only authenticated users with role === 'admin' can execute admin mutations.
 */
export async function verifyAdminAuthorization(activeUser?: { id: string; role?: UserRole } | null): Promise<boolean> {
  // If active user is provided with admin role, check locally
  if (activeUser?.role === 'admin') {
    return true;
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    // Check cached active profile in browser environment
    try {
      const cached = localStorage.getItem('tolet_active_profile');
      if (cached) {
        const p = JSON.parse(cached);
        return p.role === 'admin';
      }
    } catch {
      return false;
    }
    return false;
  }

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return false;

    const { data: profile, error } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile) return false;
    return profile.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * 1. Dashboard Statistics
 * Fetches total users, total listings, pending listings, approved listings, reported listings
 */
export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    const listings = getStoredListings();
    const users = getStoredUsers();
    const reports = getStoredReports();

    return {
      totalUsers: users.length,
      totalListings: listings.length,
      pendingListings: listings.filter((l) => l.status === 'pending').length,
      approvedListings: listings.filter((l) => l.status === 'approved').length,
      rejectedListings: listings.filter((l) => l.status === 'rejected').length,
      rentedListings: listings.filter((l) => l.status === 'rented').length,
      reportedListings: reports.filter((r) => r.status === 'pending').length,
      verifiedOwners: users.filter((u) => u.role === 'owner' && u.is_verified).length,
    };
  }

  try {
    // Parallel counts from Supabase database
    const [
      usersRes,
      totalListingsRes,
      pendingListingsRes,
      approvedListingsRes,
      rejectedListingsRes,
      rentedListingsRes,
      reportedListingsRes,
      verifiedOwnersRes
    ] = await Promise.all([
      client.from('profiles').select('id', { count: 'exact', head: true }),
      client.from('listings').select('id', { count: 'exact', head: true }),
      client.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      client.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      client.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      client.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'rented'),
      client.from('listing_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      client.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'owner').eq('is_verified', true),
    ]);

    return {
      totalUsers: usersRes.count ?? 0,
      totalListings: totalListingsRes.count ?? 0,
      pendingListings: pendingListingsRes.count ?? 0,
      approvedListings: approvedListingsRes.count ?? 0,
      rejectedListings: rejectedListingsRes.count ?? 0,
      rentedListings: rentedListingsRes.count ?? 0,
      reportedListings: reportedListingsRes.count ?? 0,
      verifiedOwners: verifiedOwnersRes.count ?? 0,
    };
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    const listings = getStoredListings();
    const users = getStoredUsers();
    const reports = getStoredReports();
    return {
      totalUsers: users.length,
      totalListings: listings.length,
      pendingListings: listings.filter((l) => l.status === 'pending').length,
      approvedListings: listings.filter((l) => l.status === 'approved').length,
      rejectedListings: listings.filter((l) => l.status === 'rejected').length,
      rentedListings: listings.filter((l) => l.status === 'rented').length,
      reportedListings: reports.filter((r) => r.status === 'pending').length,
      verifiedOwners: users.filter((u) => u.role === 'owner' && u.is_verified).length,
    };
  }
}

/**
 * 2. Listing Moderation & Actions
 */
export async function fetchAdminListings(filters: {
  status?: string;
  property_type?: string;
  area_id?: string;
  search?: string;
} = {}): Promise<Listing[]> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    let list = getStoredListings();
    if (filters.status && filters.status !== 'all') {
      list = list.filter((l) => l.status === filters.status);
    }
    if (filters.property_type && filters.property_type !== 'all') {
      list = list.filter((l) => l.property_type === filters.property_type);
    }
    if (filters.area_id && filters.area_id !== 'all') {
      const areaId = String(filters.area_id);
      list = list.filter((l) => l.area_id === areaId || (l.slug ?? '').includes(areaId));
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((l) => 
        l.title_bn.toLowerCase().includes(q) ||
        l.title_en.toLowerCase().includes(q) ||
        l.contact_name.toLowerCase().includes(q) ||
        l.contact_phone.includes(q) ||
        l.area_name_bn.toLowerCase().includes(q)
      );
    }
    return list;
  }

  try {
    let query = client
      .from('listings')
      .select(`
        *,
        areas ( name_bn, name_en ),
        profiles ( name, avatar_url, is_verified, phone ),
        listing_images ( id, listing_id, url, storage_path, is_primary, order_index ),
        listing_amenities ( amenity_id )
      `)
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status as ListingStatus);
    }
    if (filters.property_type && filters.property_type !== 'all') {
      query = query.eq('property_type', filters.property_type as any);
    }
    if (filters.area_id && filters.area_id !== 'all') {
      query = query.eq('area_id', filters.area_id);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      query = query.or(`title_bn.ilike.%${q}%,title_en.ilike.%${q}%,contact_name.ilike.%${q}%,contact_phone.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn('Falling back to local admin listings:', error);
      return getStoredListings();
    }

    return data.map((row: any) =>
      mapDatabaseListingToUiListing(
        row,
        row.listing_images || [],
        row.listing_amenities?.map((a: any) => a.amenity_id) || [],
        row.areas,
        row.profiles
      )
    );
  } catch (err) {
    console.error('Error in fetchAdminListings:', err);
    return getStoredListings();
  }
}

/**
 * Approve Listing (Admin only)
 */
export async function adminApproveListing(listingId: string): Promise<{ success: boolean; error?: string }> {
  // Update local storage fallback
  const list = getStoredListings();
  const idx = list.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], status: 'approved', updated_at: new Date().toISOString() };
    saveStoredListings(list);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client
      .from('listings')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', listingId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Reject Listing with Reason (Admin only)
 */
export async function adminRejectListing(
  listingId: string, 
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const list = getStoredListings();
  const idx = list.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    list[idx] = { 
      ...list[idx], 
      status: 'rejected', 
      description_bn: `${list[idx].description_bn} [প্রত্যাখ্যানের কারণ: ${reason}]`,
      updated_at: new Date().toISOString() 
    };
    saveStoredListings(list);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client
      .from('listings')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', listingId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Mark/Unmark Listing as Featured
 */
export async function adminToggleFeaturedListing(
  listingId: string, 
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  const list = getStoredListings();
  const idx = list.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], is_featured: isFeatured, updated_at: new Date().toISOString() };
    saveStoredListings(list);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client
      .from('listings')
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', listingId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Mark/Unmark Listing as Verified
 */
export async function adminToggleVerifiedListing(
  listingId: string, 
  isVerified: boolean
): Promise<{ success: boolean; error?: string }> {
  const list = getStoredListings();
  const idx = list.findIndex((l) => l.id === listingId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], is_verified: isVerified, updated_at: new Date().toISOString() };
    saveStoredListings(list);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client
      .from('listings')
      .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
      .eq('id', listingId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete Listing permanently
 */
export async function adminDeleteListing(listingId: string): Promise<{ success: boolean; error?: string }> {
  const list = getStoredListings();
  const filtered = list.filter((l) => l.id !== listingId);
  saveStoredListings(filtered);

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('listings').delete().eq('id', listingId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. User Management
 */
export async function fetchAdminUsers(filters: {
  role?: string;
  is_verified?: boolean;
  search?: string;
} = {}): Promise<AdminUserItem[]> {
  const listings = getStoredListings();
  let users = getStoredUsers().map((u) => ({
    ...u,
    listings_count: listings.filter((l) => l.owner_id === u.id).length,
  }));

  const client = getSupabaseBrowserClient();
  if (!client) {
    if (filters.role && filters.role !== 'all') {
      users = users.filter((u) => u.role === filters.role);
    }
    if (filters.is_verified !== undefined) {
      users = users.filter((u) => u.is_verified === filters.is_verified);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      users = users.filter((u) => 
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    return users;
  }

  try {
    let query = client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.role && filters.role !== 'all') {
      query = query.eq('role', filters.role as UserRole);
    }
    if (filters.is_verified !== undefined) {
      query = query.eq('is_verified', filters.is_verified);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error || !data) {
      return users;
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      email: item.email || undefined,
      role: item.role as UserRole,
      avatar_url: item.avatar_url || undefined,
      is_verified: item.is_verified,
      whatsapp_number: item.whatsapp_number || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
      listings_count: listings.filter((l) => l.owner_id === item.id).length,
      is_deactivated: false,
    }));
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return users;
  }
}

/**
 * Toggle Owner Verification status
 */
export async function adminToggleVerifyUser(
  userId: string, 
  isVerified: boolean
): Promise<{ success: boolean; error?: string }> {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx] = { ...users[idx], is_verified: isVerified, updated_at: new Date().toISOString() };
    saveStoredUsers(users);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client
      .from('profiles')
      .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deactivate / Suspend or Reactivate user account
 */
export async function adminToggleDeactivateUser(
  userId: string, 
  isDeactivated: boolean
): Promise<{ success: boolean; error?: string }> {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx] = { ...users[idx], is_deactivated: isDeactivated, updated_at: new Date().toISOString() };
    saveStoredUsers(users);
  }
  return { success: true };
}

/**
 * Fetch all listings for a specific owner
 */
export async function fetchOwnerListingsForAdmin(ownerId: string): Promise<Listing[]> {
  const allListings = await fetchAdminListings();
  return allListings.filter((l) => l.owner_id === ownerId);
}

/**
 * 4. Reports Management
 */
export async function fetchAdminReportsWithListings(statusFilter?: ReportStatus): Promise<ListingReport[]> {
  const client = getSupabaseBrowserClient();
  const allListings = await fetchAdminListings();
  const allUsers = getStoredUsers();

  if (!client) {
    let reports = getStoredReports();
    if (statusFilter) {
      reports = reports.filter((r) => r.status === statusFilter);
    }
    return reports.map((rep) => ({
      ...rep,
      listing: allListings.find((l) => l.id === rep.listing_id),
      reporter_name: rep.reporter_name || allUsers.find((u) => u.id === rep.reporter_id)?.name || 'বেনামী ব্যবহারকারী',
    }));
  }

  try {
    let query = client
      .from('listing_reports')
      .select(`
        *,
        profiles:reporter_id ( name )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) {
      return getStoredReports().map((rep) => ({
        ...rep,
        listing: allListings.find((l) => l.id === rep.listing_id),
      }));
    }

    return data.map((item: any) => ({
      id: item.id,
      listing_id: item.listing_id,
      reporter_id: item.reporter_id || undefined,
      reporter_name: item.profiles?.name || 'বেনামী ব্যবহারকারী',
      reason: item.reason,
      comment: item.comment || undefined,
      status: item.status as ReportStatus,
      moderator_notes: item.moderator_notes || undefined,
      reviewed_by: item.reviewed_by || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
      listing: allListings.find((l) => l.id === item.listing_id),
    }));
  } catch (err) {
    console.error('Error fetching admin reports:', err);
    return getStoredReports();
  }
}

/**
 * Resolve or Dismiss a Report
 */
export async function adminResolveReport(
  reportId: string,
  action: 'resolve' | 'dismiss',
  notes?: string,
  listingAction?: 'approve' | 'reject' | 'remove'
): Promise<{ success: boolean; error?: string }> {
  const newStatus: ReportStatus = action === 'resolve' ? 'resolved' : 'dismissed';

  const reports = getStoredReports();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    const rep = reports[idx];
    reports[idx] = {
      ...rep,
      status: newStatus,
      moderator_notes: notes || rep.moderator_notes,
      updated_at: new Date().toISOString(),
    };
    saveStoredReports(reports);

    // Apply listing action if requested
    if (listingAction === 'reject' && rep.listing_id) {
      await adminRejectListing(rep.listing_id, notes || 'অভিযোগের ভিত্তিতে বিজ্ঞাপন বাতিল করা হয়েছে');
    } else if (listingAction === 'remove' && rep.listing_id) {
      await adminDeleteListing(rep.listing_id);
    }
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client
      .from('listing_reports')
      .update({
        status: newStatus,
        moderator_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 5. Areas Management
 */
export async function fetchAdminAreas(): Promise<Area[]> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return getStoredAreas();
  }

  try {
    const { data, error } = await client
      .from('areas')
      .select('*')
      .order('is_popular', { ascending: false })
      .order('name_en', { ascending: true });

    if (error || !data) return getStoredAreas();

    return data.map((item) => ({
      id: item.id,
      name_en: item.name_en,
      name_bn: item.name_bn,
      slug: item.slug,
      description_bn: item.description_bn || undefined,
      description_en: item.description_en || undefined,
      is_popular: item.is_popular,
      listing_count: item.listing_count,
    }));
  } catch {
    return getStoredAreas();
  }
}

export async function adminCreateArea(areaData: {
  name_bn: string;
  name_en: string;
  slug: string;
  description_bn?: string;
  description_en?: string;
  is_popular?: boolean;
}): Promise<{ success: boolean; area?: Area; error?: string }> {
  const newArea: Area = {
    id: `area-${Date.now()}`,
    name_bn: areaData.name_bn,
    name_en: areaData.name_en,
    slug: areaData.slug || areaData.name_en.toLowerCase().replace(/\s+/g, '-'),
    description_bn: areaData.description_bn,
    description_en: areaData.description_en,
    is_popular: areaData.is_popular ?? false,
    listing_count: 0,
  };

  const areas = getStoredAreas();
  saveStoredAreas([...areas, newArea]);

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true, area: newArea };

  try {
    const { data, error } = await client
      .from('areas')
      .insert([{
        id: newArea.id,
        name_bn: newArea.name_bn,
        name_en: newArea.name_en,
        slug: newArea.slug,
        description_bn: newArea.description_bn || undefined,
        description_en: newArea.description_en || undefined,
        is_popular: newArea.is_popular ?? false,
        listing_count: 0,
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, area: data as Area };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminUpdateArea(
  id: string, 
  updates: Partial<Area>
): Promise<{ success: boolean; error?: string }> {
  const areas = getStoredAreas();
  const idx = areas.findIndex((a) => a.id === id);
  if (idx !== -1) {
    areas[idx] = { ...areas[idx], ...updates };
    saveStoredAreas(areas);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('areas').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteArea(id: string): Promise<{ success: boolean; error?: string }> {
  const areas = getStoredAreas().filter((a) => a.id !== id);
  saveStoredAreas(areas);

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('areas').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 6. Amenities Management
 */
export async function fetchAdminAmenities(): Promise<Amenity[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return getStoredAmenities();

  try {
    const { data, error } = await client.from('amenities').select('*').order('category', { ascending: true });
    if (error || !data) return getStoredAmenities();

    return data.map((item) => ({
      id: item.id,
      name_en: item.name_en,
      name_bn: item.name_bn,
      icon_name: item.icon_name,
      category: item.category as Amenity['category'],
    }));
  } catch {
    return getStoredAmenities();
  }
}

export async function adminCreateAmenity(amenityData: {
  name_bn: string;
  name_en: string;
  icon_name: string;
  category: Amenity['category'];
}): Promise<{ success: boolean; amenity?: Amenity; error?: string }> {
  const newAmenity: Amenity = {
    id: `am-${Date.now()}`,
    name_bn: amenityData.name_bn,
    name_en: amenityData.name_en,
    icon_name: amenityData.icon_name || 'CheckCircle',
    category: amenityData.category,
  };

  const list = getStoredAmenities();
  saveStoredAmenities([...list, newAmenity]);

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true, amenity: newAmenity };

  try {
    const { data, error } = await client
      .from('amenities')
      .insert([{
        id: newAmenity.id,
        name_bn: newAmenity.name_bn,
        name_en: newAmenity.name_en,
        icon_name: newAmenity.icon_name,
        category: newAmenity.category,
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, amenity: data as Amenity };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminUpdateAmenity(
  id: string, 
  updates: Partial<Amenity>
): Promise<{ success: boolean; error?: string }> {
  const list = getStoredAmenities();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    saveStoredAmenities(list);
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('amenities').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteAmenity(id: string): Promise<{ success: boolean; error?: string }> {
  const list = getStoredAmenities().filter((a) => a.id !== id);
  saveStoredAmenities(list);

  const client = getSupabaseBrowserClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('amenities').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
