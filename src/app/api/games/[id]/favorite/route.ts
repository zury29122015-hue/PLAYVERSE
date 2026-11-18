import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const existing = await db.favorite.findUnique({ where: { userId_gameId: { userId: user.id, gameId: id } } });
    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }
    await db.favorite.create({ data: { userId: user.id, gameId: id } });
    return NextResponse.json({ favorited: true });
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
}
