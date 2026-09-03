"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/src/lib/supabase";
import { GuestFavoritesPromptModal } from "@/src/components/marketplace/GuestFavoritesPromptModal";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";
import {
  fetchUserFavoriteIds,
  addUserFavorite,
  removeUserFavorite,
  syncLocalFavoritesToUser,
} from "@/src/lib/supabase/services/favorites";

interface FavoritesContextValue {
  favorites: string[];
  isGuestPromptOpen: boolean;
  openGuestPrompt: () => void;
  closeGuestPrompt: () => void;
  handleToggleFavorite: (id: string) => void;
  handleClearAllFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useLegacyNavigate();

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["listing-1"];
    try {
      const saved = localStorage.getItem("tolet_favorites");
      return saved ? JSON.parse(saved) : ["listing-1"];
    } catch {
      return ["listing-1"];
    }
  });

  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("tolet_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const sync = async () => {
        try {
          const localSaved = localStorage.getItem("tolet_favorites");
          const localIds: string[] = localSaved ? JSON.parse(localSaved) : [];
          const merged = await syncLocalFavoritesToUser(user.id, localIds);
          if (merged && merged.length > 0) {
            setFavorites(merged);
            localStorage.setItem("tolet_favorites", JSON.stringify(merged));
          } else {
            const dbIds = await fetchUserFavoriteIds(user.id);
            setFavorites(dbIds);
            localStorage.setItem("tolet_favorites", JSON.stringify(dbIds));
          }
        } catch (e) {
          console.error("Failed to sync favorites on login:", e);
        }
      };
      sync();
    }
  }, [isAuthenticated, user?.id]);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prevFavorites) => {
        const isCurrentlyFav = prevFavorites.includes(id);
        const nextFavorites = isCurrentlyFav
          ? prevFavorites.filter((item) => item !== id)
          : [...prevFavorites, id];

        try {
          localStorage.setItem("tolet_favorites", JSON.stringify(nextFavorites));
        } catch (e) {
          console.error(e);
        }

        if (isAuthenticated && user?.id) {
          if (isCurrentlyFav) {
            removeUserFavorite(user.id, id).then((ok) => {
              if (!ok) {
                setFavorites((prev) => [...prev, id]);
              }
            });
          } else {
            addUserFavorite(user.id, id).then((ok) => {
              if (!ok) {
                setFavorites((prev) => prev.filter((item) => item !== id));
              }
            });
          }
        } else {
          if (!isCurrentlyFav) {
            const isSuppressed =
              localStorage.getItem("tolet_suppress_guest_fav_prompt") === "true";
            if (!isSuppressed && nextFavorites.length >= 2) {
              setIsGuestPromptOpen(true);
            }
          }
        }

        return nextFavorites;
      });
    },
    [isAuthenticated, user?.id]
  );

  const handleClearAllFavorites = useCallback(async () => {
    const prev = [...favorites];
    setFavorites([]);
    localStorage.removeItem("tolet_favorites");

    if (isAuthenticated && user?.id) {
      for (const id of prev) {
        await removeUserFavorite(user.id, id);
      }
    }
  }, [favorites, isAuthenticated, user?.id]);

  const value: FavoritesContextValue = {
    favorites,
    isGuestPromptOpen,
    openGuestPrompt: () => setIsGuestPromptOpen(true),
    closeGuestPrompt: () => setIsGuestPromptOpen(false),
    handleToggleFavorite,
    handleClearAllFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      <GuestFavoritesPromptModal
        isOpen={isGuestPromptOpen}
        onClose={value.closeGuestPrompt}
        onNavigateToLogin={() => navigate("login")}
      />
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
