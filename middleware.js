import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

export async function middleware(req) {
  const token = req.cookies.get("regToken")?.value;
  const url = req.nextUrl.pathname;

  //console.log("Middleware token:", token);
  let user = {};
  try {
    user = JSON.parse(token);
  } catch (err) {
    //console.error("Invalid JSON token:", err);
    user = {};
  }

  //console.log("Middleware user User Role :", user.external.role);

  // Not logged in
  if (!user && url.startsWith("/home-10")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }



  //console.log("Middleware user token2 :", user.external.role);

  // Role-based protection

  // Candidate routes
  if (
    url.startsWith("/candidates-dashboard") &&
    user?.external?.role !== "candidate"
  ) {
    //console.log("Unauthorized access to candidates-dashboard");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Employer routes
  if (
    url.startsWith("/employers-dashboard") &&
    user?.external?.role !== "employer"
  ) {
    //console.log("Unauthorized access to employers-dashboard");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home-10/:path*", "/employers-dashboard/:path*", "/candidates-dashboard/:path*"],
};
 

/*
import { NextResponse } from 'next/server'

export function middleware(request) {
    const { pathname } = request.nextUrl;

    const role = "employee"; // replace with cookie / real auth

    // ❌ Not logged in
    if (!role) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ❌ Employee trying to access candidate routes
    if (pathname.startsWith('/employers-dashboard') && role === 'employee') {
        return NextResponse.redirect(new URL('/', request.url));
    }
    else if (pathname.startsWith('/employers-dashboard') && role === 'employee') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ❌ Candidate trying to access employer routes
    if (pathname.startsWith('/candidate-dashboard') && role === 'candidate') {
        return NextResponse.redirect(new URL('/', request.url));
    }
        else if (pathname.startsWith('/candidate-dashboard') && role === 'candidate') { 
        return NextResponse.redirect(new URL('/', request.url));
    }

    // ✅ Allowed
    return NextResponse.next();
}

export const config = {
  matcher: [
    '/employers-dashboard/:path*',
    '/candidate-dashboard/:path*'
  ],
};*/