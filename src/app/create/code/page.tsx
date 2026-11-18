"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Plus, Trash2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { createDefaultCodeProject } from "@/lib/code-studio-defaults";

interface ProjectSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export default function CodeStudioListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/projects?kind=CODE")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function createProject() {
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "CODE", title: "Nuevo proyecto", data: createDefaultCodeProject() }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) router.push(`/create/code/${data.project.id}`);
  }

  async function removeProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">CODE STUDIO</h1>
          <p className="text-pv-muted text-sm">Programa tu videojuego con HTML, CSS y JavaScript.</p>
        </div>
        <button
          onClick={createProject}
          disabled={creating}
          className="pv-btn-primary px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo proyecto
        </button>
      </div>

      {loading ? (
        <p className="text-pv-muted">Cargando...</p>
      ) : projects.length === 0 ? (
        <div className="pv-card rounded-xl p-10 text-center text-pv-muted">
          <Code2 className="mx-auto mb-3" />
          No tienes proyectos de código todavía.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {projects.map((p) => (
            <div key={p.id} className="pv-card rounded-xl p-4 flex items-center justify-between">
              <button onClick={() => router.push(`/create/code/${p.id}`)} className="text-left flex-1">
                <p className="font-semibold">{p.title}</p>
                <p className="text-xs text-pv-muted">Editado {timeAgo(p.updatedAt)}</p>
              </button>
              <button onClick={() => removeProject(p.id)} className="p-2 text-pv-muted hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
