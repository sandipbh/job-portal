import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req) {
    const headersList = await headers();

    try {
        // Allow self-signed certs in local development only
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
            `${externalApiBaseUrl.replace(/\/+$/, "")}/api/Public/getJobListRecent`;

        console.log("Calling:", externalApiUrl);

        const externalResponse = await fetch(externalApiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            next: { revalidate: 60 }
        });

        if (!externalResponse.ok) {
            return NextResponse.json(
                {
                    message: "Failed to fetch data",
                    status: externalResponse.status,
                },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();

        return NextResponse.json(
            {
                data: responseData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET ERROR:", error);

        return NextResponse.json(
            {
                message: "Failed to fetch list",
                error: error.message,
            },
            { status: 500 }
        );
    }
}