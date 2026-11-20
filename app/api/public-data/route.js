
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        let accessToken = null;

        const regToken = request.cookies.get("regToken")?.value;

        if (regToken) {
            try {
                const user = JSON.parse(regToken);
                accessToken = user?.external?.accessToken;
            } catch {
                return NextResponse.json(
                    { success: false, message: "Invalid login token." },
                    { status: 401 }
                );
            }
        }

        if (!accessToken) {
            accessToken =
                request.cookies.get("visitorToken")?.value ||
                request.headers.get("x-rg-visitor-token");
        }

        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: "Token not available." },
                { status: 401 }
            );
        }

        const apiResponse = await fetch(
            `${process.env.API_BASE_URL}/Public/getData`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                cache: "no-store"
            }
        );

        const data = await apiResponse.json();

        return NextResponse.json(data, {
            status: apiResponse.status
        });
    } catch (error) {
        console.error("Public API error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to fetch data." },
            { status: 500 }
        );
    }
}
