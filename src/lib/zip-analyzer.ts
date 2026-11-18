import AdmZip from "adm-zip";
import path from "path";
import { saveGameFile } from "@/lib/storage";

export type EngineHint = "HTML5" | "UNITY_WEBGL" | "GODOT_HTML5" | "UNKNOWN";

export interface ZipAnalysis {
  ok: boolean;
  error?: string;
  entryFile?: string;
  engineHint: EngineHint;
  fileCount: number;
  totalSize: number;
  topLevelFolder?: string;
  entries: string[];
}

export const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".dll", ".so", ".dylib", ".bat", ".cmd", ".sh", ".app",
  ".msi", ".com", ".scr", ".ps1", ".jar", ".apk", ".deb", ".rpm",
]);

const MAX_FILES = 5000;

/** Analyzes a ZIP buffer, detects the likely game engine/format and the HTML entry point, without writing anything to disk. */
export function analyzeZip(buffer: Buffer, maxTotalSize: number): ZipAnalysis {
  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    return { ok: false, error: "El archivo ZIP está dañado o no es válido.", engineHint: "UNKNOWN", fileCount: 0, totalSize: 0, entries: [] };
  }

  const zipEntries = zip.getEntries().filter((e) => !e.isDirectory);
  if (zipEntries.length === 0) {
    return { ok: false, error: "El ZIP está vacío.", engineHint: "UNKNOWN", fileCount: 0, totalSize: 0, entries: [] };
  }
  if (zipEntries.length > MAX_FILES) {
    return { ok: false, error: `El proyecto tiene demasiados archivos (${zipEntries.length}). Máximo ${MAX_FILES}.`, engineHint: "UNKNOWN", fileCount: zipEntries.length, totalSize: 0, entries: [] };
  }

  let totalSize = 0;
  const entries: string[] = [];
  for (const entry of zipEntries) {
    const name = entry.entryName.replace(/\\/g, "/");
    if (name.includes("..")) {
      return { ok: false, error: "El ZIP contiene rutas inválidas (posible intento de path traversal).", engineHint: "UNKNOWN", fileCount: 0, totalSize: 0, entries: [] };
    }
    const ext = path.extname(name).toLowerCase();
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return { ok: false, error: `Tipo de archivo no permitido por seguridad: ${ext}`, engineHint: "UNKNOWN", fileCount: 0, totalSize: 0, entries: [] };
    }
    totalSize += entry.header.size;
    entries.push(name);
  }

  if (totalSize > maxTotalSize) {
    return { ok: false, error: `El proyecto supera el límite de tamaño permitido (${Math.round(maxTotalSize / 1024 / 1024)}MB).`, engineHint: "UNKNOWN", fileCount: entries.length, totalSize, entries: [] };
  }

  const detected = detectEntryAndEngine(entries);
  if (!detected.entryFile) {
    return {
      ok: false,
      error: "No se encontró un archivo HTML de inicio (index.html). Asegúrate de incluir uno en tu proyecto.",
      engineHint: detected.engineHint,
      fileCount: entries.length,
      totalSize,
      topLevelFolder: detected.topLevelFolder,
      entries,
    };
  }

  return {
    ok: true,
    entryFile: detected.entryFile,
    engineHint: detected.engineHint,
    fileCount: entries.length,
    totalSize,
    topLevelFolder: detected.topLevelFolder,
    entries,
  };
}

/** Shared detection logic for a flat list of relative file paths (used for both ZIP contents and direct multi-file uploads). */
export function detectEntryAndEngine(entries: string[]): { entryFile?: string; engineHint: EngineHint; topLevelFolder?: string } {
  const firstSegments = new Set(entries.map((e) => e.split("/")[0]));
  const topLevelFolder = entries.every((e) => e.includes("/")) && firstSegments.size === 1
    ? [...firstSegments][0]
    : undefined;

  const htmlFiles = entries.filter((e) => e.toLowerCase().endsWith(".html") || e.toLowerCase().endsWith(".htm"));

  const findRelative = (name: string) =>
    htmlFiles.find((f) => f === name || f === `${topLevelFolder}/${name}`);

  let entryFile =
    findRelative("index.html") ??
    findRelative("Index.html") ??
    htmlFiles.find((f) => f.toLowerCase().split("/").pop() === "index.html") ??
    (htmlFiles.length === 1 ? htmlFiles[0] : undefined);

  const hasUnityMarkers = entries.some((e) => /\/?Build\/.+\.(wasm|data|framework\.js)$/i.test(e)) ||
    entries.some((e) => /TemplateData\//i.test(e));
  const hasGodotMarkers = entries.some((e) => e.toLowerCase().endsWith(".pck"));

  let engineHint: EngineHint = "HTML5";
  if (hasUnityMarkers) engineHint = "UNITY_WEBGL";
  else if (hasGodotMarkers) engineHint = "GODOT_HTML5";

  if (!entryFile && htmlFiles.length > 1) {
    entryFile = htmlFiles.sort((a, b) => a.split("/").length - b.split("/").length)[0];
  }

  return { entryFile, engineHint, topLevelFolder };
}

/** Extracts a validated ZIP buffer into game storage (local disk or Blob), preserving relative paths. Call only after analyzeZip() returned ok:true. Returns the public URL of each written file, keyed by its relative path. */
export async function extractZipToDir(buffer: Buffer, gameOrProjectId: string): Promise<Record<string, string>> {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries().filter((e) => !e.isDirectory);
  const urls: Record<string, string> = {};
  for (const entry of entries) {
    const relName = entry.entryName.replace(/\\/g, "/");
    if (relName.includes("..")) {
      throw new Error("Blocked path traversal during extraction");
    }
    const ext = path.extname(relName).toLowerCase();
    const contentType = ext === ".html" || ext === ".htm" ? "text/html; charset=utf-8" : undefined;
    urls[relName] = await saveGameFile(gameOrProjectId, relName, entry.getData(), contentType);
  }
  return urls;
}
