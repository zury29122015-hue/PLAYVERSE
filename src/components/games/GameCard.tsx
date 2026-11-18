import Link from "next/link";
import { Star, Users } from "lucide-react";

export interface GameCardData {
  slug: string;
  title: string;
  coverImage: string | null;
  ratingAvg: number;
  ratingCount: number;
  playCount: number;
  category?: { name: string } | null;
  creator?: { username: string } | null;
}

export function GameCard({ game }: { game: GameCardData }) {
  return (
    <Link
      href={`/game/${game.slug}`}
      className="group block w-full rounded-xl overflow-hidden pv-card hover:border-pv-purple transition-colors hover:shadow-glow"
    >
      <div className="relative w-full h-32 bg-pv-panel2 overflow-hidden">
        {game.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-pv-muted text-xs">Sin portada</div>
        )}
        {game.category && (
          <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-black/60 px-2 py-0.5 rounded-full">
            {game.category.name}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{game.title}</h3>
        {game.creator && <p className="text-xs text-pv-muted truncate">por @{game.creator.username}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-pv-muted">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            {game.ratingAvg.toFixed(1)} ({game.ratingCount})
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {game.playCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
