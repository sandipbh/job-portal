import { NextResponse } from "next/server";

// Public endpoint - no login token / uqId required
export async function POST(req) {
    const { term } = await req.json();

    try {
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
            `${externalApiBaseUrl.replace(/\/+$/, "")}/api/MasterList/industry/search`;

        const externalResponse = await fetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ term: term || "" }),
            cache: "no-store",
        });

        const responseData = JSON.parse(await externalResponse.text());

        return NextResponse.json(
            {
                data: responseData || [],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("PUBLIC INDUSTRY SEARCH ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch industries" },
            { status: 500 }
        );
    }
}
