import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { reportSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Debes iniciar sesión para reportar." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse({ ...body, gameId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Reporte inválido." }, { status: 400 });
  }

  await db.report.create({
    data: {
      gameId: id,
      reporterId: user.id,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
