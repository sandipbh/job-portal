import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { generateAccessToken } from "@/lib/auth";

export async function POST(req) {
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No token" }, { status: 401 });
  }


  const newAccessToken = generateAccessToken(data);

  const response = NextResponse.json({ message: "Refreshed" });

  response.cookies.set("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return response;
}

