import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { verifyAccessToken } from "@/lib/auth";

export async function POST(req) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const db = await getDb();

  console.log("Logout refresh token:", refreshToken);

  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }


  await db
    .request()
    .input("token", refreshToken)
    .query("UPDATE CANDIDATE_REFRESH_TOKENS SET IsRevoked=1 WHERE Token=@token");

  const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set("accessToken", "", { expires: new Date(0) });
  res.cookies.set("refreshToken", "", { expires: new Date(0) });

  return res;
}