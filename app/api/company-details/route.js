import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id || !/^\d+$/.test(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID." },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${process.env.API_BASE_URL}/api/Public/getCompanyDetails?id=${encodeURIComponent(id)}`,
            {
                method: "GET",
                headers: { Accept: "application/json" },
                cache: "no-store"
            }
        );

        const result = await response.json();

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Unable to fetch company details." },
            { status: 500 }
        );
    }
}