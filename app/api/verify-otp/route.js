import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { mobileOtp, emailOtp, uqid } = await req.json();

    if (!mobileOtp || mobileOtp.length !== 6) {
      return NextResponse.json(
        { message: "Enter a valid 6-digit mobile OTP." },
        { status: 400 }
      );
    }

    if (!emailOtp || emailOtp.length !== 6) {
      return NextResponse.json(
        { message: "Enter a valid 6-digit email OTP." },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV !== "production") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;
    if (!externalApiBaseUrl) {
      return NextResponse.json(
        { message: "Url is not configured." },
        { status: 500 }
      );
    }
    const LoginIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "Unknown";
    // console.log("Received OTP verification request:", { mobileOtp, emailOtp, uqid });
    // console.log("uqid:", uqid);
    // console.log(externalApiBaseUrl);

    const verifyUrl =
      process.env.VERIFY_OTP_API_URL ||
      `${externalApiBaseUrl.replace(/\/+$/, "")}/verification/verifyOtp`;

    const externalResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uqid, mobileOtp, emailOtp, LoginIp }),
    });

    const externalData = await externalResponse.json();

    if (!externalResponse.ok) {
      return NextResponse.json(
        {
          message: externalData.message || "OTP verification failed",
          external: externalData,
        },
        { status: externalResponse.status || 500 }
      );
    }

    return NextResponse.json(
      {
        message: externalData.message || "OTP verified successfully",
        external: externalData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
