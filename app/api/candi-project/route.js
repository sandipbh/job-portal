import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

// GET Method 
export async function GET(req) {
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

    const loginBody = {
      uqId: user.external.uqId,
      Role: user.external.role,
      Token: user.external.accessToken,
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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/getProject`;


    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(loginBody),
    });

    const responseData = JSON.parse(await externalResponse.text());

    const response = NextResponse.json(
      {
        data: responseData || [],
      },
      { status: 201 }
    );
    return response;

  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch details" },
      { status: 500 }
    );
  }
}

// POST Method
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

      projectName,
      projectUrl,
      description,
      skills,
      projectStartMonth,
      projectStartYear,
      projectEndMonth,
      projectEndYear,
      currentlyWorking

    } = await req.json();

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

    const loginBody = {

      projectName: projectName,
      projectUrl: projectUrl,
      description: description,
      skills: skills,
      projectStartMonth: projectStartMonth,
      projectStartYear: projectStartYear,
      projectEndMonth: projectEndMonth,
      projectEndYear: projectEndYear,
      currentlyWorking: currentlyWorking,



      uqId: user.external.uqId,
      LoginIp: LoginIp,
      Role: user.external.role,
      Token: user.external.accessToken,
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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/saveProjects`;

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(loginBody),
    });

    const responseData = JSON.parse(await externalResponse.text());

    if (!externalResponse.ok) {
      console.error(
        "External UpdateProfile failed:",
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

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Save details successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update details" },
      { status: 500 }
    );
  }
}