import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { z } from "zod";

const schema = z.object({
  name: z.string().max(60).optional(),
  bio: z.string().max(400).optional(),
  avatarUrl: z.string().optional(),
});

export async function PATCH(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const updated = await db.user.update({ where: { id: user.id }, data: parsed.data });
  return NextResponse.json({
    user: { name: updated.name, bio: updated.bio, avatarUrl: updated.avatarUrl },
  });
}
