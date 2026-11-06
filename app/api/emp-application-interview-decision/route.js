
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

        const { applicationId, jobpostId, ttype, candiUqId } = details;

        if (!applicationId || !Number.isSafeInteger(Number(applicationId)) || Number(applicationId) <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid application ID." }, { status: 400 });
        }

        if (!jobpostId || !Number.isSafeInteger(Number(jobpostId)) || Number(jobpostId) <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid job post ID." }, { status: 400 });
        }

        if (ttype !== "Selected Candidate" && ttype !== "Rejected Candidate") {
            return NextResponse.json({ isSuccess: false, message: "Invalid interview decision." }, { status: 400 });
        }

        if (!candiUqId || typeof candiUqId !== "string") {
            return NextResponse.json({ isSuccess: false, message: "Invalid candidate ID." }, { status: 400 });
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

        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for");
        const loginIp = forwardedFor?.split(",")[0]?.trim()
            || headersList.get("x-real-ip")
            || headersList.get("cf-connecting-ip")
            || "";

        const loginBody = {
            applicationId: Number(applicationId),
            jobpostId: Number(jobpostId),
            ttype,
            candiUqId,
            uqId: external.uqId,
            LoginIp: loginIp,
            Role: external.role,
            Token: external.accessToken
        };


        console.log(" loginBody : ", loginBody);

        const externalApiBaseUrl = process.env.API_BASE_URL;

        if (!externalApiBaseUrl) {
            return NextResponse.json({ isSuccess: false, message: "API base URL is not configured." }, { status: 500 });
        }

        const externalApiUrl = `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/applicationInterviewDecision`;

        const response = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
                message: result?.message || result?.Message || "Unable to update interview decision."
            }, { status: response.status });
        }

        return NextResponse.json({
            isSuccess: result?.isSuccess ?? result?.IsSuccess ?? true,
            message: result?.message || result?.Message || "Interview decision updated successfully."
        }, { status: 200 });

    } catch (error) {
        console.error("Interview decision API error:", error);

        return NextResponse.json({
            isSuccess: false,
            message: "An unexpected error occurred while updating the interview decision."
        }, { status: 500 });
    }
}
