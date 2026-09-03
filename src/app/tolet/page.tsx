"use client";

import { Layout } from "@/src/components/layout/Layout";
import { ListingsExplorerView } from "@/src/components/marketplace/ListingsExplorerView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function ToletPage() {
  const navigate = useLegacyNavigate();
  const { favorites, handleToggleFavorite } = useFavorites();

  return (
    <Layout currentView="tolet" onNavigate={navigate} favoritesCount={favorites.length}>
      <ListingsExplorerView
        mode="tolet"
        onNavigate={navigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </Layout>
  );
}
