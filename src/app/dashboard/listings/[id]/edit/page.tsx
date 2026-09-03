"use client";

import React from "react";
import { Layout } from "@/src/components/layout/Layout";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { ListingWizardForm } from "@/src/components/dashboard/ListingWizardForm";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const navigate = useLegacyNavigate();
  const { favorites } = useFavorites();
  const { id } = React.use(params);

  return (
    <Layout
      currentView="dashboard/listings/edit"
      onNavigate={navigate}
      favoritesCount={favorites.length}
    >
      <ProtectedRoute
        onNavigate={navigate}
        allowedRoles={["owner", "admin"]}
        requiredViewName="dashboard/listings/edit"
      >
        <ListingWizardForm onNavigate={navigate} listingIdToEdit={id} />
      </ProtectedRoute>
    </Layout>
  );
}
