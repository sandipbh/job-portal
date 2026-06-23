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
    console.log("External API Base URL 00:", externalApiBaseUrl);

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
        },
        {
          status: externalResponse.status,
        }
      );
    }


    //console.log("User logged in successfully:", externalData.success);

    // Create response

    const response = NextResponse.json(
      {
        message: externalData.message || "Login successful",
        roleType: role,
        status: externalData.success,
        external: externalData,
      },
      { status: 201 }
    );

    // New cookie options
    const isSecure = headersList.get("x-forwarded-proto") === "https";

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
      { message: "Failed to login user " + error },
      { status: 500 }
    );
  }
}