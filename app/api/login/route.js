import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";


export async function POST(req) {
  const headersList = await headers();

  try {
    const {
      email,
      password,
      role
    } = await req.json();

    console.log("Login attempt:", email);

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }


    const LoginIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "Unknown";

    const loginBody = {
      Email: email,
      Password: password,
      Role: role,
      LoginIp: LoginIp,
    };
    console.log("Login body:", loginBody);

    // Allow self-signed certs in local development only.
    if (process.env.NODE_ENV !== "production") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;
    if (!externalApiBaseUrl) {
      return NextResponse.json(
        { message: "API_BASE_URL is not configured." },
        { status: 500 }
      );
    }
    // console.log("External API Base URL 00:", externalApiBaseUrl);

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/auth/login`;

    console.log("External API URL :", externalApiUrl);

    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });


    const externalData = await externalResponse.json();

    console.log("External API response :", externalData);

    if (!externalResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: externalData.message,
          status: externalData.success,
          isVefity: externalData.isVefity,
          isActive: externalData.isActive,

        },
        {
          status: externalResponse.status,
        }
      );
    }


    console.log("User logged in successfully:", externalData.success);

    // Create response

    const response = NextResponse.json(
      {
        message: externalData.message || "Login successful",
        roleType: role,
        status: externalData.success,
        external: externalData,
        isVefity: externalData.isVefity,
        isActive: externalData.isActive,

      },
      { status: 201 }
    );

    const isSecure = headersList.get("x-forwarded-proto") === "https";

    if (!externalData.isVefity) {
      // Unverified user: replace any stale registration cookie with this user's data
      const ud = externalData.data || {};
      // Deep search so we don't depend on one exact key name from the backend
      const findKey = (obj, re, depth = 0) => {
        if (!obj || typeof obj !== "object" || depth > 4) return null;
        for (const [k, v] of Object.entries(obj)) {
          if (re.test(k) && (typeof v === "string" || typeof v === "number") && String(v).trim() !== "") {
            return String(v);
          }
        }
        for (const v of Object.values(obj)) {
          const found = findKey(v, re, depth + 1);
          if (found) return found;
        }
        return null;
      };
      console.log("Unverified login payload keys:", Object.keys(externalData), Object.keys(ud));
      const otpUser = {
        Uqid: findKey(externalData, /^uq_?id$/i) ?? ud.id ?? findKey(externalData, /^id$/i) ?? externalData.dataUqId ?? null,
        Email: findKey(externalData, /^e-?mail$/i) ?? email,
        Mobile: findKey(externalData, /(mobile|phone|contact)/i),
      };

      const unverifiedResponse = NextResponse.json(
        {
          message: externalData.message || "Account not verified",
          roleType: role,
          status: externalData.success,
          isVefity: false,
          isActive: externalData.isActive,
          otpUser: {
            otpUserEmail: otpUser.Email,
            otpUserMobile: otpUser.Mobile,
            otpUserUqId: otpUser.Uqid,
          },
        },
        { status: 201 }
      );

      unverifiedResponse.cookies.set("regToken", JSON.stringify(otpUser), {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 5 * 60 * 60,
      });

      return unverifiedResponse;
    }

    /******************remove old cookies********* */
    const cookieOptions2 = {
      path: "/",
      expires: new Date(0),
    };

    response.cookies.set("regToken", "", cookieOptions2);
    response.cookies.set("accessToken", "", cookieOptions2);
    response.cookies.set("refreshToken", "", cookieOptions2);
    response.cookies.set("userInfo", "", cookieOptions2);

    /******************remove old cookies********* */


    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    };

    const regTokenData = {
      AccessToken: externalData.dataAccessToken,
      RefreshToken: externalData.dataRefreshToken,
      UqId: externalData.dataUqId,
      user: externalData.data,
      external: externalData,
    };

    // Set fresh cookie
    response.cookies.set(
      "regToken",
      JSON.stringify(regTokenData),
      cookieOptions
    );

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Failed to login user." + error },
      { status: 500 }
    );
  }
}