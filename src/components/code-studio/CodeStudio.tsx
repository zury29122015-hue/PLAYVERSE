"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import { Maximize2, Play, Plus, Save, Send, Trash2, X } from "lucide-react";
import { languageForFile, buildPreviewHtml, type CodeProjectData } from "@/lib/code-studio-defaults";
import { SubmissionForm } from "@/components/create/SubmissionForm";

interface ConsoleEntry {
  level: string;
  text: string;
  ts: number;
}

export function CodeStudio({
  projectId,
  initialTitle,
  initialData,
}: {
  projectId: string;
  initialTitle: string;
  initialData: CodeProjectData;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [files, setFiles] = useState<Record<string, string>>(initialData.files);
  const [activeFile, setActiveFile] = useState(initialData.activeFile || Object.keys(initialData.files)[0]);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saved");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);

  // @monaco-editor/react's automaticLayout can mis-measure its container on first
  // mount inside a CSS grid (it ends up the width of the line-number gutter only).
  // Force a real layout() pass whenever the container is actually resized.
  useEffect(() => {
    const el = editorContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      editorRef.current?.layout();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const save = useCallback(
    (nextFiles: Record<string, string>, nextTitle: string, nextActive: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveState("dirty");
      saveTimer.current = setTimeout(async () => {
        setSaveState("saving");
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextTitle, data: { files: nextFiles, activeFile: nextActive } }),
        });
        setSaveState("saved");
      }, 1000);
    },
    [projectId]
  );

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.source !== "playverse-console") return;
      setLogs((prev) => [...prev, { level: e.data.level, text: e.data.args.join(" "), ts: Date.now() }].slice(-200));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function updateFile(name: string, content: string) {
    const next = { ...files, [name]: content };
    setFiles(next);
    save(next, title, activeFile);
  }

  function addFile() {
    const name = prompt("Nombre del nuevo archivo (ej. utils.js):");
    if (!name || files[name]) return;
    const next = { ...files, [name]: "" };
    setFiles(next);
    setActiveFile(name);
    save(next, title, name);
  }

  function deleteFile(name: string) {
    if (Object.keys(files).length <= 1) return;
    if (!confirm(`¿Eliminar ${name}?`)) return;
    const next = { ...files };
    delete next[name];
    setFiles(next);
    const nextActive = activeFile === name ? Object.keys(next)[0] : activeFile;
    setActiveFile(nextActive);
    save(next, title, nextActive);
  }

  function run() {
    setLogs([]);
    setPreviewHtml(buildPreviewHtml(files, "index.html"));
  }

  function toggleFullscreen() {
    previewFrameRef.current?.requestFullscreen?.();
  }

  async function openSubmit() {
    setPublishing(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, data: { files, activeFile } }),
    });
    await fetch(`/api/projects/code/${projectId}/publish`, { method: "POST" });
    setSaveState("saved");
    setPublishing(false);
    setSubmitOpen(true);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#05040a]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-pv-border bg-pv-panel">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            save(files, e.target.value, activeFile);
          }}
          className="bg-transparent font-display font-semibold text-sm focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-pv-muted">
            {saveState === "saved" ? "Guardado" : saveState === "saving" ? "Guardando..." : "Sin guardar"}
          </span>
          <button onClick={run} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-sm font-medium">
            <Play size={14} /> RUN
          </button>
          <button
            onClick={openSubmit}
            disabled={publishing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full pv-btn-primary text-sm font-medium disabled:opacity-60"
          >
            <Send size={14} /> SUBMIT GAME
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[minmax(120px,140px)_minmax(280px,1fr)_minmax(320px,480px)] min-h-0 overflow-x-auto">
        {/* File explorer */}
        <div className="border-r border-pv-border bg-[#0a0814] overflow-y-auto pv-scrollbar">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-pv-muted uppercase tracking-wide">
            Archivos
            <button onClick={addFile} className="hover:text-white">
              <Plus size={14} />
            </button>
          </div>
          {Object.keys(files).map((name) => (
            <div
              key={name}
              className={`group flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer ${
                activeFile === name ? "bg-pv-purple/20 text-white" : "text-pv-muted hover:bg-pv-panel2"
              }`}
              onClick={() => setActiveFile(name)}
            >
              <span className="truncate font-mono text-xs">{name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(name);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div ref={editorContainerRef} className="min-w-0 min-h-0 h-full">
          <Editor
            key={activeFile}
            height="100%"
            theme="vs-dark"
            language={languageForFile(activeFile)}
            value={files[activeFile] ?? ""}
            onMount={(editorInstance) => {
              editorRef.current = editorInstance;
              editorInstance.layout();
            }}
            onChange={(value) => updateFile(activeFile, value ?? "")}
            options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>

        {/* Preview + console */}
        <div className="border-l border-pv-border flex flex-col min-h-0">
          <div className="flex-1 bg-black min-h-0 relative">
            {previewHtml ? (
              <>
                <iframe
                  ref={previewFrameRef}
                  title="preview"
                  srcDoc={previewHtml}
                  sandbox="allow-scripts allow-pointer-lock allow-forms allow-modals allow-downloads"
                  className="w-full h-full"
                />
                <button
                  onClick={toggleFullscreen}
                  title="Pantalla completa"
                  className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg hover:bg-black/80"
                >
                  <Maximize2 size={14} />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pv-muted text-sm">
                Presiona RUN para ver tu juego
              </div>
            )}
          </div>
          <div className="h-40 border-t border-pv-border bg-[#05040a] overflow-y-auto pv-scrollbar font-mono text-xs p-2">
            {logs.length === 0 && <p className="text-pv-muted">Consola — sin mensajes aún.</p>}
            {logs.map((l, i) => (
              <p key={i} className={l.level === "error" ? "text-red-400" : l.level === "warn" ? "text-yellow-400" : "text-emerald-400"}>
                &gt; {l.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {submitOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSubmitOpen(false)}>
          <div className="pv-card rounded-2xl p-6 w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg">Enviar videojuego a revisión</h3>
              <button onClick={() => setSubmitOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <SubmissionForm projectId={projectId} />
          </div>
        </div>
      )}
    </div>
  );
}
