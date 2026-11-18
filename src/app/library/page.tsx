import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { gameCardSelect } from "@/lib/queries";
import { GameCard } from "@/components/games/GameCard";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  CHANGES_REQUESTED: "Cambios solicitados",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  APPROVED: "text-emerald-400 bg-emerald-400/10",
  REJECTED: "text-red-400 bg-red-400/10",
  CHANGES_REQUESTED: "text-orange-400 bg-orange-400/10",
};

export default async function LibraryPage() {
  const user = await requireUser();

  const [favorites, projects, submissions] = await Promise.all([
    db.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { game: { select: gameCardSelect } },
    }),
    db.project.findMany({ where: { ownerId: user.id }, orderBy: { updatedAt: "desc" } }),
    db.gameSubmission.findMany({
      where: { submitterId: user.id },
      orderBy: { createdAt: "desc" },
      include: { game: { select: { slug: true } } },
    }),
  ]);

  const projectHref = (kind: string, id: string) =>
    kind === "CODE" ? `/create/code/${id}` : `/create/import/${id}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <div>
        <h1 className="text-2xl font-display font-bold mb-1">Mi biblioteca</h1>
        <p className="text-pv-muted text-sm">Tus juegos favoritos, proyectos en progreso y envíos a revisión.</p>
      </div>

      <section>
        <h2 className="text-lg font-display font-bold mb-3">Favoritos</h2>
        {favorites.length === 0 ? (
          <p className="text-sm text-pv-muted">Aún no tienes juegos favoritos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favorites.map((f) => (
              <GameCard key={f.id} game={f.game} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold">Mis proyectos</h2>
          <Link href="/create" className="text-sm text-pv-purple2 hover:underline">
            + Crear nuevo
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-pv-muted">No tienes proyectos todavía.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.map((p) => (
              <Link key={p.id} href={projectHref(p.kind, p.id)} className="pv-card rounded-xl p-4 flex items-center justify-between hover:border-pv-purple">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-pv-muted">{p.kind} · editado {timeAgo(p.updatedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-display font-bold mb-3">Envíos a revisión</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-pv-muted">No has enviado ningún videojuego a revisión.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="pv-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs text-pv-muted">Enviado {timeAgo(s.createdAt)}</p>
                  {s.reviewNote && <p className="text-xs text-pv-muted mt-1">Nota: {s.reviewNote}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLOR[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                  {s.game && (
                    <Link href={`/game/${s.game.slug}`} className="text-xs text-pv-purple2 hover:underline">
                      Ver
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
