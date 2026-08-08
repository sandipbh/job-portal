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

  console.log("dashboard user User Role :", user.external.role);
  try {
    // const formData = await req.formData();

    // console.log("formData :", formData);

    // const applicationId = formData.get("applicationId");
    // const jobpostId = formData.get("jobpostId");
    // const communication = formData.get("communication");
    // const interviewFeedback = formData.get("interviewFeedback");
    // const culturalFit = formData.get("culturalFit");
    // const overall = formData.get("overall");
    // const remark = formData.get("remark");

    // const fileData = formData.get("file");

    const {
      jobpostId,
      applicationId,
      communication,
      interviewFeedback,
      culturalFit,
      overall,
      remark,
      fileData,
      fileName,
      fileType
    } = await req.json();

    console.log("Login attempt email:", user.external.uqId);
    console.log("Login attempt role:", user.external.role);

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
      applicationId: applicationId,
      jobpostId: jobpostId,
      communication: communication,
      interviewFeedback: interviewFeedback,
      culturalFit: culturalFit,
      overall: overall,
      remark: remark,
      fileData: fileData,

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
    //console.log("External API Base URL 00:", externalApiBaseUrl);

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/applicationReview`;

    console.log("External API URL :", externalApiUrl);
    console.log("External API Request Body:", loginBody);

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(loginBody),
    });

    // const externalResponse = await fetch(
    //   externalApiUrl,
    //   {
    //     method: "POST",
    //     body: apiFormData
    //   }
    // );

    const responseData = JSON.parse(await externalResponse.text());

    // console.log("External Candi API response:", responseData);
    // console.log("External API Response Status:", responseData.message || externalResponse.status);


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

    console.log("Feedback Saved successfully");

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Feedback Saved successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to save feedback" },
      { status: 500 }
    );
  }
}