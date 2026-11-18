"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(
        res.error === "ACCOUNT_SUSPENDED"
          ? "Tu cuenta ha sido suspendida."
          : "Correo o contraseña incorrectos."
      );
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="flex items-center gap-2 justify-center mb-6">
        <Gamepad2 className="text-pv-purple2" />
        <span className="font-display font-bold text-xl pv-gradient-text">PLAYVERSE</span>
      </div>
      <div className="pv-card rounded-2xl p-6">
        <h1 className="text-xl font-display font-bold mb-4">Inicia sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Correo electrónico" type="email" value={email} onChange={setEmail} required />
          <Field label="Contraseña" type="password" value={password} onChange={setPassword} required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="pv-btn-primary w-full py-2.5 rounded-full font-semibold disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-sm text-pv-muted mt-4 text-center">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-pv-purple2 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
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
