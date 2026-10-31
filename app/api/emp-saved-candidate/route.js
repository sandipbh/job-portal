import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
        const headersList = await headers();
        const sessionToken = req.cookies.get("regToken")?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { isSuccess: false, message: "Your login has expired. Please login again." },
                { status: 401 }
            );
        }

        let user;
        try {
            user = JSON.parse(sessionToken);
        } catch {
            return NextResponse.json(
                { isSuccess: false, message: "Invalid login session." },
                { status: 401 }
            );
        }

        const { candiUqId, jobpostId } = await req.json();

        if (!user?.external?.uqId || !user?.external?.role || !user?.external?.accessToken) {
            return NextResponse.json(
                { isSuccess: false, message: "Login details are missing. Please login again." },
                { status: 401 }
            );
        }

        if (!candiUqId || !jobpostId || !Number.isInteger(Number(jobpostId)) || Number(jobpostId) <= 0) {
            return NextResponse.json(
                { isSuccess: false, message: "Candidate or job details are missing." },
                { status: 400 }
            );
        }

        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            "Unknown";

        const loginBody = {
            uqId: user.external.uqId,
            token: user.external.accessToken,
            role: user.external.role,
            loginIp: LoginIp,
            candiUqId,
            jobpostId: Number(jobpostId)
        };

        const externalApiBaseUrl = process.env.API_BASE_URL;

        if (!externalApiBaseUrl) {
            return NextResponse.json(
                { isSuccess: false, message: "API_BASE_URL is not configured." },
                { status: 500 }
            );
        }

        const externalApiUrl = `${externalApiBaseUrl.replace(/\/+$/, "")}/Employer/employer/GetInterviewSchedules`;

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginBody)
        });

        const responseText = await externalResponse.text();

        let responseData;
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json(
                { isSuccess: false, message: "Invalid response received from server." },
                { status: 502 }
            );
        }

        return NextResponse.json(
            {
                isSuccess: externalResponse.ok && responseData.isSuccess !== false,
                message: responseData.message || "Interview schedules retrieved.",
                data: responseData.data || []
            },
            { status: externalResponse.status }
        );
    } catch (error) {
        return NextResponse.json(
            {
                isSuccess: false,
                message: error.message || "Failed to fetch interview schedules."
            },
            { status: 500 }
        );
    }
}