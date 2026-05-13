import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.auth) return NextResponse.next();
  const login = new URL("/login", req.nextUrl.origin);
  login.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(login);
});

/**
 * Include exact paths (e.g. `/dashboard`) — some matchers only match `/dashboard/...`
 * and can skip the bare `/dashboard` segment on certain Next.js versions.
 */
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/medications",
    "/medications/:path*",
    "/alerts",
    "/alerts/:path*",
  ],
};
