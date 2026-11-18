"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderUp, FileArchive, Files, Loader2 } from "lucide-react";

type UploadFile = File & { webkitRelativePath: string };

export default function ImportGamePage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  async function uploadZip(file: File) {
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append("mode", "zip");
    form.append("title", file.name.replace(/\.zip$/i, ""));
    form.append("file", file);
    const res = await fetch("/api/projects/import", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo importar el proyecto.");
      return;
    }
    router.push(`/create/import/${data.project.id}`);
  }

  async function uploadFiles(fileList: FileList) {
    const files = Array.from(fileList) as UploadFile[];
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append("mode", "files");
    form.append("title", "Proyecto web importado");
    const paths = files.map((f) => f.webkitRelativePath || f.name);
    form.append("paths", JSON.stringify(paths));
    for (const f of files) form.append("file", f);
    const res = await fetch("/api/projects/import", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo importar el proyecto.");
      return;
    }
    router.push(`/create/import/${data.project.id}`);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length === 1 && dropped[0].name.toLowerCase().endsWith(".zip")) {
      uploadZip(dropped[0]);
    } else if (dropped.length > 0) {
      const dt = new DataTransfer();
      dropped.forEach((f) => dt.items.add(f));
      uploadFiles(dt.files);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-display font-bold">IMPORT GAME</h1>
      <p className="text-pv-muted text-sm mt-1 mb-6">
        Sube un proyecto que ya hayas creado: un ZIP, archivos HTML/CSS/JS, o una exportación de Unity WebGL o Godot
        HTML5. Detectaremos automáticamente el archivo de inicio.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-pv-purple bg-pv-purple/10" : "border-pv-border"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-pv-muted">
            <Loader2 className="animate-spin" />
            Analizando y procesando tu proyecto...
          </div>
        ) : (
          <>
            <FolderUp size={36} className="mx-auto text-pv-purple2 mb-3" />
            <p className="font-medium">Arrastra tu proyecto aquí</p>
            <p className="text-sm text-pv-muted mt-1">o selecciónalo manualmente</p>
            <div className="flex flex-wrap gap-3 justify-center mt-5">
              <button
                onClick={() => zipInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-pv-border hover:border-pv-purple text-sm"
              >
                <FileArchive size={16} /> Subir ZIP
              </button>
              <button
                onClick={() => filesInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-pv-border hover:border-pv-purple text-sm"
              >
                <Files size={16} /> Subir carpeta / archivos
              </button>
            </div>
          </>
        )}
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadZip(e.target.files[0])}
        />
        <input
          ref={filesInputRef}
          type="file"
          multiple
          // @ts-expect-error -- webkitdirectory is a non-standard but widely supported attribute
          webkitdirectory=""
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

      <div className="mt-8 text-sm text-pv-muted space-y-1">
        <p className="font-semibold text-pv-text">Formatos compatibles:</p>
        <p>ZIP, HTML / HTML5, JavaScript, CSS, proyectos web, Unity WebGL, exportaciones HTML5 de Godot.</p>
      </div>
    </div>
  );
}
