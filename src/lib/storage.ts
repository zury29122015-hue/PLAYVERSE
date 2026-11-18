import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { put } from "@vercel/blob";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

// Vercel's filesystem is read-only at runtime (no persistent disk), so uploads
// there must go to Vercel Blob instead. Locally (no token configured) we keep
// writing to public/uploads so development needs no extra setup.
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

function safeSegment(segment: string) {
  return segment.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/** Saves a single uploaded file (cover image, screenshot, avatar, sprite) and returns its public URL. */
export async function saveUploadedFile(bucket: string, file: File): Promise<string> {
  const ext = path.extname(file.name) || "";
  const filename = `${safeSegment(bucket)}-${nanoid(10)}${safeSegment(ext)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (useBlob) {
    const blob = await put(`${bucket}/${filename}`, buffer, {
      access: "public",
      contentType: file.type || undefined,
    });
    return blob.url;
  }

  const dir = path.join(UPLOADS_ROOT, bucket);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${bucket}/${filename}`;
}

/** Saves one file belonging to an imported/authored game (entry HTML, assets) at a stable relative path and returns its public URL. */
export async function saveGameFile(
  gameOrProjectId: string,
  relPath: string,
  data: Buffer | string,
  contentType?: string
): Promise<string> {
  const id = safeSegment(gameOrProjectId);
  const cleanRel = relPath.replace(/\\/g, "/");

  if (useBlob) {
    const blob = await put(`games/${id}/${cleanRel}`, data, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  const absPath = path.join(UPLOADS_ROOT, "games", id, cleanRel);
  if (!path.resolve(absPath).startsWith(path.resolve(UPLOADS_ROOT, "games", id))) {
    throw new Error("Invalid relative path");
  }
  await mkdir(path.dirname(absPath), { recursive: true });
  await writeFile(absPath, data);
  return `/uploads/games/${id}/${cleanRel}`;
}
