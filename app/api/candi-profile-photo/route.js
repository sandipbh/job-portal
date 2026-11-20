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
    user = {};
  }

  try {

    const formData = await req.formData();
    const file = formData.get("file");

    // 1. Basic validation
    if (!user.external.uqId || !user.external.role) {
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

    const externalFormData = new FormData();
    externalFormData.append("UqId", user.external.uqId);
    externalFormData.append("LoginIp", LoginIp);
    externalFormData.append("Role", user.external.role);
    externalFormData.append("Token", user.external.accessToken);
    if (file) {
      externalFormData.append("File", file, file.name || "photo.png");
    }

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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/UploadPhoto`;

    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      body: externalFormData,
    });

    const responseData = await externalResponse.text();

    if (!externalResponse.ok) {

      return NextResponse.json(
        {
          message: responseData.message || "Update Failed",
        },
        { status: responseData.status || 500 }
      );
    }

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Photo uploaded successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {

    return NextResponse.json(
      { message: "Failed to upload photo" },
      { status: 500 }
    );
  }
}