
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    const headersList = await headers();

    let user;
    try {
        const token = req.cookies.get("regToken")?.value;
        user = token ? JSON.parse(token) : null;
    } catch {
        user = null;
    }

    if (!user?.external?.accessToken || !user?.external?.uqId) {
        return NextResponse.json(
            { success: false, message: "Your session has expired. Please sign in again." },
            { status: 401 }
        );
    }

    if (process.env.NODE_ENV !== "production") {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;

    if (!externalApiBaseUrl) {
        return NextResponse.json(
            { success: false, message: "API_BASE_URL is not configured." },
            { status: 500 }
        );
    }

    const externalApiUrl =
        `${externalApiBaseUrl.replace(/\/+$/, "")}/Employer/employer/SubscriptionPlanList`;

    try {
        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const requestBody = {
            uqId: user.external.uqId,
            LoginIp,
            Role: user.external.role,
            Token: user.external.accessToken
        };

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const responseText = await externalResponse.text();

        let responseData = {};
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid response from subscription API." },
                { status: 502 }
            );
        }

        if (!externalResponse.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: responseData?.message || responseData?.Message || "Unable to load subscription plans."
                },
                { status: externalResponse.status }
            );
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("EMPLOYER SUBSCRIPTION PLAN ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Unable to load subscription plans." },
            { status: 500 }
        );
    }
}
