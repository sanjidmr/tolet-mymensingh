"use client";

import { Layout } from "@/src/components/layout/Layout";
import { ListingsExplorerView } from "@/src/components/marketplace/ListingsExplorerView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function SubletPage() {
  const navigate = useLegacyNavigate();
  const { favorites, handleToggleFavorite } = useFavorites();

  return (
    <Layout currentView="sublet" onNavigate={navigate} favoritesCount={favorites.length}>
      <ListingsExplorerView
        mode="sublet"
        onNavigate={navigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </Layout>
  );
}
