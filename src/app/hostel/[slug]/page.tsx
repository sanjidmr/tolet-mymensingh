"use client";

import React from "react";
import { Layout } from "@/src/components/layout/Layout";
import { ListingDetailView } from "@/src/components/marketplace/ListingDetailView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import { useFavorites } from "@/src/lib/favorites-context";

export default function HostelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const navigate = useLegacyNavigate();
  const { favorites, handleToggleFavorite } = useFavorites();
  const { slug } = React.use(params);

  return (
    <Layout
      currentView="hostel/detail"
      onNavigate={navigate}
      favoritesCount={favorites.length}
    >
      <ListingDetailView
        slugOrId={slug}
        categoryPrefix="hostel"
        onNavigate={navigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </Layout>
  );
}
