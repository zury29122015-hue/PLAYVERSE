import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { reviewDecisionSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";

async function uniqueSlug(title: string) {
  const base = slugify(title) || "juego";
  let slug = base;
  let attempt = 0;
  while (await db.game.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${base}-${nanoid(5).toLowerCase()}`;
    if (attempt > 5) break;
  }
  return slug;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }
  const { id } = await params;
  const submission = await db.gameSubmission.findUnique({
    where: { id },
    include: { submitter: { select: { username: true, email: true } }, project: true },
  });
  if (!submission) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ submission });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = reviewDecisionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const submission = await db.gameSubmission.findUnique({ where: { id }, include: { project: true } });
  if (!submission) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: "Esta solicitud ya fue revisada" }, { status: 409 });
  }

  if (parsed.data.decision === "APPROVE") {
    const slug = await uniqueSlug(submission.title);
    const game = await db.game.create({
      data: {
        slug,
        title: submission.title,
        description: submission.description,
        coverImage: submission.coverImage,
        screenshots: submission.screenshots,
        kind: submission.project.kind,
        entryFile: submission.entryFile,
        data: submission.snapshot as object,
        controls: submission.controls,
        ageRating: submission.ageRating,
        tags: submission.tags,
        categoryId: submission.categoryId,
        creatorId: submission.submitterId,
        status: "PUBLISHED",
      },
    });
    await db.gameSubmission.update({
      where: { id },
      data: { status: "APPROVED", gameId: game.id, reviewedById: admin.id, reviewedAt: new Date(), reviewNote: parsed.data.note ?? null },
    });
    await db.notification.create({
      data: {
        userId: submission.submitterId,
        type: "SUBMISSION_APPROVED",
        message: `Tu videojuego "${submission.title}" fue aprobado y publicado en PlayVerse.`,
        link: `/game/${slug}`,
      },
    });
    return NextResponse.json({ ok: true, slug });
  }

  const status = parsed.data.decision === "REJECT" ? "REJECTED" : "CHANGES_REQUESTED";
  await db.gameSubmission.update({
    where: { id },
    data: { status, reviewedById: admin.id, reviewedAt: new Date(), reviewNote: parsed.data.note ?? null },
  });
  await db.notification.create({
    data: {
      userId: submission.submitterId,
      type: status === "REJECTED" ? "SUBMISSION_REJECTED" : "SUBMISSION_CHANGES_REQUESTED",
      message:
        status === "REJECTED"
          ? `Tu videojuego "${submission.title}" fue rechazado. ${parsed.data.note ? `Motivo: ${parsed.data.note}` : ""}`
          : `Se solicitaron cambios para "${submission.title}". ${parsed.data.note ? `Detalle: ${parsed.data.note}` : ""}`,
      link: `/create`,
    },
  });

  return NextResponse.json({ ok: true });
}
