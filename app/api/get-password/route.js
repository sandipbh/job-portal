import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { message: "Your login has expired, relogin your account." },
        { status: 400 }
      );
    }

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


    const resendUrl =
      process.env.RESEND_OTP_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/auth/getPassword`;

    const externalResponse = await fetch(resendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Role: role,
      }),
    });

    const externalData = await externalResponse.json();

    if (!externalResponse.ok) {
      return NextResponse.json(
        {
          message: externalData.message || "Password retrieval failed.",
          external: externalData,
        },
        { status: externalResponse.status || 500 }
      );
    }

    return NextResponse.json(
      {
        message: externalData.message || "Password sent successfully.",
        external: externalData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
