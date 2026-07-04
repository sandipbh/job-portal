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
    const formData = await req.formData();

    const jobpostId = formData.get("jobpostId");
    const resume = formData.get("resume"); // File object
    const message = formData.get("message");
    const answers = formData.get("answers") ? JSON.parse(formData.get("answers")) : [];

    const buffer = Buffer.from(await resume.arrayBuffer());

    const base64 = buffer.toString("base64");

    // console.log(jobpostId);
    // console.log('resume  ---', base64); // File
    // console.log(message);
    // console.log(answers);



    const formattedAnswers = answers?.length
      ? answers
        .map(({ key, question, answer }) => `${key}^${question}^${answer}`)
        .join("#")
      : "";

    //console.log("Formatted Answers:", formattedAnswers);

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

      jobpostId: jobpostId,
      resume: base64,
      coverLetter: message,
      QuAnswer: formattedAnswers,

      uqId: user.external.uqId,
      LoginIp: LoginIp,
      Role: user.external.role,
      Token: user.external.accessToken,
    };


    //console.log("body Data:", loginBody);

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
    // console.log("External API Base URL :", externalApiBaseUrl);

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/api/public/jobApply`;

    //console.log("External API URL :", externalApiUrl);
    //console.log("External API Request Body:", loginBody);

    // Send multipart/form-data (use the FormData we built above)
    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),

    });

    const responseData = JSON.parse(await externalResponse.text());


    //console.log("External Candi API response:", responseData);
    //console.log("External API Response Status:", responseData.message || externalResponse.status);


    if (!externalResponse.ok) {
      console.error(
        "External job post failed:",
        responseData.success,
        responseData.message
      );

      return NextResponse.json(
        {
          message: responseData.message || "Job Post Failed.",
        },
        { status: responseData.status || 500 }
      );
    }

    // console.log("Application submitted successfully");

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Application submitted successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 }
    );
  }
}