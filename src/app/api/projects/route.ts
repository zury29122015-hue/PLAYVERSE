import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { z } from "zod";

const createSchema = z.object({
  kind: z.enum(["CODE"]),
  title: z.string().min(1).max(80).default("Sin título"),
  data: z.unknown(),
});

export async function GET(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");

  const projects = await db.project.findMany({
    where: { ownerId: user.id, ...(kind ? { kind: kind as "CODE" | "IMPORT" } : {}) },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, kind: true, updatedAt: true, createdAt: true },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      ownerId: user.id,
      kind: parsed.data.kind,
      title: parsed.data.title,
      data: parsed.data.data as object,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
