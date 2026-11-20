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
      role
    } = await req.json();

    // 1. Basic validation
    if (!email || !role) {
      return NextResponse.json(
        { message: "Your login has expired, relogin your account" },
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
      Role: role,
    };

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

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/CandiData`;

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(loginBody),
    });

    const externalData = await externalResponse.text();

    if (!externalResponse.ok) {
      console.error(
        "External login failed:",
        externalResponse.status,
        externalData
      );

      return NextResponse.json(
        {
          message: externalData.message || "Login failed",
          external: externalData,
        },
        { status: externalResponse.status || 500 }
      );
    }

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: externalData.message || "Login successful",
        roleType: role,
        external: externalData,
      },
      { status: 201 }
    );



    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Failed to login user" },
      { status: 500 }
    );
  }
}