import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.game.update({ where: { id }, data: { playCount: { increment: 1 } } });
  } catch {
    // game not found or db unavailable — non-critical, ignore
  }
  return NextResponse.json({ ok: true });
}
