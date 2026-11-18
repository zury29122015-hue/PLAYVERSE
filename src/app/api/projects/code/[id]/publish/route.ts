import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { saveGameFile } from "@/lib/storage";
import { buildPreviewHtml, type CodeProjectData } from "@/lib/code-studio-defaults";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const project = await db.project.findUnique({ where: { id } });
  if (!project || project.ownerId !== user.id || project.kind !== "CODE") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const codeData = project.data as unknown as CodeProjectData;
  const html = buildPreviewHtml(codeData.files, "index.html");
  const entryFile = await saveGameFile(project.id, "index.html", html, "text/html; charset=utf-8");

  await db.project.update({ where: { id }, data: { entryFile } });

  return NextResponse.json({ entryFile });
}
