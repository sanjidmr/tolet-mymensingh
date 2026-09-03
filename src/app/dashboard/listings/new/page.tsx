"use client";

import { Layout } from "@/src/components/layout/Layout";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { ListingWizardForm } from "@/src/components/dashboard/ListingWizardForm";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function NewListingPage() {
  const navigate = useLegacyNavigate();
  const { favorites } = useFavorites();

  return (
    <Layout
      currentView="dashboard/listings/new"
      onNavigate={navigate}
      favoritesCount={favorites.length}
    >
      <ProtectedRoute
        onNavigate={navigate}
        allowedRoles={["owner", "admin"]}
        requiredViewName="dashboard/listings/new"
      >
        <ListingWizardForm onNavigate={navigate} />
      </ProtectedRoute>
    </Layout>
  );
}
