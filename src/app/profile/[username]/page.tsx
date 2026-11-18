import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { gameCardSelect } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { GameCard } from "@/components/games/GameCard";
import { FollowButton } from "@/components/profile/FollowButton";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const currentUser = await getCurrentUser();

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      role: true,
      _count: { select: { games: true, followers: true, following: true } },
      games: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        select: gameCardSelect,
      },
    },
  });

  if (!user) notFound();

  const isFollowing = currentUser
    ? !!(await db.follow.findUnique({ where: { followerId_followingId: { followerId: currentUser.id, followingId: user.id } } }))
    : false;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-pv-panel2 border border-pv-border flex items-center justify-center text-2xl font-bold overflow-hidden">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            user.username[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold">
            {user.name || user.username}{" "}
            {user.role === "ADMIN" && (
              <span className="text-xs align-middle bg-pv-purple/20 text-pv-purple2 px-2 py-0.5 rounded-full">Admin</span>
            )}
          </h1>
          <p className="text-pv-muted text-sm">@{user.username} · se unió {timeAgo(user.createdAt)}</p>
          {user.bio && <p className="text-sm mt-2 max-w-xl">{user.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm text-pv-muted">
            <span>
              <strong className="text-white">{user._count.games}</strong> juegos
            </span>
            <span>
              <strong className="text-white">{user._count.followers}</strong> seguidores
            </span>
            <span>
              <strong className="text-white">{user._count.following}</strong> siguiendo
            </span>
          </div>
        </div>
        {currentUser && currentUser.id !== user.id && (
          <FollowButton username={user.username} initialFollowing={isFollowing} />
        )}
      </div>

      <h2 className="text-lg font-display font-bold mt-10 mb-4">Videojuegos publicados</h2>
      {user.games.length === 0 ? (
        <p className="text-pv-muted text-sm">Todavía no ha publicado ningún videojuego.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {user.games.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
