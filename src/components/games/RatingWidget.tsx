"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

export function RatingWidget({
  gameId,
  initialAvg,
  initialCount,
  isAuthed,
  userRating,
}: {
  gameId: string;
  initialAvg: number;
  initialCount: number;
  isAuthed: boolean;
  userRating: number | null;
}) {
  const router = useRouter();
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState(userRating ?? 0);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);

  async function rate(value: number) {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    setSaving(true);
    setMine(value);
    const res = await fetch(`/api/games/${gameId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const data = await res.json();
      setAvg(data.ratingAvg);
      setCount(data.ratingCount);
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            disabled={saving}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => rate(n)}
            aria-label={`Valorar con ${n} estrellas`}
          >
            <Star
              size={20}
              className={(hover || mine) >= n ? "text-yellow-400 fill-yellow-400" : "text-pv-muted"}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-pv-muted">
        {avg.toFixed(1)} · {count} valoraciones
      </span>
    </div>
  );
}
