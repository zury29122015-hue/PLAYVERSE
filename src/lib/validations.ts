import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Correo inválido"),
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  name: z.string().min(1).max(60).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const submissionSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(2).max(80),
  description: z.string().min(10).max(4000),
  categoryId: z.string().optional().nullable(),
  genre: z.string().max(40).optional().nullable(),
  controls: z.string().max(400).optional().nullable(),
  ageRating: z.string().max(40).default("Everyone"),
  tags: z.array(z.string().max(24)).max(10).default([]),
  creatorName: z.string().max(60).optional().nullable(),
  coverImage: z.string().optional().nullable(),
  screenshots: z.array(z.string()).max(6).default([]),
});

export const commentSchema = z.object({
  gameId: z.string().min(1),
  body: z.string().min(1).max(1000),
  parentId: z.string().optional().nullable(),
});

export const ratingSchema = z.object({
  gameId: z.string().min(1),
  value: z.number().int().min(1).max(5),
});

export const reportSchema = z.object({
  gameId: z.string().min(1),
  reason: z.string().min(2).max(60),
  details: z.string().max(1000).optional().nullable(),
});

export const reviewDecisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "REQUEST_CHANGES"]),
  note: z.string().max(2000).optional().nullable(),
});
