"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export function SubmissionForm({ projectId, onDone }: { projectId: string; onDone?: () => void }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [genre, setGenre] = useState("");
  const [controls, setControls] = useState("");
  const [ageRating, setAgeRating] = useState("Everyone");
  const [tagsInput, setTagsInput] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  async function uploadImage(file: File, bucket: "covers" | "screenshots") {
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);
    const res = await fetch("/api/upload/image", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");
    return data.url as string;
  }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setCoverImage(await uploadImage(file, "covers"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
    setUploading(false);
  }

  async function handleScreenshots(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - screenshots.length);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f, "screenshots")));
      setScreenshots((prev) => [...prev, ...urls].slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        title,
        description,
        categoryId: categoryId || null,
        genre: genre || null,
        controls: controls || null,
        ageRating,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 10),
        creatorName: creatorName || null,
        coverImage,
        screenshots,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar a revisión.");
      return;
    }
    setDone(true);
    onDone?.();
  }

  if (done) {
    return (
      <div className="pv-card rounded-xl p-6 text-center">
        <h3 className="font-display font-bold text-lg text-emerald-400 mb-2">¡Enviado a revisión!</h3>
        <p className="text-sm text-pv-muted mb-4">
          Un administrador revisará tu videojuego pronto. Te notificaremos cuando sea aprobado o si necesita cambios.
        </p>
        <button onClick={() => router.push("/library")} className="pv-btn-primary px-5 py-2 rounded-full text-sm font-semibold">
          Ir a mi biblioteca
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nombre del videojuego" required>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="pv-input"
          maxLength={80}
        />
      </Field>
      <Field label="Descripción" required>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="pv-input h-24"
          maxLength={4000}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Categoría">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="pv-input">
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Género">
          <input value={genre} onChange={(e) => setGenre(e.target.value)} className="pv-input" placeholder="Ej. Plataformas 2D" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Controles">
          <input
            value={controls}
            onChange={(e) => setControls(e.target.value)}
            className="pv-input"
            placeholder="WASD para moverse, Espacio para saltar"
          />
        </Field>
        <Field label="Edad recomendada">
          <select value={ageRating} onChange={(e) => setAgeRating(e.target.value)} className="pv-input">
            <option>Everyone</option>
            <option>10+</option>
            <option>13+</option>
            <option>16+</option>
            <option>18+</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Etiquetas (separadas por coma)">
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="pv-input" placeholder="retro, pixel-art" />
        </Field>
        <Field label="Nombre del creador">
          <input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} className="pv-input" placeholder="Opcional" />
        </Field>
      </div>

      <Field label="Imagen de portada">
        <label className="flex items-center gap-3 cursor-pointer pv-input !flex">
          <UploadCloud size={16} />
          <span className="text-sm text-pv-muted">{coverImage ? "Cambiar portada" : "Subir imagen"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
        </label>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="mt-2 h-24 rounded-lg object-cover border border-pv-border" />
        )}
      </Field>

      <Field label="Capturas de pantalla (máx. 6)">
        <label className="flex items-center gap-3 cursor-pointer pv-input !flex">
          <UploadCloud size={16} />
          <span className="text-sm text-pv-muted">Subir capturas</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshots} />
        </label>
        {screenshots.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {screenshots.map((s, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s} alt="" className="h-20 rounded-lg object-cover border border-pv-border" />
                <button
                  type="button"
                  onClick={() => setScreenshots((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 bg-black/80 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="pv-btn-primary w-full py-3 rounded-full font-semibold disabled:opacity-60"
      >
        {submitting ? "Enviando..." : "ENVIAR A REVISIÓN"}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-pv-muted">
        {label} {required && <span className="text-pv-purple2">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
