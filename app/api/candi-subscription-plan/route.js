
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

    const external = user?.external;

    if (!external?.accessToken || !external?.uqId) {
        return NextResponse.json({ success: false, message: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    const role = String(external.role || "").toUpperCase();

    if (role !== "CANDIDATE") {
        return NextResponse.json({ success: false, message: "Candidate access only." }, { status: 403 });
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;

    if (!externalApiBaseUrl) {
        return NextResponse.json({ success: false, message: "API_BASE_URL is not configured." }, { status: 500 });
    }

    if (process.env.NODE_ENV !== "production") {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiUrl = `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/SubscriptionPlanList`;

    try {
        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const requestBody = {
            uqId: external.uqId,
            LoginIp,
            Role: role,
            Token: external.accessToken
        };

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${external.accessToken}`
            },
            body: JSON.stringify(requestBody),
            cache: "no-store"
        });

        const responseText = await externalResponse.text();
        let responseData;

        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json({ success: false, message: "Invalid response from subscription API." }, { status: 502 });
        }

        if (!externalResponse.ok) {
            return NextResponse.json({
                success: false,
                message: responseData?.message || responseData?.Message || "Unable to load candidate subscription plans."
            }, { status: externalResponse.status });
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("CANDIDATE SUBSCRIPTION PLAN ERROR:", error);
        return NextResponse.json({ success: false, message: "Unable to load candidate subscription plans." }, { status: 500 });
    }
}
