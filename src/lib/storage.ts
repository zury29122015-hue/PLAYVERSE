import { mkdir, writeFile, rm } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function safeSegment(segment: string) {
  return segment.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/** Saves a single uploaded file (cover image, screenshot, avatar) under /public/uploads/<bucket>/ and returns its public URL. */
export async function saveUploadedFile(bucket: string, file: File): Promise<string> {
  const ext = path.extname(file.name) || "";
  const filename = `${safeSegment(bucket)}-${nanoid(10)}${safeSegment(ext)}`;
  const dir = path.join(UPLOADS_ROOT, bucket);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${bucket}/${filename}`;
}

/** Returns an absolute directory for a game's extracted/imported files, creating it if needed. */
export async function gameDir(gameOrProjectId: string): Promise<{ absPath: string; publicPath: string }> {
  const id = safeSegment(gameOrProjectId);
  const absPath = path.join(UPLOADS_ROOT, "games", id);
  await mkdir(absPath, { recursive: true });
  return { absPath, publicPath: `/uploads/games/${id}` };
}

export async function removeGameDir(gameOrProjectId: string): Promise<void> {
  const id = safeSegment(gameOrProjectId);
  const absPath = path.join(UPLOADS_ROOT, "games", id);
  await rm(absPath, { recursive: true, force: true });
}

export function publicUrlToAbsPath(publicUrl: string): string {
  const rel = publicUrl.replace(/^\/uploads\//, "");
  return path.join(UPLOADS_ROOT, rel);
}
