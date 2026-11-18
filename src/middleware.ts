import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const AUTH_REQUIRED_PREFIXES = ["/create", "/library", "/settings"];
const ADMIN_REQUIRED_PREFIXES = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth?.user;
  const isAdmin = req.auth?.user?.role === "ADMIN";

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
});

export const config = {
  matcher: ["/create/:path*", "/library/:path*", "/settings/:path*", "/admin/:path*"],
};
