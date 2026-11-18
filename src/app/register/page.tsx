"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", name: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "No se pudo crear la cuenta.");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      setLoading(false);
      if (signInRes?.error) {
        router.push("/login");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="flex items-center gap-2 justify-center mb-6">
        <Gamepad2 className="text-pv-purple2" />
        <span className="font-display font-bold text-xl pv-gradient-text">PLAYVERSE</span>
      </div>
      <div className="pv-card rounded-2xl p-6">
        <h1 className="text-xl font-display font-bold mb-4">Crea tu cuenta</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Nombre de usuario" value={form.username} onChange={(v) => setForm({ ...form, username: v })} required />
          <Field label="Nombre para mostrar" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Correo electrónico" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field
            label="Contraseña (mín. 8 caracteres)"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="pv-btn-primary w-full py-2.5 rounded-full font-semibold disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>
        <p className="text-sm text-pv-muted mt-4 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-pv-purple2 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-pv-muted">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-pv-panel2 border border-pv-border rounded-lg px-3 py-2 focus:outline-none focus:border-pv-purple"
      />
    </label>
  );
}
