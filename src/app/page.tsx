"use client";

import { Layout } from "@/src/components/layout/Layout";
import { HomeView } from "@/src/components/marketplace/HomeView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function HomePage() {
  const navigate = useLegacyNavigate();
  const { favorites, handleToggleFavorite } = useFavorites();

  return (
    <Layout currentView="home" onNavigate={navigate} favoritesCount={favorites.length}>
      <HomeView
        onNavigate={navigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </Layout>
  );
}
