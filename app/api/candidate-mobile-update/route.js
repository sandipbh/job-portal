import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
        const { oldMobile, newMobile, otp } = await req.json();
        if (!/^\d{10}$/.test(String(oldMobile || "")) || !/^\d{10}$/.test(String(newMobile || ""))) {
            return NextResponse.json({ message: "Enter valid 10-digit mobile numbers." }, { status: 400 });
        }
        if (!/^\d{6}$/.test(String(otp || ""))) {
            return NextResponse.json({ message: "Enter a valid 6-digit OTP." }, { status: 400 });
        }
        if (oldMobile === newMobile) {
            return NextResponse.json({ message: "The new mobile number must differ from the current number." }, { status: 400 });
        }

        const token = req.cookies.get("regToken")?.value;
        const user = token ? JSON.parse(token) : {};
        if (!user.external?.uqId || !user.external?.role) {
            return NextResponse.json({ message: "Your login has expired, relogin your account." }, { status: 401 });
        }

        const externalApiBaseUrl = process.env.API_BASE_URL;
        if (!externalApiBaseUrl && !process.env.MOBILE_UPDATE_API_URL) {
            return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        const headersList = await headers();
        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";
        const externalApiUrl =
            process.env.MOBILE_UPDATE_API_URL ||
            `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/verifyAndUpdateMobile`;
        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uqId: user.external.uqId,
                oldMobile,
                newMobile,
                otp,
                LoginIp,
                Role: user.external.role,
                Token: user.external.accessToken,
            }),
        });

        const responseText = await externalResponse.text();
        let externalData = {};
        try {
            externalData = JSON.parse(responseText);
        } catch {
            externalData = { message: responseText };
        }
        const failed =
            !externalResponse.ok ||
            externalData.success === false ||
            externalData.Success === false ||
            externalData.status === false;

        return NextResponse.json(
            { message: externalData.message || (failed ? "Mobile number verification failed." : "Mobile number updated successfully.") },
            { status: failed ? (externalResponse.ok ? 400 : externalResponse.status) : 200 }
        );
    } catch (error) {
        console.error("CANDIDATE MOBILE UPDATE ERROR:", error);
        return NextResponse.json({ message: "Unable to update mobile number." }, { status: 500 });
    }
}