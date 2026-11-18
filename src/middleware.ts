import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const AUTH_REQUIRED_PREFIXES = ["/create", "/library", "/settings"];
const ADMIN_REQUIRED_PREFIXES = ["/admin"];

// Deliberately avoids importing "@/lib/auth" (the full NextAuth config, which
// pulls in Prisma + bcryptjs): that bundle is too large for the Edge Function
// size limit. getToken() only needs AUTH_SECRET to decode the JWT cookie.
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isAuthed = !!token;
  const isAdmin = token?.role === "ADMIN";

  const needsAuth = AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAdmin && !isAdmin) {
    const url = new URL(isAuthed ? "/" : "/login", req.url);
    if (!isAuthed) url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAuth && !isAuthed) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create/:path*", "/library/:path*", "/settings/:path*", "/admin/:path*"],
};
