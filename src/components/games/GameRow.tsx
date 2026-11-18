import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GameCard, type GameCardData } from "@/components/games/GameCard";

export function GameRow({
  title,
  games,
  seeAllHref,
}: {
  title: string;
  games: GameCardData[];
  seeAllHref?: string;
}) {
  if (games.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-display font-bold">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm text-pv-muted hover:text-white flex items-center gap-1">
            Ver todos <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pv-scrollbar pb-2">
        {games.map((g) => (
          <div key={g.slug} className="w-56 shrink-0">
            <GameCard game={g} />
          </div>
        ))}
      </div>
    </section>
  );
}
