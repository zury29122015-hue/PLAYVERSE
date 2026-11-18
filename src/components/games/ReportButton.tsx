"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useRouter } from "next/navigation";

const REASONS = ["Contenido inapropiado", "No funciona", "Spam o engañoso", "Infringe derechos de autor", "Otro"];

export function ReportButton({ gameId, isAuthed }: { gameId: string; isAuthed: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    await fetch(`/api/games/${gameId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, details }),
    });
    setSent(true);
    setTimeout(() => setOpen(false), 1500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-pv-border text-sm text-pv-muted hover:text-white"
      >
        <Flag size={16} /> Reportar
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="pv-card rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <p className="text-emerald-400 text-sm">Gracias, tu reporte fue enviado.</p>
            ) : (
              <>
                <h3 className="font-display font-bold mb-3">Reportar videojuego</h3>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-pv-panel2 border border-pv-border rounded-lg px-3 py-2 text-sm mb-3"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Detalles (opcional)"
                  className="w-full bg-pv-panel2 border border-pv-border rounded-lg px-3 py-2 text-sm mb-3 h-20"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-full text-sm text-pv-muted">
                    Cancelar
                  </button>
                  <button onClick={submit} className="pv-btn-primary px-4 py-2 rounded-full text-sm font-semibold">
                    Enviar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
