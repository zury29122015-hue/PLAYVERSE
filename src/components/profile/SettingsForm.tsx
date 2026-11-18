"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

export function SettingsForm({
  initial,
}: {
  initial: { name: string | null; bio: string | null; avatarUrl: string | null; username: string; email: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", "avatars");
    const res = await fetch("/api/upload/image", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) setAvatarUrl(data.url);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, avatarUrl }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="pv-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-pv-panel2 overflow-hidden border border-pv-border flex items-center justify-center">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            initial.username[0]?.toUpperCase()
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-pv-muted hover:text-white cursor-pointer">
          <UploadCloud size={16} /> Cambiar avatar
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </label>
      </div>

      <Field label="Nombre para mostrar">
        <input value={name} onChange={(e) => setName(e.target.value)} className="pv-input" />
      </Field>
      <Field label="Biografía">
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="pv-input h-24" maxLength={400} />
      </Field>
      <Field label="Usuario">
        <input value={`@${initial.username}`} disabled className="pv-input opacity-60" />
      </Field>
      <Field label="Correo">
        <input value={initial.email} disabled className="pv-input opacity-60" />
      </Field>

      <button onClick={save} disabled={saving} className="pv-btn-primary w-full py-2.5 rounded-full font-semibold disabled:opacity-60">
        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-pv-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
