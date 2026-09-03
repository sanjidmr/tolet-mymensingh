"use client";

import { Layout } from "@/src/components/layout/Layout";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { OwnerListingsView } from "@/src/components/dashboard/OwnerListingsView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function MyListingsPage() {
  const navigate = useLegacyNavigate();
  const { favorites } = useFavorites();

  return (
    <Layout
      currentView="dashboard/listings"
      onNavigate={navigate}
      favoritesCount={favorites.length}
    >
      <ProtectedRoute
        onNavigate={navigate}
        allowedRoles={["owner", "admin"]}
        requiredViewName="dashboard/listings"
      >
        <OwnerListingsView onNavigate={navigate} />
      </ProtectedRoute>
    </Layout>
  );
}
