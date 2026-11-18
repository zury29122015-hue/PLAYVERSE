"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  gameId,
  initialFavorited,
  isAuthed,
}: {
  gameId: string;
  initialFavorited: boolean;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/games/${gameId}/favorite`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors",
        favorited ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-pv-border text-pv-muted hover:text-white"
      )}
    >
      <Heart size={16} className={favorited ? "fill-pink-500" : ""} />
      {favorited ? "En favoritos" : "Favorito"}
    </button>
  );
}
