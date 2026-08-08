import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";


export async function POST(req) {
  const headersList = await headers();

  const token = req.cookies.get("regToken")?.value;
  const url = req.nextUrl.pathname;

  let user = {};
  try {
    user = token ? JSON.parse(token) : {};
  } catch (err) {
    console.error("Invalid JSON token:", err);
    user = {};
  }

  try {

    const {
      jobpostId,
      LoginUqid,
    } = await req.json();
    if (!user) {
      // 1. Basic validation
      if (!user.external.uqId || !user.external.role) {
        return NextResponse.json(
          { message: "Your login has expired, relogin your account" },
          { status: 400 }
        );
      }
    }
    const LoginIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "Unknown";

    const loginBody = {
      jobpostId: jobpostId,
      uqId: LoginUqid || "00000000-0000-0000-0000-000000000000",
      LoginIp: LoginIp,
      Role: user?.external?.role || "public",
      Token: user?.external?.accessToken || "public-token",
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
    //console.log("External API Base URL 00:", externalApiBaseUrl);

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/api/public/updateJobCount`;



    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });

    const responseData = JSON.parse(await externalResponse.text());

    // console.log("External Candi API response:", responseData);
    // console.log("External API Response Status:", responseData.message || externalResponse.status);


    if (!externalResponse.ok) {
      console.error(
        "External Update JobView failed:",
        responseData.success,
        responseData.message
      );

      return NextResponse.json(
        {
          message: responseData.message || "Save Failed",
        },
        { status: responseData.status || 500 }
      );
    }

    //console.log("job saved successfully");

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "job view saved successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to save job view" },
      { status: 500 }
    );
  }
}