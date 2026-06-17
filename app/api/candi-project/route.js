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
    console.error("Invalid JSON token:", err);
    user = {};
  }
  console.log("dashboard user User Role :", user.external.role);

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

    console.log("Login attempt email:", user.external.uqId);
    console.log("Login attempt role:", user.external.role);

    // 1. Basic validation
    if (!user.external.uqId || !user.external.role) {
      return NextResponse.json(
        { message: "Email and role are required" },
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
    console.log("body Data:", loginBody);

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

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/saveProjects`;

    console.log("External API URL :", externalApiUrl);
    console.log("External API Request Body:", loginBody);

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(loginBody),
    });

    const responseData = JSON.parse(await externalResponse.text());

    console.log("External Candi API response:", responseData);
    console.log("External API Response Status:", responseData.message || externalResponse.status);


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

    console.log("Save details successfully");

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