import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.auth) return NextResponse.next();
  const login = new URL("/login", req.nextUrl.origin);
  login.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(login);
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/medications/:path*",
    "/alerts/:path*",
  ],
};
