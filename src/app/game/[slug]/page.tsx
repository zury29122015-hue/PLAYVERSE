import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { gameCardSelect } from "@/lib/queries";
import { GameFrame } from "@/components/games/GameFrame";
import { RatingWidget } from "@/components/games/RatingWidget";
import { FavoriteButton } from "@/components/games/FavoriteButton";
import { ReportButton } from "@/components/games/ReportButton";
import { CommentSection } from "@/components/games/CommentSection";
import { GameRow } from "@/components/games/GameRow";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const game = await db.game.findUnique({
    where: { slug },
    include: {
      category: true,
      creator: { select: { username: true, avatarUrl: true } },
      comments: {
        where: { hidden: false, parentId: null },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { username: true, avatarUrl: true } } },
      },
    },
  });

  if (!game) notFound();
  if (game.status === "SUSPENDED" && user?.role !== "ADMIN" && user?.id !== game.creatorId) {
    notFound();
  }

  const [favorite, myRating, related] = await Promise.all([
    user ? db.favorite.findUnique({ where: { userId_gameId: { userId: user.id, gameId: game.id } } }) : null,
    user ? db.rating.findUnique({ where: { gameId_userId: { gameId: game.id, userId: user.id } } }) : null,
    db.game.findMany({
      where: { status: "PUBLISHED", categoryId: game.categoryId, id: { not: game.id } },
      take: 10,
      select: gameCardSelect,
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <GameFrame
            kind={game.kind}
            entryFile={game.entryFile}
            coverImage={game.coverImage}
            title={game.title}
            gameId={game.id}
          />

          <div className="mt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-display font-bold">{game.title}</h1>
                <p className="text-sm text-pv-muted">
                  por{" "}
                  <Link href={`/profile/${game.creator.username}`} className="text-pv-purple2 hover:underline">
                    @{game.creator.username}
                  </Link>{" "}
                  · publicado {timeAgo(game.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <FavoriteButton gameId={game.id} initialFavorited={!!favorite} isAuthed={!!user} />
                <ReportButton gameId={game.id} isAuthed={!!user} />
              </div>
            </div>

            <div className="mt-3">
              <RatingWidget
                gameId={game.id}
                initialAvg={game.ratingAvg}
                initialCount={game.ratingCount}
                isAuthed={!!user}
                userRating={myRating?.value ?? null}
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-pv-text/90">{game.description}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {game.category && <Tag>{game.category.name}</Tag>}
              {game.tags.map((t) => (
                <Tag key={t}>#{t}</Tag>
              ))}
            </div>

            {game.screenshots.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pv-scrollbar mt-5 pb-2">
                {game.screenshots.map((s, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={s} alt="" className="h-28 rounded-lg border border-pv-border object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <CommentSection
              gameId={game.id}
              isAuthed={!!user}
              initialComments={game.comments.map((c) => ({
                id: c.id,
                body: c.body,
                createdAt: c.createdAt.toISOString(),
                user: c.user,
              }))}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="pv-card rounded-xl p-4 text-sm space-y-2">
            <h3 className="font-semibold mb-2">Detalles</h3>
            <Row label="Controles" value={game.controls || "No especificado"} />
            <Row label="Edad recomendada" value={game.ageRating} />
            <Row label="Jugadas" value={game.playCount.toLocaleString()} />
          </div>
        </aside>
      </div>

      <GameRow title="Juegos relacionados" games={related} />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-xs bg-pv-panel2 border border-pv-border px-2.5 py-1 rounded-full text-pv-muted">{children}</span>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-pv-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
