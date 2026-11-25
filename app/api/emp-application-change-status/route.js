
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
  try {
    const headersList = await headers();
    const token = req.cookies.get("regToken")?.value;
    if (!token) return NextResponse.json({ message: "Your login has expired, relogin your account." }, { status: 401 });

    let user;
    try {
      user = JSON.parse(token);
    } catch {
      return NextResponse.json({ message: "Invalid login session. Please login again." }, { status: 401 });
    }

    const external = user?.external ?? {};
    if (!external.uqId || !external.role || !external.accessToken) {
      return NextResponse.json({ message: "Your login has expired, relogin your account." }, { status: 401 });
    }

    const body = await req.json();
    const details = body?.details ?? {};
    const { jobpostId, applicationId, ttype, candiUqId } = details;

    if (!jobpostId || !applicationId || !ttype || !candiUqId) {
      return NextResponse.json({ message: "Required application details are missing." }, { status: 400 });
    }

    const allowedStatuses = ["Shortlisted", "Maybe", "Rejected", "Deleted"];
    if (!allowedStatuses.includes(ttype)) {
      return NextResponse.json({ message: "Invalid application status." }, { status: 400 });
    }

    const LoginIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "Unknown";

    const loginBody = {
      jobpostId,
      applicationId,
      ttype,
      candiUqId,
      uqId: external.uqId,
      LoginIp,
      Role: external.role,
      Token: external.accessToken
    };

    if (process.env.NODE_ENV !== "production") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;
    if (!externalApiBaseUrl) {
      return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
    }

    const externalApiUrl =
      process.env.REGISTER_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/applicationChangeStatus`;

    const externalResponse = await apiFetch(externalApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginBody)
    });

    const responseText = await externalResponse.text();
    let responseData = {};
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = { message: responseText || "Unexpected response from server." };
    }

    const success = responseData.success ?? responseData.Success ?? externalResponse.ok;
    const message = responseData.message ?? responseData.Message ?? (success ? "Status updated successfully." : "Request failed.");

    if (!externalResponse.ok || !success) {
      console.error("Application status update failed:", externalResponse.status, message);
      return NextResponse.json(
        { success: false, message },
        { status: externalResponse.status }
      );
    }

    return NextResponse.json(
      { success: true, message },
      { status: 200 }
    );
  } catch (error) {
    console.error("APPLICATION STATUS UPDATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update application status." },
      { status: 500 }
    );
  }
}
