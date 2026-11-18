"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function FollowButton({ username, initialFollowing }: { username: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    if (res.ok) setFollowing((await res.json()).following);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "px-5 py-2 rounded-full text-sm font-semibold border",
        following ? "border-pv-border text-pv-muted hover:text-white" : "pv-btn-primary border-transparent"
      )}
    >
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}
