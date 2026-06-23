import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

// GET Method
export async function GET(req) {
  const headersList = await headers();
  const token = req.cookies.get("regToken")?.value;

  let user = {};
  try {
    user = JSON.parse(token || "{}");
  } catch (err) {
    console.error("Invalid JSON token:", err);
    user = {};
  }

  let debugInfo = ""; // Better name for debugging

  try {
    const loginBody = {
      uqId: user.external?.uqId,
      Role: user.external?.role,
      Token: user.external?.accessToken,
    };

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
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/getBasicDetails`;

    debugInfo = `URL: ${externalApiUrl}\nBody: ${JSON.stringify(loginBody)}`;

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });

    // Read body ONLY ONCE
    const responseText = await externalResponse.text();
    debugInfo += `\nResponse Status: ${externalResponse.status}\nResponse Body: ${responseText}`;

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse JSON response:", parseErr);
      return NextResponse.json(
        {
          message: "Invalid JSON response from external API",
          // debug: debugInfo
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      {
        data: responseData || []
      },
      { status: 200 } // Changed to 200 (OK) instead of 201
    );

  } catch (error) {
    console.error("Profile fetch ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch profile details",
        //debug: debugInfo,
        error: error.message,
      },
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

  try {
    const {
      fullName,
      email,
      phone,
      dob,
      state,
      city,
      address,
      pincode,
      currentCtc,
      expectedCtc,
      country,
      countryCode,
      languageString,
      gender,
      languages,
      summary,

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

      fullName: fullName,
      email: email,
      phone: phone,
      dob: dob,
      state: state,
      city: city,
      address: address,
      pincode: pincode,
      country: country,
      countryCode: countryCode,
      languageString: languageString,
      currentCtc: currentCtc,
      expectedCtc: expectedCtc,
      summary: summary,

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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/UpdateBasicResume`;

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
        "Update failed:",
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

    console.log("Update successfully");

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: responseData.message || "Update successfully",
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update" },
      { status: 500 }
    );
  }
}