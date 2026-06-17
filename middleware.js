import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = req.cookies.get("regToken")?.value;
  const url = req.nextUrl.pathname;

  // No cookie found
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let user;

  try {
    user = JSON.parse(token);
  } catch (err) {
    console.error("Invalid regToken:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Empty object check
  if (!user || Object.keys(user).length === 0) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Candidate routes
  if (
    url.startsWith("/candidates-dashboard") &&
    user?.external?.role !== "candidate"
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Employer routes
  if (
    url.startsWith("/employers-dashboard") &&
    user?.external?.role !== "employer"
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