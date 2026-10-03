import { NextResponse } from "next/server";

// Public endpoint - no login token / uqId required
const MASTER_LIST_PATHS = {
    department: "/api/MasterList/department/search",
    skills: "/api/MasterList/skills/search",
    courses: "/api/MasterList/specializationList",
    industries: "/api/MasterList/industryList",
};

export async function POST(req) {
    try {
        const { type, term } = await req.json();
        const path = MASTER_LIST_PATHS[type];

        if (!path) {
            return NextResponse.json(
                { message: "Invalid list type." },
                { status: 400 }
            );
        }

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

        const externalResponse = await fetch(
            `${externalApiBaseUrl.replace(/\/+$/, "")}${path}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ term: term || "" }),
                cache: "no-store",
            }
        );

        if (!externalResponse.ok) {
            return NextResponse.json(
                { message: "Failed to fetch list." },
                { status: externalResponse.status }
            );
        }

        const responseData = JSON.parse(await externalResponse.text());

        return NextResponse.json(
            { data: Array.isArray(responseData) ? responseData : [] },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUBLIC MASTER LIST ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch list." },
            { status: 500 }
        );
    }
}
