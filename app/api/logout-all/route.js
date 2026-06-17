import { NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { verifyAccessToken } from "@/lib/auth";

export async function POST(req) {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = verifyAccessToken(token);

  if (!user) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const db = await getDb();

  // 🔥 Revoke ALL sessions
  await db
    .request()
    .input("userId", user.id)
    .query(`
      UPDATE CANDIDATE_REFRESH_TOKENS 
      SET IsRevoked = 1 
      WHERE UserId = @userId
    `);

  const res = NextResponse.json({ message: "Logged out from all devices" });

  // Clear current cookies
  res.cookies.set("accessToken", "", { expires: new Date(0) });
  res.cookies.set("refreshToken", "", { expires: new Date(0) });

  return res;
}