import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";


export async function POST(req) {

  const headersList = await headers();

  const token = req.cookies.get("regToken")?.value;
  const url = req.nextUrl.pathname;

  let user = {};
  try {
    user = JSON.parse(token);
  } catch (err) {
    console.log("Invalid JSON token:", err);
    user = {};
  }
  console.log("dashboard user User Role :", user.external.role);

  try {

    const formData = await req.formData();
    const file = formData.get("file");

    console.log("request data file:", file);
    console.log("request data role:", user.external.role);

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

    console.log("body Data0:", {
      uqId: user.external.uqId,
      LoginIp: LoginIp,
      Role: user.external.role,
      Token: user.external.accessToken,
      file: file,
    });

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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/UploadPhoto`;

    console.log("External API URL :", externalApiUrl);
    console.log("External API Request FormData:", {
      uqId: user.external.uqId,
      LoginIp: LoginIp,
      Role: user.external.role,
      Token: user.external.accessToken,
      file: file,
    });


    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      body: externalFormData,
    });

    const responseData = await externalResponse.text();

    console.log("External Candi API response:", responseData);

    console.log("External API Response Status:", responseData.message || externalResponse.status);


    if (!externalResponse.ok) {
      console.log(
        "External login failed:",
        responseData.success,
        responseData.message
      );

      return NextResponse.json(
        {
          message: responseData.message || "Update Failed",
        },
        { status: responseData.status || 500 }
      );
    }

    console.log("Photo uploaded successfully");

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Photo uploaded successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.log("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to upload photo" },
      { status: 500 }
    );
  }
}