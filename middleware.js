
import { NextResponse } from "next/server";

function isTokenExpired(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return !decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000) + 60;
  } catch (error) {
    console.error("Token expiry check error:", error);
    return true;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("x-rg-visitor-token");

  console.log("Middleware executed:", pathname);

  const regToken = req.cookies.get("regToken")?.value;

  // Registered user authentication
  if (regToken) {
    try {
      const role = JSON.parse(regToken)?.external?.role;

      console.log("Registered user detected:", role);

      if (pathname.startsWith("/candidates-dashboard") && role !== "candidate") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      if (pathname.startsWith("/employers-dashboard") && role !== "employer") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      return NextResponse.next({
        request: { headers: requestHeaders }
      });
    } catch (error) {
      console.error("Registered token parsing error:", error);

      if (
        pathname.startsWith("/candidates-dashboard") ||
        pathname.startsWith("/employers-dashboard")
      ) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  // Restrict dashboards to registered users
  if (
    pathname.startsWith("/candidates-dashboard") ||
    pathname.startsWith("/employers-dashboard")
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Visitor token generation
  let visitorToken = req.cookies.get("visitorToken")?.value;
  const generateNewToken = !visitorToken || isTokenExpired(visitorToken);

  console.log("Existing visitor token:", !!visitorToken);
  console.log("Generate new visitor token:", generateNewToken);

  if (generateNewToken) {
    try {
      const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, "");
      const apiUrl = `${apiBaseUrl}/Auth/visitor-token`;

      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });

      console.log("Visitor API status:", apiResponse.status);

      const responseText = await apiResponse.text();
      console.log("Visitor API response:", responseText);

      if (!apiResponse.ok) {
        console.error("Visitor API failed:", apiResponse.status);
        return NextResponse.next();
      }

      const result = JSON.parse(responseText);

      visitorToken =
        result?.data?.accessToken ||
        result?.Data?.AccessToken;

      if (!visitorToken) {
        console.error("AccessToken not found in API response");
        return NextResponse.next();
      }

      console.log("Visitor token generated successfully");
    } catch (error) {
      console.error("Visitor token API error:", error);
      return NextResponse.next();
    }
  }

  requestHeaders.set("x-rg-visitor-token", visitorToken);

  const response = NextResponse.next({
    request: { headers: requestHeaders }
  });

  if (generateNewToken) {
    response.cookies.set("visitorToken", visitorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/home-10/:path*",
    "/employers-dashboard/:path*",
    "/candidates-dashboard/:path*",
    "/api/public/:path*"
  ]
};
