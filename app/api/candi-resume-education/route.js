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
    user = JSON.parse(token);
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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/getEducation`;


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
      { message: "Failed to fetch profile details" },
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
    user = JSON.parse(token);
  } catch (err) {
    console.error("Invalid JSON token:", err);
    user = {};
  }
  console.log("dashboard user User Role :", user.external.role);

  const body = await req.json();

  console.log("Received Body:", body);


  try {
    const {
      eduType,
      te_board,
      te_passingYear,
      te_medium,
      te_marks,

      tw_board,
      tw_passingYear,
      tw_stream,
      tw_marks,

      gr_university,
      gr_universityId,
      gr_course,
      gr_specialization,

      gr_courseId,
      gr_specializationId,

      gr_courseType,
      gr_startYear,
      gr_endYear,
      gr_gradingSystem,
      gr_score,

      pg_university,
      pg_universityId,
      pg_course,
      pg_specialization,

      pg_courseId,
      pg_specializationId,

      pg_courseType,
      pg_startYear,
      pg_endYear,
      pg_gradingSystem,
      pg_score,

      ph_university,
      ph_universityId,
      ph_course,
      ph_specialization,

      ph_courseId,
      ph_specializationId,

      ph_courseType,
      ph_startYear,
      ph_endYear,
      ph_gradingSystem,
      ph_score

    } = body;

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

      eduType: eduType,
      te_board: te_board,
      te_passingYear: te_passingYear,
      te_medium: te_medium,
      te_marks: te_marks,

      tw_board: tw_board,
      tw_passingYear: tw_passingYear,
      tw_stream: tw_stream,
      tw_marks: tw_marks,

      gr_university: gr_university,
      gr_universityId: gr_universityId,

      gr_course: gr_course,
      gr_specialization: gr_specialization,

      gr_courseId: gr_courseId,
      gr_specializationId: gr_specializationId,

      gr_courseType: gr_courseType,
      gr_startYear: gr_startYear,
      gr_endYear: gr_endYear,
      gr_gradingSystem: gr_gradingSystem,
      gr_score: gr_score,

      pg_university: pg_university,
      pg_universityId: pg_universityId,
      pg_course: pg_course,
      pg_specialization: pg_specialization,

      pg_courseId: pg_courseId,
      pg_specializationId: pg_specializationId,

      pg_courseType: pg_courseType,
      pg_startYear: pg_startYear,
      pg_endYear: pg_endYear,
      pg_gradingSystem: pg_gradingSystem,
      pg_score: pg_score,

      ph_university: ph_university,
      ph_universityId: ph_universityId,
      ph_course: ph_course,
      ph_specialization: ph_specialization,

      ph_courseId: ph_courseId,
      ph_specializationId: ph_specializationId,

      ph_courseType: ph_courseType,
      ph_startYear: ph_startYear,
      ph_endYear: ph_endYear,
      ph_gradingSystem: ph_gradingSystem,
      ph_score: ph_score,

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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/saveEducation`;

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

    console.log("Profile changed successfully");

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Profile changed successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to changed profile" },
      { status: 500 }
    );
  }
}