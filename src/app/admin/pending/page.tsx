import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { PendingCard } from "@/components/admin/PendingCard";

export const dynamic = "force-dynamic";

export default async function AdminPendingPage() {
  const submissions = await db.gameSubmission.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { submitter: { select: { username: true } }, project: { select: { kind: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold mb-2">PENDING GAMES</h1>
      <AdminNav />
      {submissions.length === 0 ? (
        <p className="text-pv-muted text-sm">No hay videojuegos pendientes de revisión.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <PendingCard
              key={s.id}
              submission={{
                id: s.id,
                title: s.title,
                description: s.description,
                coverImage: s.coverImage,
                entryFile: s.entryFile,
                createdAt: s.createdAt.toISOString(),
                submitter: s.submitter,
                project: s.project,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
