import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const gameCardSelect = {
  slug: true,
  title: true,
  coverImage: true,
  ratingAvg: true,
  ratingCount: true,
  playCount: true,
  category: { select: { name: true } },
  creator: { select: { username: true } },
} satisfies Prisma.GameSelect;

export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<{ data: T; dbError: boolean }> {
  try {
    const data = await fn();
    return { data, dbError: false };
  } catch (err) {
    console.error("[db]", err);
    return { data: fallback, dbError: true };
  }
}

export async function getHomeData() {
  return safe(
    async () => {
      const [categories, popular, recent, topRated, featured] = await Promise.all([
        db.category.findMany({ orderBy: { order: "asc" } }),
        db.game.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { playCount: "desc" },
          take: 12,
          select: gameCardSelect,
        }),
        db.game.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: gameCardSelect,
        }),
        db.game.findMany({
          where: { status: "PUBLISHED", ratingCount: { gt: 0 } },
          orderBy: { ratingAvg: "desc" },
          take: 12,
          select: gameCardSelect,
        }),
        db.game.findMany({
          where: { status: "PUBLISHED" },
          orderBy: [{ ratingAvg: "desc" }, { playCount: "desc" }],
          take: 5,
          select: { ...gameCardSelect, description: true },
        }),
      ]);
      // "Recommended" = recent shuffled lightly with top rated, cheap heuristic for an MVP
      const recommended = [...recent].sort(() => Math.random() - 0.5).slice(0, 12);
      return { categories, popular, recent, topRated, featured, recommended };
    },
    { categories: [], popular: [], recent: [], topRated: [], featured: [], recommended: [] }
  );
}
