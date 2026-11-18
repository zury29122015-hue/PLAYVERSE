import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ratingSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Debes iniciar sesión para valorar." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ratingSchema.safeParse({ ...body, gameId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Valoración inválida." }, { status: 400 });
  }

  await db.rating.upsert({
    where: { gameId_userId: { gameId: id, userId: user.id } },
    update: { value: parsed.data.value },
    create: { gameId: id, userId: user.id, value: parsed.data.value },
  });

  const agg = await db.rating.aggregate({ where: { gameId: id }, _avg: { value: true }, _count: true });
  await db.game.update({
    where: { id },
    data: { ratingAvg: agg._avg.value ?? 0, ratingCount: agg._count },
  });

  return NextResponse.json({ ratingAvg: agg._avg.value ?? 0, ratingCount: agg._count });
}
