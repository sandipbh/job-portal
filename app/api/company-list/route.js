import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();

        const term = typeof body.term === "string" ? body.term.trim() : "";
        const location = typeof body.location === "string" ? body.location.trim() : "";
        const pageNumber = Math.max(1, Number.parseInt(body.pageNumber, 10) || 1);
        const pageSize = Math.min(100, Math.max(1, Number.parseInt(body.pageSize, 10) || 20));

        // Local dev: allow self-signed certs (same as your other working routes)
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

        // Adjust this path if your controller has a different [Route] prefix.
        const externalApiUrl =
            process.env.COMPANY_API_URL ||
            `${externalApiBaseUrl.replace(/\/+$/, "")}/api/Public/getCompanyData`;

        // PUBLIC endpoint — no token, no apiFetch (apiFetch expects user.external.accessToken)
        const externalResponse = await fetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ term, location, pageNumber, pageSize }),
            cache: "no-store"
        });

        const responseText = await externalResponse.text();
        let responseData;

        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json({
                success: false,
                message: "Invalid response from ASP.NET API.",
                details: responseText.substring(0, 1000)
            }, { status: 502 });
        }

        if (!externalResponse.ok) {
            return NextResponse.json({
                success: false,
                message:
                    responseData.message ||
                    responseData.title ||
                    `Company API returned HTTP ${externalResponse.status}.`,
                details: responseData
            }, { status: externalResponse.status });
        }

        // Normalize: your C# returns { success, data, totalRecords, pageNumber, pageSize }
        return NextResponse.json({
            success: responseData.success ?? true,
            message: responseData.message || "",
            data: Array.isArray(responseData.data) ? responseData.data : [],
            totalRecords: responseData.totalRecords || 0,
            pageNumber: responseData.pageNumber || pageNumber,
            pageSize: responseData.pageSize || pageSize
        });
    } catch (error) {
        console.error("COMPANY LIST ERROR:", error);
        console.error("COMPANY LIST CAUSE:", error.cause);

        return NextResponse.json({
            success: false,
            message: error.message || "Failed to fetch company list."
        }, { status: 500 });
    }
}