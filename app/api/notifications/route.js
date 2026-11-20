
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
        const token = req.cookies.get("regToken")?.value;
        if (!token) {
            return NextResponse.json({ isSuccess: false, message: "Please sign in again." }, { status: 401 });
        }

        let user;
        try {
            user = JSON.parse(token);
        } catch {
            return NextResponse.json({ isSuccess: false, message: "Invalid login session." }, { status: 401 });
        }

        const external = user?.external;
        if (!external?.uqId || !external?.accessToken || !external?.role) {
            return NextResponse.json({ isSuccess: false, message: "Invalid login session." }, { status: 401 });
        }

        const role = external.role.toLowerCase();
        if (!["candidate", "employer"].includes(role)) {
            return NextResponse.json({ isSuccess: false, message: "Invalid user role." }, { status: 401 });
        }

        const externalApiBaseUrl = process.env.API_BASE_URL;
        if (!externalApiBaseUrl) {
            return NextResponse.json({ isSuccess: false, message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const headersList = await headers();
        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const baseUrl = externalApiBaseUrl.replace(/\/+$/, "");
        const externalApiUrl = role === "candidate"
            ? process.env.CANDIDATE_NOTIFICATIONS_API_URL || `${baseUrl}/Candidate/candi/getNotificationList`
            : process.env.EMPLOYER_NOTIFICATIONS_API_URL || `${baseUrl}/employer/employer/getNotificationList`;

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uqId: external.uqId,
                LoginIp,
                Role: external.role,
                Token: external.accessToken
            })
        });

        const responseText = await externalResponse.text();
        let responseData;

        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json({
                isSuccess: false,
                message: "Invalid response received from server."
            }, { status: 502 });
        }

        return NextResponse.json(responseData, { status: externalResponse.status });
    } catch (error) {
        console.error("NOTIFICATIONS API ERROR:", error);
        return NextResponse.json({
            isSuccess: false,
            message: "Unable to load notification history."
        }, { status: 500 });
    }
}
