import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    const headersList = await headers();
    const token = req.cookies.get("regToken")?.value;
    const { details } = await req.json();

    let user = {};
    try {
        user = token ? JSON.parse(token) : {};
    } catch (err) {
        console.error("Invalid JSON token:", err);
        user = {};
    }

    try {
        const {
            jobpostId,
            applicationId,
            rating,
            review,
        } = details;

        if (!user.external?.uqId || !user.external?.role) {
            return NextResponse.json(
                { message: "Your login has expired, relogin your account" },
                { status: 400 }
            );
        }

        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const loginBody = {
            jobpostId,
            applicationId,
            rating,
            review,
            uqId: user.external.uqId,
            LoginIp: LoginIp,
            Role: user.external.role,
            Token: user.external.accessToken,
        };

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

        const externalApiUrl =
            process.env.REGISTER_API_URL ||
            `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/applicationReview`;

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            body: JSON.stringify(loginBody),
        });

        const responseData = JSON.parse(await externalResponse.text());

        if (!externalResponse.ok) {
            return NextResponse.json(
                {
                    message: responseData.message || "Request Failed.",
                },
                { status: responseData.status || 500 }
            );
        }

        return NextResponse.json(
            {
                message: responseData.message || "Review submitted successfully",
                data: responseData.data || {},
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("REVIEW ERROR:", error);
        return NextResponse.json(
            { message: "Failed to submit review" },
            { status: 500 }
        );
    }
}
