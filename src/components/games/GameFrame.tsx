"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { loadGameSrcDoc } from "@/lib/game-srcdoc";

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
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  function registerPlay() {
    fetch(`/api/games/${gameId}/play`, { method: "POST" }).catch(() => {});
  }

  async function play() {
    setStarted(true);
    registerPlay();
    try {
      setSrcDoc(await loadGameSrcDoc(entryFile!));
    } catch {
      setLoadError(true);
    }
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
        onClick={play}
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

  if (loadError) {
    return (
      <div className="w-full aspect-video rounded-xl bg-pv-panel2 flex items-center justify-center text-pv-muted">
        No se pudo cargar el videojuego.
      </div>
    );
  }

  if (!srcDoc) {
    return (
      <div className="w-full aspect-video rounded-xl bg-black flex items-center justify-center text-pv-muted">
        Cargando...
      </div>
    );
  }

  return (
    <iframe
      srcDoc={srcDoc}
      title={title}
      className="w-full aspect-video rounded-xl border border-pv-border bg-black"
      // No allow-same-origin: srcDoc without it gets a unique opaque origin,
      // isolated from this app's cookies/localStorage even though the content
      // is rendered inline rather than navigated to cross-origin.
      sandbox="allow-scripts allow-pointer-lock allow-forms allow-modals allow-downloads"
      allow="gamepad; fullscreen; autoplay"
      allowFullScreen
    />
  );
}
