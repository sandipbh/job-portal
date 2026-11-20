
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const rawToken = cookieStore.get("regToken")?.value;

        if (!rawToken) {
            return NextResponse.json(
                { success: false, message: "Session expired. Please login again." },
                { status: 401 }
            );
        }

        let user;

        try {
            user = JSON.parse(rawToken);
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid session." },
                { status: 401 }
            );
        }

        const external = user?.external;

        if (!external?.uqId) {
            return NextResponse.json(
                { success: false, message: "Invalid user session." },
                { status: 401 }
            );
        }

        const body = await req.json();

        const year = body.year ? Number(body.year) : null;
        const month = body.month ? Number(body.month) : null;
        const jobRoleId = body.jobRoleId ? Number(body.jobRoleId) : null;

        if (
            (year !== null && (!Number.isInteger(year) || year < 2025 || year > new Date().getFullYear())) ||
            (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) ||
            (jobRoleId !== null && (!Number.isInteger(jobRoleId) || jobRoleId <= 0))
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid filter values." },
                { status: 400 }
            );
        }

        const loginBody = {
            UQ_ID_EMP: external.uqId,
            Year: year,
            Month: month,
            JobRoleId: jobRoleId
        };

        const externalApiBaseUrl = process.env.API_BASE_URL;

        if (!externalApiBaseUrl) {
            return NextResponse.json(
                { success: false, message: "API_BASE_URL is not configured." },
                { status: 500 }
            );
        }

        const externalApiUrl =
            `${externalApiBaseUrl.replace(/\/+$/, "")}/Employer/employer/getRecruitmentAnalytics`;

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
            responseData = JSON.parse(responseText);
        } catch {
            responseData = {
                success: false,
                message: responseText || "Invalid API response."
            };
        }
        return NextResponse.json(responseData, {
            status: externalResponse.status
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch recruitment analytics.",
                error: error.message
            },
            { status: 500 }
        );
    }
}
