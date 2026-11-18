import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { GameFrame } from "@/components/games/GameFrame";
import { PendingCard } from "@/components/admin/PendingCard";

export const dynamic = "force-dynamic";

export default async function AdminPendingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await db.gameSubmission.findUnique({
    where: { id },
    include: { submitter: { select: { username: true, email: true } }, project: { select: { kind: true } } },
  });
  if (!submission) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <h1 className="text-xl font-display font-bold mb-3">{submission.title}</h1>
        <GameFrame
          kind={submission.project.kind}
          entryFile={submission.entryFile}
          coverImage={submission.coverImage}
          title={submission.title}
          gameId={submission.id}
        />
        <p className="text-sm mt-4 whitespace-pre-line">{submission.description}</p>

        {submission.screenshots.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pv-scrollbar mt-4">
            {submission.screenshots.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={s} alt="" className="h-28 rounded-lg border border-pv-border object-cover" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="pv-card rounded-xl p-4 text-sm space-y-2">
          <Row label="Creador" value={`@${submission.submitter.username}`} />
          <Row label="Correo" value={submission.submitter.email} />
          <Row label="Género" value={submission.genre || "—"} />
          <Row label="Controles" value={submission.controls || "—"} />
          <Row label="Edad" value={submission.ageRating} />
          <Row label="Etiquetas" value={submission.tags.join(", ") || "—"} />
        </div>

        <PendingCard
          submission={{
            id: submission.id,
            title: submission.title,
            description: submission.description,
            coverImage: submission.coverImage,
            entryFile: submission.entryFile,
            createdAt: submission.createdAt.toISOString(),
            submitter: submission.submitter,
            project: submission.project,
          }}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-pv-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
