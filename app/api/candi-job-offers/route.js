import { NextResponse } from "next/server";
import { apiFetch } from "../apiFetch";

export async function GET(req) {
    try {
        const token = req.cookies.get("regToken")?.value;
        if (!token) {
            return NextResponse.json(
                { isSuccess: false, message: "Please login to continue." },
                { status: 401 }
            );
        }

        let user;
        try {
            user = JSON.parse(token);
        } catch {
            return NextResponse.json(
                { isSuccess: false, message: "Invalid login session." },
                { status: 401 }
            );
        }

        const external = user?.external;
        if (!external?.uqId || !external?.accessToken) {
            return NextResponse.json(
                { isSuccess: false, message: "Invalid login session." },
                { status: 401 }
            );
        }

        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const externalApiBaseUrl = process.env.API_BASE_URL;
        if (!externalApiBaseUrl) {
            return NextResponse.json(
                { isSuccess: false, message: "API_BASE_URL is not configured." },
                { status: 500 }
            );
        }

        const externalApiUrl =
            `${externalApiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/getJobOffers`;

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uqId: external.uqId,
                Role: external.role,
                Token: external.accessToken
            })
        });

        const responseText = await externalResponse.text();
        let responseData;

        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = {
                isSuccess: false,
                message: "Invalid response received from server."
            };
        }

        return NextResponse.json(responseData, {
            status: externalResponse.status
        });
    } catch (error) {
        console.error("CANDIDATE JOB OFFERS ERROR:", error);

        return NextResponse.json(
            {
                isSuccess: false,
                message: "Failed to fetch job offers."
            },
            { status: 500 }
        );
    }
}