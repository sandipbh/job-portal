export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    //const regTokenCookie = cookies().get("regToken")?.value;
    const cookieStore = await cookies();
    const regTokenCookie = cookieStore.get("regToken")?.value;
    if (!regTokenCookie) {
      return NextResponse.json(
        { otpUserEmail: null, otpUserMobile: null, otpUserUqId: null },
        { status: 200 }
      );
    }

    let regToken;
    try {
      regToken = JSON.parse(regTokenCookie);
    } catch {
      return NextResponse.json(
        { otpUserEmail: null, otpUserMobile: null, otpUserUqId: null },
        { status: 200 }
      );
    }

    const otpUserUqId =
      regToken?.Uqid ??
      regToken?.uqId ??
      regToken?.uqid ??
      regToken?.user?.Uqid ??
      regToken?.user?.uqId ??
      regToken?.user?.uqid ??
      null;

    const otpUserEmail = regToken?.Email ?? null;
    const otpUserMobile = regToken?.Mobile ?? null;

    return NextResponse.json(
      { otpUserEmail, otpUserMobile, otpUserUqId },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP USER DATA ERROR:", error);
    return NextResponse.json(
      { otpUserEmail: null, otpUserMobile: null, otpUserUqId: null },
      { status: 500 }
    );
  }
}