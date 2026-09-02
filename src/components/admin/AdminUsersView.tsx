import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  Home, 
  Eye, 
  Ban, 
  UserCheck, 
  UserX, 
  ExternalLink,
  Shield,
  User,
  Filter
} from 'lucide-react';
import { AdminUserItem, Listing } from '../../types';
import { useLanguage } from '../../lib/language-context';
import { 
  fetchAdminUsers, 
  adminToggleVerifyUser, 
  adminToggleDeactivateUser 
} from '../../lib/supabase';
import { toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { OwnerInspectionModal } from './OwnerInspectionModal';
import { ListingDetailModal } from './ListingDetailModal';

interface AdminUsersViewProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedUserForInspection, setSelectedUserForInspection] = useState<AdminUserItem | null>(null);
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        is_verified: verifiedFilter === 'verified' ? true : verifiedFilter === 'unverified' ? false : undefined,
        search: searchQuery || undefined,
      });
      setUsers(data);
    } catch (e) {
      console.error('Error loading admin users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, verifiedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(true);
    await adminToggleVerifyUser(userId, !currentStatus);
    setIsUpdating(false);
    loadUsers();
  };

  const handleToggleDeactivate = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(true);
    await adminToggleDeactivateUser(userId, !currentStatus);
    setIsUpdating(false);
    loadUsers();
  };

  const counts = {
    all: users.length,
    owners: users.filter((u) => u.role === 'owner').length,
    tenants: users.filter((u) => u.role === 'tenant').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-stone-900">
              {language === 'bn' ? 'ব্যবহারকারী ও মালিক ব্যবস্থাপনা' : 'User & Landlord Management'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-stone-900 text-white">
              {toBengaliNumber(users.length, language)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {language === 'bn' 
              ? 'মালিক ভেরিফিকেশন, ইউজার প্রোফাইল পর্যালোচনা এবং অ্যাকাউন্ট অ্যাক্টিভেশন নিয়ন্ত্রণ করুন' 
              : 'Verify landlords, audit user accounts, and manage system permissions'}
          </p>
        </div>

        {/* Role breakdown pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold">
            মালিক: {toBengaliNumber(counts.owners, language)}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 font-bold">
            ভাড়াটিয়া: {toBengaliNumber(counts.tenants, language)}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        
        {/* Role tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label_bn: 'সকল ইউজার', label_en: 'All Users' },
            { id: 'owner', label_bn: 'বাড়ির মালিক (Owners)', label_en: 'Owners' },
            { id: 'tenant', label_bn: 'ভাড়াটিয়া (Tenants)', label_en: 'Tenants' },
            { id: 'admin', label_bn: 'অ্যাডমিনগণ (Admins)', label_en: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {language === 'bn' ? tab.label_bn : tab.label_en}
            </button>
          ))}
        </div>

        {/* Search & Verification filter */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'নাম, ফোন নম্বর বা ইমেইল দিয়ে ইউজার খুঁজুন...' : 'Search by name, phone, or email...'}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              aria-label={language === 'bn' ? 'ভেরিফিকেশন ফিল্টার' : 'Verification filter'}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{language === 'bn' ? 'সকল ভেরিফিকেশন' : 'All Status'}</option>
              <option value="verified">{language === 'bn' ? 'শুধুমাত্র ভেরিফাইড' : 'Verified Only'}</option>
              <option value="unverified">{language === 'bn' ? 'আন-ভেরিফাইড' : 'Unverified Only'}</option>
            </select>

            <Button
              type="submit"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold px-4 h-9"
            >
              {language === 'bn' ? 'সার্চ' : 'Filter'}
            </Button>
          </div>
        </form>
      </div>

      {/* Users Table / Grid */}
      {loading ? (
        <div className="py-16 text-center text-stone-500 text-sm">
          ইউজার তালিকা লোড হচ্ছে...
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-stone-200 p-8 space-y-2">
          <Users className="h-10 w-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">কোনো ইউজার পাওয়া যায়নি</h3>
          <p className="text-xs text-stone-500">অনুসন্ধান বা ফিল্টার শর্ত পরিবর্তন করুন।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* User Avatar & Info */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="relative">
                  <div className="h-13 w-13 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold overflow-hidden shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-base">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  {user.is_verified && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-2xs">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-stone-900 truncate">
                      {user.name}
                    </h3>

                    {/* Role badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : user.role === 'owner'
                        ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                        : 'bg-teal-100 text-teal-900 border border-teal-200'
                    }`}>
                      {user.role}
                    </span>

                    {user.is_deactivated && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                        স্থগিত (Suspended)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                    <a href={`tel:${user.phone}`} className="flex items-center gap-1 hover:text-emerald-700 font-mono">
                      <PhoneCall className="h-3 w-3 text-stone-400" />
                      <span>{user.phone}</span>
                    </a>
                    {user.email && (
                      <span className="flex items-center gap-1 text-stone-500 truncate max-w-xs">
                        <Mail className="h-3 w-3 text-stone-400 shrink-0" />
                        <span>{user.email}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-0.5">
                    {user.role === 'owner' && (
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        {toBengaliNumber(user.listings_count || 0, language)} টি বিজ্ঞাপন
                      </span>
                    )}
                    <span>যুক্ত হয়েছেন: {new Date(user.created_at).toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
                
                {/* View Owner Listings */}
                {user.role === 'owner' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUserForInspection(user)}
                    className="h-8 px-2.5 rounded-xl border-stone-200 text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Home className="h-3.5 w-3.5 mr-1" />
                    <span>বিজ্ঞাপনসমূহ ({toBengaliNumber(user.listings_count || 0, language)})</span>
                  </Button>
                )}

                {/* Toggle Verify Owner */}
                {user.role === 'owner' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVerify(user.id, user.is_verified)}
                    disabled={isUpdating}
                    className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                      user.is_verified
                        ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-rose-50 hover:text-rose-700'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <ShieldCheck className={`h-3.5 w-3.5 mr-1 ${user.is_verified ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <span>{user.is_verified ? 'Verified প্রত্যাহার' : 'Verify করুন'}</span>
                  </Button>
                )}

                {/* Toggle Deactivate / Suspend */}
                {user.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleDeactivate(user.id, !!user.is_deactivated)}
                    disabled={isUpdating}
                    className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                      user.is_deactivated
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <Ban className="h-3.5 w-3.5 mr-1" />
                    <span>{user.is_deactivated ? 'চালু করুন' : 'স্থগিত করুন'}</span>
                  </Button>
                )}

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Owner Inspector Modal */}
      <OwnerInspectionModal
        user={selectedUserForInspection}
        isOpen={!!selectedUserForInspection}
        onClose={() => setSelectedUserForInspection(null)}
        onSelectListingForPreview={(listing) => {
          setSelectedUserForInspection(null);
          setPreviewListing(listing);
        }}
        onUserUpdated={loadUsers}
      />

      {/* Listing Detail Modal */}
      <ListingDetailModal
        listing={previewListing}
        isOpen={!!previewListing}
        onClose={() => setPreviewListing(null)}
      />

    </div>
  );
};
