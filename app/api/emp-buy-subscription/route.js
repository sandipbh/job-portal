
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
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

        const role = String(user.external.role || "").toUpperCase();

        if (!["EMPLOYER", "RECRUITER"].includes(role)) {
            return NextResponse.json(
                { success: false, message: "Only employers can purchase subscription plans." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const planId = Number(body.planId);

        if (!Number.isInteger(planId) || planId <= 0) {
            return NextResponse.json(
                { success: false, message: "Please select a valid subscription plan." },
                { status: 400 }
            );
        }

        const externalApiBaseUrl = process.env.API_BASE_URL;

        if (!externalApiBaseUrl) {
            return NextResponse.json(
                { success: false, message: "API_BASE_URL is not configured." },
                { status: 500 }
            );
        }

        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const externalApiUrl =
            `${externalApiBaseUrl.replace(/\/+$/, "")}/Employer/employer/BuySubscription`;

        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const requestBody = {
            UqId: user.external.uqId,
            PlanId: planId,
            Role: role,
            Token: user.external.accessToken,
            LoginIp
        };

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const responseText = await externalResponse.text();

        let responseData;
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
                    message: responseData?.message || responseData?.Message || "Unable to purchase subscription."
                },
                { status: externalResponse.status }
            );
        }

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error("EMPLOYER BUY SUBSCRIPTION ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Unable to purchase subscription." },
            { status: 500 }
        );
    }
}
