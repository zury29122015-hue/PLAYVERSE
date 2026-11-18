import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { CodeStudio } from "@/components/code-studio/CodeStudio";
import type { CodeProjectData } from "@/lib/code-studio-defaults";

export const dynamic = "force-dynamic";

export default async function CodeStudioEditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== user.id || project.kind !== "CODE") notFound();

  return (
    <CodeStudio
      projectId={project.id}
      initialTitle={project.title}
      initialData={project.data as unknown as CodeProjectData}
    />
  );
}
