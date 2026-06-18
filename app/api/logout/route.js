import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  const cookieOptions = {
    path: "/",
    expires: new Date(0),
  };

  response.cookies.set("regToken", "", cookieOptions);
  response.cookies.set("accessToken", "", cookieOptions);
  response.cookies.set("refreshToken", "", cookieOptions);
  response.cookies.set("userInfo", "", cookieOptions);

  return response;
}