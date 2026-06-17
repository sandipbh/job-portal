import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, mobile, uqid } = await req.json();

    if (!email || !mobile || !uqid) {
      return NextResponse.json(
        { message: "Email and mobile  are required to resend OTP." },
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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/auth/resendOTP`;

    const externalResponse = await fetch(resendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Uqid: uqid,
        Email: email,
        Mobile: mobile,
      }),
    });

    const externalData = await externalResponse.json();

    if (!externalResponse.ok) {
      return NextResponse.json(
        {
          message: externalData.message || "OTP resend failed.",
          external: externalData,
        },
        { status: externalResponse.status || 500 }
      );
    }

    return NextResponse.json(
      {
        message: externalData.message || "OTP resent successfully.",
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
