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
      googleId,
      role
    } = await req.json();

    console.log("Login attempt:", email);

    // 1. Basic validation
    if (!email || !googleId) {
      return NextResponse.json(
        { message: "Email and Google ID are required" },
        { status: 400 }
      );
    }


    const loginBody = {
      Email: email,
      GoogleId: googleId,
      // Role: role,
      // LoginIp: headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      //   headersList.get("x-real-ip") ||
      //   headersList.get("cf-connecting-ip") ||
      //   "Unknown",
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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/authLogin/checkEmail`;

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

    //console.log("User logged in successfully:", externalData.success);

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

    if (!externalData.isVefity) {

      return response;
    }


    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Failed to login user" },
      { status: 500 }
    );
  }
}