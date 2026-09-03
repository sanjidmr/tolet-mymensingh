"use client";

import { Layout } from "@/src/components/layout/Layout";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { DashboardOverview } from "@/src/components/dashboard/DashboardOverview";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function DashboardPage() {
  const navigate = useLegacyNavigate();
  const { favorites, handleToggleFavorite } = useFavorites();

  return (
    <Layout currentView="dashboard" onNavigate={navigate} favoritesCount={favorites.length}>
      <ProtectedRoute onNavigate={navigate} requiredViewName="dashboard">
        <DashboardOverview
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      </ProtectedRoute>
    </Layout>
  );
}
