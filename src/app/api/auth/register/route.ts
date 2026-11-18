import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { email, username, password, name } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.user.findFirst({
    where: { OR: [{ email: normalizedEmail }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.email === normalizedEmail
            ? "Ese correo ya está registrado"
            : "Ese nombre de usuario ya está en uso",
      },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const role = adminEmail && adminEmail === normalizedEmail ? "ADMIN" : "USER";

  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      username,
      passwordHash,
      name: name ?? username,
      role,
    },
    select: { id: true, email: true, username: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
