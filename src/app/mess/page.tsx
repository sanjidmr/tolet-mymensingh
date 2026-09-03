"use client";

import { Layout } from "@/src/components/layout/Layout";
import { ListingsExplorerView } from "@/src/components/marketplace/ListingsExplorerView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function MessPage() {
  const navigate = useLegacyNavigate();
  const { favorites, handleToggleFavorite } = useFavorites();

  return (
    <Layout currentView="mess" onNavigate={navigate} favoritesCount={favorites.length}>
      <ListingsExplorerView
        mode="mess"
        onNavigate={navigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </Layout>
  );
}
