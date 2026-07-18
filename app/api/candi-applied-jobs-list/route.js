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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/getAppliedJobsShortListed`;

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

