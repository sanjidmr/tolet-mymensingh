"use client";

import { Layout } from "@/src/components/layout/Layout";
import { FavoritesView } from "@/src/components/marketplace/FavoritesView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function FavoritesPage() {
  const navigate = useLegacyNavigate();
  const { favorites, handleToggleFavorite, handleClearAllFavorites } = useFavorites();

  return (
    <Layout currentView="favorites" onNavigate={navigate} favoritesCount={favorites.length}>
      <FavoritesView
        onNavigate={navigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onClearAllFavorites={handleClearAllFavorites}
      />
    </Layout>
  );
}
