import { NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { gameDir } from "@/lib/storage";
import { analyzeZip, extractZipToDir, detectEntryAndEngine, BLOCKED_EXTENSIONS } from "@/lib/zip-analyzer";

const MAX_SIZE = Number(process.env.MAX_UPLOAD_SIZE_BYTES ?? 200 * 1024 * 1024);

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Formulario inválido" }, { status: 400 });

  const mode = form.get("mode");
  const title = (form.get("title") as string) || "Proyecto importado";

  const project = await db.project.create({
    data: { ownerId: user.id, kind: "IMPORT", title, data: {} },
  });
  const { absPath, publicPath } = await gameDir(project.id);

  try {
    if (mode === "zip") {
      const file = form.get("file");
      if (!(file instanceof File)) throw new Error("Archivo ZIP requerido.");
      if (file.size > MAX_SIZE) throw new Error(`El archivo supera el límite de ${Math.round(MAX_SIZE / 1024 / 1024)}MB.`);
      const buffer = Buffer.from(await file.arrayBuffer());
      const analysis = analyzeZip(buffer, MAX_SIZE);
      if (!analysis.ok) throw new Error(analysis.error);
      await extractZipToDir(buffer, absPath);

      await db.project.update({
        where: { id: project.id },
        data: { entryFile: `${publicPath}/${analysis.entryFile}`, data: { engineHint: analysis.engineHint, fileCount: analysis.fileCount } },
      });
    } else if (mode === "files") {
      const files = form.getAll("file") as unknown[];
      const relPaths = JSON.parse((form.get("paths") as string) || "[]") as string[];
      if (files.length === 0) throw new Error("Selecciona al menos un archivo.");

      let totalSize = 0;
      const writtenPaths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!(f instanceof File)) continue;
        const rel = (relPaths[i] || f.name).replace(/\\/g, "/").replace(/^\/+/, "");
        if (rel.includes("..")) throw new Error("Ruta de archivo inválida.");
        const ext = path.extname(rel).toLowerCase();
        if (BLOCKED_EXTENSIONS.has(ext)) throw new Error(`Tipo de archivo no permitido por seguridad: ${ext}`);
        totalSize += f.size;
        if (totalSize > MAX_SIZE) throw new Error(`El proyecto supera el límite de ${Math.round(MAX_SIZE / 1024 / 1024)}MB.`);

        const dest = path.join(absPath, rel);
        if (!path.resolve(dest).startsWith(path.resolve(absPath))) throw new Error("Ruta de archivo inválida.");
        await mkdir(path.dirname(dest), { recursive: true });
        await writeFile(dest, Buffer.from(await f.arrayBuffer()));
        writtenPaths.push(rel);
      }

      const detected = detectEntryAndEngine(writtenPaths);
      if (!detected.entryFile) {
        throw new Error("No se encontró un archivo HTML de inicio (index.html) entre los archivos subidos.");
      }

      await db.project.update({
        where: { id: project.id },
        data: {
          entryFile: `${publicPath}/${detected.entryFile}`,
          data: { engineHint: detected.engineHint, fileCount: writtenPaths.length },
        },
      });
    } else {
      throw new Error("Modo de carga no reconocido.");
    }
  } catch (err) {
    await db.project.delete({ where: { id: project.id } }).catch(() => {});
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al procesar el archivo." }, { status: 400 });
  }

  const finalProject = await db.project.findUnique({ where: { id: project.id } });
  return NextResponse.json({ project: finalProject }, { status: 201 });
}
