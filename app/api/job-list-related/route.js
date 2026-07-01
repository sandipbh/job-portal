import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";


// GET Method 
export async function GET(req) {
    const headersList = await headers();

    const url = req.nextUrl.pathname;

    const JobPostId = req.nextUrl.searchParams.get("JobPostId");



    try {

        const loginBody = {
            JobPostId: JobPostId,
        };

        // Allow self-signed certs in local development only.
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
            `${externalApiBaseUrl.replace(/\/+$/, "")}/api/Public/getJobListRelated`;



        const externalResponse = await fetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(loginBody),
            next: { revalidate: 60 }
        });

        const responseData = await externalResponse.json();


        const response = NextResponse.json(
            {
                data: responseData || [],
            },
            { status: 201 }
        );
        return response;

    } catch (error) {
        console.error("UPDATE ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch details" },
            { status: 500 }
        );
    }
}
