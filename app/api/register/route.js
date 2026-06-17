import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
 
export async function POST(req) {

   const headersList = await headers();

  try {
    const {
      email,
      password,
      name,
      mobile,
      role,
      CountryCode,
      countryCode,
      companyName
    } = await req.json();

    console.log("Registration attempt:", email);

    // 1. Basic validation
    if (!email || !password || !name || !mobile) {
      return NextResponse.json(
        { message: "Email, password, name, and mobile are required" },
        { status: 400 }
      );
    }

    if (role === "employer" && !companyName) {
      return NextResponse.json(
        { message: "Company name is required for employers" },
        { status: 400 }
      );
    }

        const LoginIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "Unknown";

    const registrationBody = {
      FullName: name,
      Mobile: mobile,
      CountryCode: CountryCode || countryCode || "+91",
      Email: email,
      Password: password,
      CompanyName: companyName,
      Role: role,
      LoginIp: LoginIp,
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
      `${externalApiBaseUrl.replace(/\/+$/, "")}/auth/newRegister`;

    const externalResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationBody),
    });

    const externalData = await externalResponse.json();

    console.log("External API response:", externalData);

    if (!externalResponse.ok) {
      console.error(
        "External registration failed:",
        externalResponse.status,
        externalData
      );

      return NextResponse.json(
        {
          message: externalData.message || "Registration failed",
          external: externalData,
        },
        { status: externalResponse.status || 500 }
      );
    }

    console.log("User registered successfully:", externalData.data);

    // 6. Send response with cookies
    const response = NextResponse.json(
      {
        message: externalData.message || "Registration successful",
        user: externalData.data,
        external: externalData,
      },
      { status: 201 }
    );

    // Set cookies with 5-hour expiration
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 5 * 60 * 60, // 5 hours in seconds
      expires: new Date(Date.now() + 5 * 60 * 60 * 1000),
    };

    const regTokenData = {
      Uqid:
        externalData.data?.Uqid ??
        externalData.data?.uqId ??
        externalData.data?.uqid ??
        externalData.data?.id ??
        null,
      Email: email,
      Mobile: mobile,
      CompanyName: companyName,
      user: externalData.data,
      external: externalData,
    };

    response.cookies.set("regToken", JSON.stringify(regTokenData), cookieOptions);

    return response;
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Failed to register user" },
      { status: 500 }
    );
  }
}