import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { submissionSchema } from "@/lib/validations";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const project = await db.project.findUnique({ where: { id: parsed.data.projectId } });
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const submission = await db.gameSubmission.create({
    data: {
      projectId: project.id,
      submitterId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId || null,
      genre: parsed.data.genre || null,
      controls: parsed.data.controls || null,
      ageRating: parsed.data.ageRating,
      tags: parsed.data.tags,
      creatorName: parsed.data.creatorName || null,
      coverImage: parsed.data.coverImage || null,
      screenshots: parsed.data.screenshots,
      snapshot: project.data as object,
      entryFile: project.entryFile,
      status: "PENDING",
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const submissions = await db.gameSubmission.findMany({
    where: { submitterId: user.id },
    orderBy: { createdAt: "desc" },
    include: { game: { select: { slug: true } } },
  });
  return NextResponse.json({ submissions });
}
