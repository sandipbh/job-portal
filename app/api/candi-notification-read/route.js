
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST() {
    try {
        const token = (await import("next/headers")).cookies;
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const regToken = cookieStore.get("regToken")?.value;

        if (!regToken) {
            return NextResponse.json({ isSuccess: false, message: "Please sign in again." }, { status: 401 });
        }

        let user;
        try {
            user = JSON.parse(regToken);
        } catch {
            return NextResponse.json({ isSuccess: false, message: "Invalid login session." }, { status: 401 });
        }

        const external = user?.external;
        if (!external?.uqId || !external?.accessToken || external?.role?.toLowerCase() !== "candidate") {
            return NextResponse.json({ isSuccess: false, message: "Invalid candidate session." }, { status: 401 });
        }

        const baseUrl = process.env.API_BASE_URL?.replace(/\/+$/, "");
        if (!baseUrl) {
            return NextResponse.json({ isSuccess: false, message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const headersList = await headers();
        const loginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const apiUrl = process.env.CANDIDATE_NOTIFICATION_READ_API_URL ||
            `${baseUrl}/Candidate/MarkNotificationsRead`;

        const apiResponse = await apiFetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                UqId: external.uqId,
                Token: external.accessToken,
                Role: external.role,
                LoginIp: loginIp
            })
        });

        const responseText = await apiResponse.text();
        let responseData;

        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json(
                { isSuccess: false, message: "Invalid response received from server." },
                { status: 502 }
            );
        }

        return NextResponse.json(responseData, { status: apiResponse.status });
    } catch (error) {
        console.error("MARK NOTIFICATIONS READ ERROR:", error);
        return NextResponse.json(
            { isSuccess: false, message: "Unable to update notification status." },
            { status: 500 }
        );
    }
}
