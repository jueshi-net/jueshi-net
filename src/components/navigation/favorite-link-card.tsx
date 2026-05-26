"use client";

import LinkCard from "@/components/navigation/link-card";
import HighlightText from "@/components/navigation/highlight-text";
import { useState } from "react";

interface FavoriteLinkCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  url: string;
  color?: string;
  initialFav?: boolean;
  highlightKeyword?: string;
}

export default function FavoriteLinkCard({
  id,
  title,
  description,
  icon,
  url,
  color,
  initialFav,
  highlightKeyword,
}: FavoriteLinkCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFav || false);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (linkId: string) => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFavorite) {
        await fetch(`/api/favorites?linkId=${linkId}`, { method: "DELETE" });
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkId }),
        });
        const data = await res.json();
        if (!data.success) {
          setIsFavorite((prev) => !prev); // revert on failure
        }
      }
      setIsFavorite((prev) => !prev);
    } catch {
      setIsFavorite((prev) => !prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinkCard
      link={{
        id,
        title,
        description: description || undefined,
        icon: icon || "globe",
        url,
        color: color || "blue",
      }}
      isFavorite={isFavorite}
      onToggleFavorite={toggleFavorite}
      showFavorite
      highlightKeyword={highlightKeyword}
    />
  );
}
