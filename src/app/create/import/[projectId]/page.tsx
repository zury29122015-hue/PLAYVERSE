import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { SubmissionForm } from "@/components/create/SubmissionForm";

export const dynamic = "force-dynamic";

export default async function ImportReviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== user.id || project.kind !== "IMPORT") notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-xl font-display font-bold mb-3">Previsualiza tu videojuego</h1>
        {project.entryFile ? (
          <iframe
            src={project.entryFile}
            title="preview"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
            className="w-full aspect-video rounded-xl border border-pv-border bg-black"
          />
        ) : (
          <div className="w-full aspect-video rounded-xl bg-pv-panel2 flex items-center justify-center text-pv-muted">
            No se pudo generar una vista previa.
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-display font-bold mb-3">Completa la información</h2>
        <SubmissionForm projectId={project.id} />
      </div>
    </div>
  );
}
