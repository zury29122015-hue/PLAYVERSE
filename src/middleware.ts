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
  // getToken() infers whether to look for the "__Secure-" prefixed cookie name
  // from the request's own protocol, which can be misdetected in the Edge
  // runtime behind Vercel's proxy — forcing it explicitly from
  // x-forwarded-proto (what the browser actually used) avoids a mismatch
  // where the cookie NextAuth set is never found, bouncing every authed
  // request on a protected route straight back to /login.
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const secureCookie = forwardedProto ? forwardedProto === "https" : req.nextUrl.protocol === "https:";
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie });
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
