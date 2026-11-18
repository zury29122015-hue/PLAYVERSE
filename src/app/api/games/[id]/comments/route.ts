import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { commentSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Debes iniciar sesión para comentar." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = commentSchema.safeParse({ ...body, gameId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Comentario inválido." }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: {
      gameId: id,
      userId: user.id,
      body: parsed.data.body,
      parentId: parsed.data.parentId ?? null,
    },
    include: { user: { select: { username: true, avatarUrl: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
