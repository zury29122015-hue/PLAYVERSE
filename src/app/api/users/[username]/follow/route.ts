import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const target = await db.user.findUnique({ where: { username } });
  if (!target || target.id === user.id) return NextResponse.json({ error: "Inválido" }, { status: 400 });

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
  });

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await db.follow.create({ data: { followerId: user.id, followingId: target.id } });
  await db.notification.create({
    data: {
      userId: target.id,
      type: "NEW_FOLLOWER",
      message: `@${user.username} ahora te sigue.`,
      link: `/profile/${user.username}`,
    },
  });
  return NextResponse.json({ following: true });
}
