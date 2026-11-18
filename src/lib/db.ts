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

// Serverless best practice for an already-pooled (PgBouncer-style) connection:
// cap this one client instance to a single connection, since many separate
// function instances may run concurrently, each with its own cached client.
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("connection_limit")) {
  const sep = process.env.DATABASE_URL.includes("?") ? "&" : "?";
  process.env.DATABASE_URL = `${process.env.DATABASE_URL}${sep}connection_limit=1`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Always cache the client on `globalThis`, in every environment. The usual
// Next.js advice to only do this in development (to survive dev-server hot
// reloads) is backwards for a serverless deployment: a warm Vercel function
// container reuses the same Node.js process across invocations, so skipping
// the cache in production meant every request could end up constructing a
// fresh PrismaClient — each opening its own connections — exhausting the
// database's small connection-pool limit within minutes
// ("Timed out fetching a new connection from the connection pool").
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = db;
