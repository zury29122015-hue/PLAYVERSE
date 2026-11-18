"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function GameFrame({
  kind,
  entryFile,
  coverImage,
  title,
  gameId,
}: {
  kind: "IMPORT" | "CODE";
  entryFile: string | null;
  coverImage: string | null;
  title: string;
  gameId: string;
}) {
  const [started, setStarted] = useState(false);

  function registerPlay() {
    fetch(`/api/games/${gameId}/play`, { method: "POST" }).catch(() => {});
  }

  if (!entryFile) {
    return (
      <div className="w-full aspect-video rounded-xl bg-pv-panel2 flex items-center justify-center text-pv-muted">
        Este videojuego no tiene un archivo ejecutable válido.
      </div>
    );
  }

  if (!started) {
    return (
      <button
        onClick={() => {
          setStarted(true);
          registerPlay();
        }}
        className="relative w-full aspect-video rounded-xl overflow-hidden group border border-pv-border"
      >
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-pv-panel2" />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
          <span className="w-16 h-16 rounded-full pv-btn-primary flex items-center justify-center shadow-glow">
            <Play size={28} className="ml-1" />
          </span>
        </div>
      </button>
    );
  }

  return (
    <iframe
      src={entryFile}
      title={title}
      className="w-full aspect-video rounded-xl border border-pv-border bg-black"
      // allow-same-origin is required for Chrome to render a sandboxed same-origin
      // document at all; the server's own CSP (see next.config.ts) forces this
      // content into an opaque origin anyway, so cookies/localStorage stay inaccessible.
      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
      allow="gamepad; fullscreen; autoplay"
      allowFullScreen
    />
  );
}
