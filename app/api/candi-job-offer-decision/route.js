import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
        const requestBody = await req.json();
        const { details } = requestBody;

        if (!details || typeof details !== "object") {
            return NextResponse.json({ isSuccess: false, message: "Invalid request details." }, { status: 400 });
        }

        const { applicationId, jobpostId, ttype, agreed } = details;

        if (!Number.isSafeInteger(Number(applicationId)) || Number(applicationId) <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid application ID." }, { status: 400 });
        }

        if (!Number.isSafeInteger(Number(jobpostId)) || Number(jobpostId) <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid job post ID." }, { status: 400 });
        }

        if (ttype !== "Offer Accept" && ttype !== "Offer Reject") {
            return NextResponse.json({ isSuccess: false, message: "Invalid offer decision." }, { status: 400 });
        }

        if (ttype === "Offer Accept" && agreed !== true) {
            return NextResponse.json({ isSuccess: false, message: "Please accept the offer terms before proceeding." }, { status: 400 });
        }

        const token = req.cookies.get("regToken")?.value;

        if (!token) {
            return NextResponse.json({ isSuccess: false, message: "Session expired. Please login again." }, { status: 401 });
        }

        let user;

        try {
            user = JSON.parse(token);
        } catch {
            return NextResponse.json({ isSuccess: false, message: "Invalid session. Please login again." }, { status: 401 });
        }

        const external = user?.external;

        if (!external?.uqId || !external?.role || !external?.accessToken) {
            return NextResponse.json({ isSuccess: false, message: "Invalid user session. Please login again." }, { status: 401 });
        }

        if (external.role.toLowerCase() !== "candidate") {
            return NextResponse.json({ isSuccess: false, message: "Only candidates can submit offer decisions." }, { status: 403 });
        }

        const headersList = await headers();
        const loginIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
            || headersList.get("x-real-ip")
            || headersList.get("cf-connecting-ip")
            || "";

        const loginBody = {
            applicationId: Number(applicationId),
            jobpostId: Number(jobpostId),
            ttype,
            agreed: agreed === true,
            candiUqId: external.uqId,
            LoginIp: loginIp,
            Role: external.role,
            Token: external.accessToken
        };

        const externalApiBaseUrl = process.env.API_BASE_URL;

        if (!externalApiBaseUrl) {
            return NextResponse.json({ isSuccess: false, message: "API base URL is not configured." }, { status: 500 });
        }

        const externalApiUrl = `${externalApiBaseUrl.replace(/\/+$/, "")}/candidate/offerDecision`;

        const response = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${external.accessToken}`
            },
            body: JSON.stringify(loginBody)
        });

        const responseText = await response.text();
        let result;

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            result = { message: responseText };
        }

        if (!response.ok) {
            return NextResponse.json({
                isSuccess: false,
                message: result?.message || result?.Message || "Unable to update offer decision."
            }, { status: response.status });
        }

        return NextResponse.json({
            isSuccess: result?.isSuccess ?? result?.Success ?? result?.IsSuccess ?? true,
            message: result?.message || result?.Message || "Offer decision updated successfully."
        });
    } catch (error) {
        console.error("Candidate offer decision API error:", error);
        return NextResponse.json({
            isSuccess: false,
            message: "An unexpected error occurred while updating the offer decision."
        }, { status: 500 });
    }
}