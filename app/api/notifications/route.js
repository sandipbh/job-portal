import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    const headersList = await headers();
    const role = req.nextUrl.searchParams.get("role");
    const isCandidate = role === "candidate";
    const isEmployer = role === "employer";

    if (!isCandidate && !isEmployer) {
        return NextResponse.json({ message: "A valid role is required." }, { status: 400 });
    }

    let user;
    try {
        const token = req.cookies.get("regToken")?.value;
        user = token ? JSON.parse(token) : null;
    } catch {
        user = null;
    }

    if (!user?.external?.accessToken || !user?.external?.uqId) {
        return NextResponse.json(
            { message: "Your session has expired. Please sign in again." },
            { status: 401 }
        );
    }

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

    let externalApiUrl = "";
    if (isCandidate) {
        externalApiUrl =
            process.env.CANDIDATE_NOTIFICATIONS_API_URL ||
            `${externalApiBaseUrl.replace(/\/+$/, "")}/candidate/candi/getNotificationList`;
    } else if (isEmployer) {
        externalApiUrl =
            process.env.EMPLOYER_NOTIFICATIONS_API_URL ||
            `${externalApiBaseUrl.replace(/\/+$/, "")}/employer/employer/getNotificationList`;
    }


    try {
        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";


        const loginBody = {
            uqId: user.external.uqId,
            LoginIp,
            Role: user.external.role,
            Token: user.external.accessToken,
        };

        console.log("Login Body:", loginBody);
        console.log("External API URL:", externalApiUrl);

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            body: JSON.stringify(loginBody),
        });
        const responseText = await externalResponse.text();
        const responseData = responseText ? JSON.parse(responseText) : [];

        if (!externalResponse.ok) {
            return NextResponse.json(
                { message: responseData?.message || "Unable to load notification history." },
                { status: externalResponse.status }
            );
        }

        return NextResponse.json(
            { data: responseData || [] },
            { status: 201 }
        );
    } catch (error) {
        console.error("NOTIFICATIONS ERROR:", error);
        return NextResponse.json(
            { message: "Unable to load notification history." },
            { status: 500 }
        );
    }
}