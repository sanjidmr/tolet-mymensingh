"use client";

import { Layout } from "@/src/components/layout/Layout";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { UserProfileView } from "@/src/components/dashboard/UserProfileView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function ProfilePage() {
  const navigate = useLegacyNavigate();
  const { favorites } = useFavorites();

  return (
    <Layout
      currentView="dashboard/profile"
      onNavigate={navigate}
      favoritesCount={favorites.length}
    >
      <ProtectedRoute onNavigate={navigate} requiredViewName="dashboard/profile">
        <UserProfileView onNavigate={navigate} />
      </ProtectedRoute>
    </Layout>
  );
}
