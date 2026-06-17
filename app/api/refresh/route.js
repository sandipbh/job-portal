import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { generateAccessToken } from "@/lib/auth";

export async function POST(req) {
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No token" }, { status: 401 });
  }

  const db = await getDb();

  const result = await db
    .request()
    .input("token", refreshToken)
    .query(`
      SELECT rt.*, u.Email, u.Role, u.Id
      FROM CANDIDATE_REFRESH_TOKENS rt
      JOIN CANDIDATE u ON u.Id = rt.UserId
      WHERE rt.Token=@token AND rt.IsRevoked=0
    `);

  const data = result.recordset[0];

  if (!data || new Date(data.ExpiryDate) < new Date()) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
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

 