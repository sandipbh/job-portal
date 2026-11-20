
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
        const headersList = await headers();
        const token = req.cookies.get("regToken")?.value;

        let user = {};

        try {
            user = token ? JSON.parse(token) : {};
        } catch (err) {
            console.error("Invalid JSON token:", err);
            user = {};
        }

        if (!user?.external?.uqId || !user?.external?.accessToken) {
            return NextResponse.json(
                { success: false, message: "Your login has expired, relogin your account." },
                { status: 401 }
            );
        }

        const { jobPostId, status } = await req.json();

        if (!jobPostId || !["Active", "Inactive"].includes(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid job posting details." },
                { status: 400 }
            );
        }

        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const loginBody = {
            uqId: user.external.uqId,
            JobPostId: Number(jobPostId),
            Status: status,
            Role: user.external.role,
            Token: user.external.accessToken,
            LoginIp: LoginIp
        };

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
            `${externalApiBaseUrl.replace(/\/+$/, "")}/jobPosting/updateJobStatus`;

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            body: JSON.stringify(loginBody)
        });

        const responseText = await externalResponse.text();

        let responseData = {};

        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            responseData = {};
        }

        if (!externalResponse.ok || responseData.success === false) {
            return NextResponse.json(
                {
                    success: false,
                    message: responseData.message || "Job status update failed."
                },
                { status: externalResponse.status || 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: responseData.message || "Job status updated successfully.",
                data: responseData.data || responseData.Data || {
                    JobPostId: Number(jobPostId),
                    Status: status
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("UPDATE JOB STATUS ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Failed to update job status." },
            { status: 500 }
        );
    }
}
