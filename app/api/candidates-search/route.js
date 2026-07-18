import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";


export async function POST(req) {
  const headersList = await headers();

  const token = req.cookies.get("regToken")?.value;
  let user = {};

  try {
    user = JSON.parse(token || "{}");
  } catch (err) {
    console.error("Invalid JSON token:", err);
    user = {};
  }

  console.log("Search Candidates - User Role:", user.external?.role);

  try {
    const {
      JOB_POST_ID = 0,
      KEYWORDS,
      DESIGNATION,
      SKILLS,
      ROLES,

      MIN_EXPERIENCE,
      MAX_EXPERIENCE,
      MIN_SALARY,
      MAX_SALARY,
      LOCATION,
      COMPANY,

      NOTICE_PERIOD,
      CURRENT_SALARY_FROM,
      CURRENT_SALARY_TO,
      EXPECTED_SALARY_FROM,
      EXPECTED_SALARY_TO,
      DEPARTMENT_IDS,
      INDUSTRY_IDS,
      PAGE_NO = 1,
      PAGE_SIZE = 20,
    } = await req.json();

    // Basic Validation
    if (!user.external?.uqId) {
      return NextResponse.json(
        { message: "Your login has expired. Please relogin." },
        { status: 401 }
      );
    }

    const LoginIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "Unknown";

    const searchBody = {

      JOB_POST_ID: parseInt(JOB_POST_ID) || 0,
      KEYWORDS: KEYWORDS || null,
      MIN_EXPERIENCE: MIN_EXPERIENCE ? parseInt(MIN_EXPERIENCE) : null,
      MAX_EXPERIENCE: MAX_EXPERIENCE ? parseInt(MAX_EXPERIENCE) : null,
      MIN_SALARY: MIN_SALARY ? parseFloat(MIN_SALARY) : null,
      MAX_SALARY: MAX_SALARY ? parseFloat(MAX_SALARY) : null,
      LOCATION: LOCATION || null,
      COMPANY: COMPANY || null,


      DESIGNATION: DESIGNATION || null,
      SKILLS: SKILLS || null,
      ROLES: ROLES || null,


      NOTICE_PERIOD: NOTICE_PERIOD || null,
      CURRENT_SALARY_FROM: CURRENT_SALARY_FROM ? parseFloat(CURRENT_SALARY_FROM) : null,
      CURRENT_SALARY_TO: CURRENT_SALARY_TO ? parseFloat(CURRENT_SALARY_TO) : null,
      EXPECTED_SALARY_FROM: EXPECTED_SALARY_FROM ? parseFloat(EXPECTED_SALARY_FROM) : null,
      EXPECTED_SALARY_TO: EXPECTED_SALARY_TO ? parseFloat(EXPECTED_SALARY_TO) : null,
      DEPARTMENT_IDS: DEPARTMENT_IDS || null,
      INDUSTRY_IDS: INDUSTRY_IDS || null,
      PAGE_NO: parseInt(PAGE_NO),
      PAGE_SIZE: parseInt(PAGE_SIZE),

      uqId: user.external.uqId,
      LoginIp: LoginIp,
      Role: user.external.role,
      Token: user.external.accessToken,
    };

    console.log("Candidate Search Request Body:", searchBody);

    // Allow self-signed certs in development
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
      process.env.CANDIDATE_SEARCH_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/getSearchCandidate`;

    console.log("External API URL:", externalApiUrl);

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      body: JSON.stringify(searchBody),
    });

    const responseData = await externalResponse.text();
    let parsedData;

    try {
      parsedData = JSON.parse(responseData);
    } catch (e) {
      parsedData = { message: responseData };
    }

    console.log("External Candidate Search Response:", parsedData);

    if (!externalResponse.ok) {
      return NextResponse.json(
        {
          message: parsedData.message || "Failed to fetch candidates",
          success: false,
        },
        { status: externalResponse.status || 500 }
      );
    }

    // Success Response
    return NextResponse.json({
      success: true,
      message: "Candidates fetched successfully",
      data: parsedData,           // Adjust according to your external API response structure
      totalCount: parsedData?.totalCount || parsedData?.length || 0,
    });

  } catch (error) {
    console.error("CANDIDATE SEARCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search candidates",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}