import { db } from "@/lib/db";
import { gameCardSelect, safe } from "@/lib/queries";
import { GameCard } from "@/components/games/GameCard";
import { SetupNotice } from "@/components/SetupNotice";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SORTS = [
  { key: "popular", label: "Más jugados" },
  { key: "top", label: "Mejor valorados" },
  { key: "new", label: "Nuevos lanzamientos" },
] as const;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const { q, category, sort } = await searchParams;

  const { data, dbError } = await safe(
    async () => {
      const categories = await db.category.findMany({ orderBy: { order: "asc" } });
      const activeCategory = category ? categories.find((c) => c.slug === category) : undefined;

      const orderBy =
        sort === "top"
          ? [{ ratingAvg: "desc" as const }]
          : sort === "new"
          ? [{ createdAt: "desc" as const }]
          : [{ playCount: "desc" as const }];

      const games = await db.game.findMany({
        where: {
          status: "PUBLISHED",
          categoryId: activeCategory?.id,
          ...(q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" as const } },
                  { description: { contains: q, mode: "insensitive" as const } },
                  { tags: { has: q.toLowerCase() } },
                ],
              }
            : {}),
        },
        orderBy,
        take: 60,
        select: gameCardSelect,
      });
      return { categories, games };
    },
    { categories: [], games: [] }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-bold mb-1">Explorar</h1>
      <p className="text-pv-muted text-sm mb-6">
        {q ? (
          <>Resultados para “{q}”</>
        ) : (
          "Descubre juegos populares, nuevos lanzamientos y mejor valorados de la comunidad."
        )}
      </p>

      {dbError && <SetupNotice />}

      <div className="flex flex-wrap gap-2 mb-4">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={`/explore?${new URLSearchParams({ ...(category ? { category } : {}), ...(q ? { q } : {}), sort: s.key }).toString()}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border",
              sort === s.key ? "bg-pv-purple/20 border-pv-purple text-white" : "border-pv-border text-pv-muted hover:text-white"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pv-scrollbar pb-4 mb-4">
        <Link
          href={`/explore${q ? `?q=${q}` : ""}`}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm border shrink-0",
            !category ? "bg-pv-blue/20 border-pv-blue2 text-white" : "border-pv-border text-pv-muted hover:text-white"
          )}
        >
          Todas
        </Link>
        {data.categories.map((c) => (
          <Link
            key={c.id}
            href={`/explore?category=${c.slug}${q ? `&q=${q}` : ""}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border shrink-0",
              category === c.slug ? "bg-pv-blue/20 border-pv-blue2 text-white" : "border-pv-border text-pv-muted hover:text-white"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {data.games.length === 0 ? (
        <p className="text-pv-muted py-10 text-center">No se encontraron videojuegos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.games.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
