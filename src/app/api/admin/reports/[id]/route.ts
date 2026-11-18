import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { z } from "zod";

const schema = z.object({ status: z.enum(["RESOLVED", "DISMISSED"]), suspendGame: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const report = await db.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await db.report.update({ where: { id }, data: { status: parsed.data.status } });

  if (parsed.data.suspendGame && report.gameId) {
    await db.game.update({ where: { id: report.gameId }, data: { status: "SUSPENDED" } });
  }

  return NextResponse.json({ ok: true });
}
