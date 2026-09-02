import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './lib/language-context';
import { AuthProvider, useAuth } from './lib/supabase';
import { Layout } from './components/layout/Layout';

import { 
  HomeView, 
  ListingsExplorerView, 
  ListingDetailView, 
  ListingCard,
  FavoritesView,
  GuestFavoritesPromptModal
} from './components/marketplace';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { UserProfileView } from './components/dashboard/UserProfileView';
import { OwnerListingsView } from './components/dashboard/OwnerListingsView';
import { ListingWizardForm } from './components/dashboard/ListingWizardForm';

import { 
  AdminLayout, 
  AdminOverviewView, 
  AdminListingsView, 
  AdminUsersView, 
  AdminReportsView, 
  AdminAreasView, 
  AdminAmenitiesView 
} from './components/admin';
import { 
  FAQView, 
  SafetyGuidelinesView, 
  TermsPrivacyView 
} from './components/pages/StaticPages';

import { Button } from './components/ui/button';
import { Container } from './components/layout/Container';
import { PlusCircle, ArrowLeft, Building2, CheckCircle2, ShieldCheck, Home } from 'lucide-react';
import { SAMPLE_LISTINGS } from './data/sample-listings';
import { MYMENSINGH_AREAS } from './data/mymensingh-locations';

import { parseUrlFilters, serializeFiltersToUrl } from './lib/filter-url';
import { 
  fetchUserFavoriteIds, 
  addUserFavorite, 
  removeUserFavorite, 
  syncLocalFavoritesToUser 
} from './lib/supabase/services/favorites';

function parsePath(pathname: string, search: string = ''): { view: string; params: any } {
  const path = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const urlFilters = search ? parseUrlFilters(search) : {};
  
  if (!path || path === 'home') {
    return { view: 'home', params: { ...urlFilters } };
  }

  // Tolet listing detail
  const toletDetailMatch = path.match(/^tolet\/([^/]+)$/);
  if (toletDetailMatch) {
    return { view: 'tolet/detail', params: { slug: toletDetailMatch[1], ...urlFilters } };
  }

  // Mess listing detail
  const messDetailMatch = path.match(/^mess\/([^/]+)$/);
  if (messDetailMatch) {
    return { view: 'mess/detail', params: { slug: messDetailMatch[1], ...urlFilters } };
  }

  // Hostel listing detail
  const hostelDetailMatch = path.match(/^hostel\/([^/]+)$/);
  if (hostelDetailMatch) {
    return { view: 'hostel/detail', params: { slug: hostelDetailMatch[1], ...urlFilters } };
  }

  // Sublet listing detail
  const subletDetailMatch = path.match(/^sublet\/([^/]+)$/);
  if (subletDetailMatch) {
    return { view: 'sublet/detail', params: { slug: subletDetailMatch[1], ...urlFilters } };
  }

  // Edit listing
  const editMatch = path.match(/^dashboard\/listings\/([^/]+)\/edit$/);
  if (editMatch) {
    return { view: 'dashboard/listings/edit', params: { id: editMatch[1], ...urlFilters } };
  }

  return { view: path, params: { ...urlFilters } };
}

function AppContent() {
  const { language, t } = useLanguage();
  const { user, isAuthenticated, isOwner } = useAuth();
  
  const initialRoute = parsePath(window.location.pathname, window.location.search);
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [viewParams, setViewParams] = useState<any>(initialRoute.params);
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState<boolean>(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tolet_favorites');
      return saved ? JSON.parse(saved) : ['listing-1'];
    } catch {
      return ['listing-1'];
    }
  });

  // Sync favorites when user logs in / auth changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const syncFavorites = async () => {
        try {
          const localSaved = localStorage.getItem('tolet_favorites');
          const localIds: string[] = localSaved ? JSON.parse(localSaved) : [];
          const merged = await syncLocalFavoritesToUser(user.id, localIds);
          if (merged && merged.length > 0) {
            setFavorites(merged);
            localStorage.setItem('tolet_favorites', JSON.stringify(merged));
          } else {
            const dbIds = await fetchUserFavoriteIds(user.id);
            setFavorites(dbIds);
            localStorage.setItem('tolet_favorites', JSON.stringify(dbIds));
          }
        } catch (e) {
          console.error('Failed to sync favorites on login:', e);
        }
      };
      syncFavorites();
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('tolet_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Listen to browser popstate for back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePath(window.location.pathname, window.location.search);
      setCurrentView(parsed.view);
      setViewParams(parsed.params);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleFavorite = async (id: string) => {
    const isCurrentlyFav = favorites.includes(id);
    const nextFavorites = isCurrentlyFav
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

    // 1. Instant optimistic update
    setFavorites(nextFavorites);
    try {
      localStorage.setItem('tolet_favorites', JSON.stringify(nextFavorites));
    } catch (e) {
      console.error(e);
    }

    // 2. If authenticated, update Supabase securely (RLS scopes to auth.uid())
    if (isAuthenticated && user?.id) {
      try {
        if (isCurrentlyFav) {
          const ok = await removeUserFavorite(user.id, id);
          if (!ok) {
            // Revert state if remote delete failed
            setFavorites((prev) => [...prev, id]);
          }
        } else {
          const ok = await addUserFavorite(user.id, id);
          if (!ok) {
            // Revert state if remote insert failed
            setFavorites((prev) => prev.filter((item) => item !== id));
          }
        }
      } catch (err) {
        console.error('Error updating favorite in database:', err);
      }
    } else {
      // 3. Guest user: show friendly sync prompt if adding and not dismissed
      if (!isCurrentlyFav) {
        const isSuppressed = localStorage.getItem('tolet_suppress_guest_fav_prompt') === 'true';
        if (!isSuppressed && nextFavorites.length >= 2) {
          setIsGuestPromptOpen(true);
        }
      }
    }
  };

  const handleClearAllFavorites = async () => {
    const prev = [...favorites];
    setFavorites([]);
    localStorage.removeItem('tolet_favorites');

    if (isAuthenticated && user?.id) {
      for (const id of prev) {
        await removeUserFavorite(user.id, id);
      }
    }
  };

  const handleNavigate = (view: string, params?: any) => {
    // Determine the target URL
    let targetUrl = '/';
    let targetView = view;
    let targetParams = params || {};

    if (view === 'home' || view === '/') {
      targetUrl = '/';
      targetView = 'home';
    } else if (view === 'tolet' || view === 'mess' || view === 'hostel' || view === 'sublet') {
      const defaultMode = view === 'mess' ? 'mess' : view === 'hostel' ? 'hostel' : view === 'sublet' ? 'sublet' : 'all';
      const queryStr = serializeFiltersToUrl(targetParams, defaultMode);
      targetUrl = `/${view}${queryStr}`;
      targetView = view;
    } else if (view.startsWith('tolet/')) {
      const slug = view.replace(/^tolet\//, '');
      targetUrl = `/tolet/${slug}`;
      targetView = 'tolet/detail';
      targetParams = { slug, ...targetParams };
    } else if (view.startsWith('mess/')) {
      const slug = view.replace(/^mess\//, '');
      targetUrl = `/mess/${slug}`;
      targetView = 'mess/detail';
      targetParams = { slug, ...targetParams };
    } else if (view.startsWith('hostel/')) {
      const slug = view.replace(/^hostel\//, '');
      targetUrl = `/hostel/${slug}`;
      targetView = 'hostel/detail';
      targetParams = { slug, ...targetParams };
    } else if (view.startsWith('sublet/')) {
      const slug = view.replace(/^sublet\//, '');
      targetUrl = `/sublet/${slug}`;
      targetView = 'sublet/detail';
      targetParams = { slug, ...targetParams };
    } else if (view === 'dashboard/listings/edit' && targetParams?.id) {
      targetUrl = `/dashboard/listings/${targetParams.id}/edit`;
      targetView = 'dashboard/listings/edit';
    } else {
      targetUrl = `/${view}`;
      targetView = view;
    }

    setCurrentView(targetView);
    setViewParams(targetParams);

    if (window.location.pathname + window.location.search !== targetUrl) {
      try {
        window.history.pushState({}, '', targetUrl);
      } catch {
        // Sandboxed iframe fallback
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render sub-views or the master views
  const renderView = () => {
    // 1. /login View
    if (currentView === 'login') {
      return (
        <LoginView
          onNavigate={handleNavigate}
          returnTo={viewParams.returnTo || 'dashboard'}
        />
      );
    }

    // 2. /register View
    if (currentView === 'register') {
      return (
        <RegisterView
          onNavigate={handleNavigate}
          initialRole={viewParams.role || 'tenant'}
        />
      );
    }

    // 3. /dashboard View (Protected)
    if (currentView === 'dashboard') {
      return (
        <ProtectedRoute
          onNavigate={handleNavigate}
          requiredViewName="dashboard"
        >
          <DashboardOverview
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </ProtectedRoute>
      );
    }

    // 4. /dashboard/profile View (Protected)
    if (currentView === 'dashboard/profile') {
      return (
        <ProtectedRoute
          onNavigate={handleNavigate}
          requiredViewName="dashboard/profile"
        >
          <UserProfileView
            onNavigate={handleNavigate}
          />
        </ProtectedRoute>
      );
    }

    // 5. /dashboard/listings View (Owner & Admin Protected)
    if (currentView === 'dashboard/listings') {
      return (
        <ProtectedRoute
          onNavigate={handleNavigate}
          allowedRoles={['owner', 'admin']}
          requiredViewName="dashboard/listings"
        >
          <OwnerListingsView
            onNavigate={handleNavigate}
          />
        </ProtectedRoute>
      );
    }

    // 6. /dashboard/listings/new & /post-property (Owner & Admin Protected)
    if (currentView === 'dashboard/listings/new' || currentView === 'post-property') {
      return (
        <ProtectedRoute
          onNavigate={handleNavigate}
          allowedRoles={['owner', 'admin']}
          requiredViewName="dashboard/listings/new"
        >
          <ListingWizardForm
            onNavigate={handleNavigate}
          />
        </ProtectedRoute>
      );
    }

    // 7. /dashboard/listings/[id]/edit (Owner & Admin Protected)
    if (currentView === 'dashboard/listings/edit') {
      return (
        <ProtectedRoute
          onNavigate={handleNavigate}
          allowedRoles={['owner', 'admin']}
          requiredViewName="dashboard/listings/edit"
        >
          <ListingWizardForm
            onNavigate={handleNavigate}
            listingIdToEdit={viewParams?.id}
          />
        </ProtectedRoute>
      );
    }

    // 8. Admin Routes (Protected with Admin Role Only)
    if (currentView === 'admin' || currentView.startsWith('admin/')) {
      const getAdminTab = (): 'overview' | 'listings' | 'users' | 'reports' | 'areas' | 'amenities' => {
        if (currentView === 'admin/listings') return 'listings';
        if (currentView === 'admin/users') return 'users';
        if (currentView === 'admin/reports') return 'reports';
        if (currentView === 'admin/areas') return 'areas';
        if (currentView === 'admin/amenities') return 'amenities';
        return 'overview';
      };

      const tab = getAdminTab();

      return (
        <ProtectedRoute
          onNavigate={handleNavigate}
          allowedRoles={['admin']}
          requiredViewName={currentView}
        >
          <AdminLayout
            currentAdminTab={tab}
            onNavigate={handleNavigate}
          >
            {tab === 'overview' && <AdminOverviewView onNavigate={handleNavigate} />}
            {tab === 'listings' && <AdminListingsView onNavigate={handleNavigate} />}
            {tab === 'users' && <AdminUsersView onNavigate={handleNavigate} />}
            {tab === 'reports' && <AdminReportsView onNavigate={handleNavigate} />}
            {tab === 'areas' && <AdminAreasView onNavigate={handleNavigate} />}
            {tab === 'amenities' && <AdminAmenitiesView onNavigate={handleNavigate} />}
          </AdminLayout>
        </ProtectedRoute>
      );
    }

    // 9. /tolet/[slug], /mess/[slug], /hostel/[slug], /sublet/[slug] (Listing Detail View)
    if (
      currentView === 'tolet/detail' || 
      currentView === 'mess/detail' || 
      currentView === 'hostel/detail' || 
      currentView === 'sublet/detail'
    ) {
      const prefix = currentView.split('/')[0] as 'tolet' | 'mess' | 'hostel' | 'sublet';
      return (
        <ListingDetailView
          slugOrId={viewParams?.slug}
          categoryPrefix={prefix === 'sublet' ? 'tolet' : prefix}
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }

    // 10. /tolet (All To-Let / Family / Bachelor listings)
    if (currentView === 'tolet') {
      return (
        <ListingsExplorerView
          mode="tolet"
          initialFilters={viewParams}
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }

    // 11. /mess (Mess & Bachelor Seats)
    if (currentView === 'mess') {
      return (
        <ListingsExplorerView
          mode="mess"
          initialFilters={viewParams}
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }

    // 12. /hostel (Hostels)
    if (currentView === 'hostel') {
      return (
        <ListingsExplorerView
          mode="hostel"
          initialFilters={viewParams}
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }

    // 13. /sublet (Sublets)
    if (currentView === 'sublet') {
      return (
        <ListingsExplorerView
          mode="sublet"
          initialFilters={viewParams}
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }

    // 14. /favorites View
    if (currentView === 'favorites') {
      return (
        <FavoritesView
          onNavigate={handleNavigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onClearAllFavorites={handleClearAllFavorites}
        />
      );
    }

    // 15. /faq View
    if (currentView === 'faq') {
      return <FAQView onNavigate={handleNavigate} />;
    }

    // 16. /safety View
    if (currentView === 'safety') {
      return <SafetyGuidelinesView onNavigate={handleNavigate} />;
    }

    // 17. /terms View
    if (currentView === 'terms') {
      return <TermsPrivacyView onNavigate={handleNavigate} />;
    }

    // 18. Default: / (Homepage)
    return (
      <HomeView
        onNavigate={handleNavigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  };

  // If rendering an admin view, it provides its own full layout
  if (currentView === 'admin' || currentView.startsWith('admin/')) {
    return <>{renderView()}</>;
  }

  return (
    <>
      <Layout
        currentView={currentView}
        onNavigate={handleNavigate}
        favoritesCount={favorites.length}
      >
        {renderView()}
      </Layout>

      {/* Guest Favorites Cloud Sync Prompt */}
      <GuestFavoritesPromptModal
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        onNavigateToLogin={() => handleNavigate('login')}
      />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
