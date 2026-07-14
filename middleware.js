import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("regToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let role;

  try {
    role = JSON.parse(token)?.external?.role;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/candidates-dashboard") &&
    role !== "candidate"
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    pathname.startsWith("/employers-dashboard") &&
    role !== "employer"
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home-10/:path*",
    "/employers-dashboard/:path*",
    "/candidates-dashboard/:path*",
  ],
};