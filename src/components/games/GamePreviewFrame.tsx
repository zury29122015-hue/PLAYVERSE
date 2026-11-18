"use client";

import { useEffect, useState } from "react";
import { loadGameSrcDoc } from "@/lib/game-srcdoc";

export function GamePreviewFrame({ entryFile }: { entryFile: string }) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGameSrcDoc(entryFile)
      .then((html) => {
        if (!cancelled) setSrcDoc(html);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [entryFile]);

  if (loadError) {
    return (
      <div className="w-full aspect-video rounded-xl bg-pv-panel2 flex items-center justify-center text-pv-muted">
        No se pudo generar una vista previa.
      </div>
    );
  }

  if (!srcDoc) {
    return (
      <div className="w-full aspect-video rounded-xl bg-black flex items-center justify-center text-pv-muted">
        Cargando vista previa...
      </div>
    );
  }

  return (
    <iframe
      srcDoc={srcDoc}
      title="preview"
      sandbox="allow-scripts allow-pointer-lock allow-forms allow-modals allow-downloads"
      className="w-full aspect-video rounded-xl border border-pv-border bg-black"
    />
  );
}
