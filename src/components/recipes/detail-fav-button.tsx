"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavoriteAction } from "@/actions/favorites";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface DetailFavButtonProps {
  recipeId: string;
  initialFavorited: boolean;
}

export function DetailFavButton({ recipeId, initialFavorited }: DetailFavButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(initialFavorited);

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticFavorited(!optimisticFavorited);
      await toggleFavoriteAction(recipeId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 rounded border px-3 py-1 text-sm transition-colors ${
        optimisticFavorited
          ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          : "border-gray-500 text-gray-400 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {optimisticFavorited ? (
        <HeartSolid className="h-4 w-4" />
      ) : (
        <HeartOutline className="h-4 w-4" />
      )}
      {optimisticFavorited ? "Favorited" : "Favorite"}
    </button>
  );
}
