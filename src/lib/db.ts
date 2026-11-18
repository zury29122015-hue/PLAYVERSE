import { PrismaClient } from "@prisma/client";

// This deployment's connected Postgres integration created its connection
// strings under a prefixed, "Secret"-typed name (e.g.
// PALYVERSE_PREFIX_DATABASE_URL_POOLED) instead of the plain DATABASE_URL
// this app's schema.prisma expects — and Secret-typed vars can't be viewed or
// copied from the dashboard once saved. Alias it here instead, at runtime,
// so schema.prisma can stay on the portable `env("DATABASE_URL")` name.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.PALYVERSE_PREFIX_DATABASE_URL_POOLED ?? process.env.PALYVERSE_PREFIX_DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
