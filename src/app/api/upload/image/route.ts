import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { saveUploadedFile } from "@/lib/storage";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const bucket = (form?.get("bucket") as string) || "misc";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no soportado" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera 8MB" }, { status: 400 });
  }

  const url = await saveUploadedFile(
    ["covers", "screenshots", "avatars", "sprites"].includes(bucket) ? bucket : "misc",
    file
  );
  return NextResponse.json({ url });
}
