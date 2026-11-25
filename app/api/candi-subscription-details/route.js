
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("regToken")?.value;

        if (!tokenCookie) {
            return NextResponse.json(
                { success: false, message: "Please sign in again." },
                { status: 401 }
            );
        }

        let user;

        try {
            user = JSON.parse(tokenCookie);
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid login session." },
                { status: 401 }
            );
        }

        const external = user?.external;
        const uqId = external?.uqId;
        const accessToken = external?.accessToken;
        const role = String(external?.role || "").trim().toUpperCase();

        if (!uqId || !accessToken || role !== "CANDIDATE") {
            return NextResponse.json(
                { success: false, message: "Invalid candidate session." },
                { status: 401 }
            );
        }

        const apiBaseUrl = process.env.API_BASE_URL;

        if (!apiBaseUrl) {
            throw new Error("API_BASE_URL is not configured.");
        }

        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const apiUrl = `${apiBaseUrl.replace(/\/+$/, "")}/Candidate/candi/SubscriptionDetails`;

        const apiResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                UqId: uqId,
                UqIdCandi: uqId,
                Role: role,
                Token: accessToken
            }),
            cache: "no-store"
        });

        const responseText = await apiResponse.text();
        let result;

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            console.error("Invalid candidate subscription response:", responseText);
            return NextResponse.json(
                { success: false, message: "Invalid response from subscription API." },
                { status: 502 }
            );
        }

        return NextResponse.json(result, {
            status: apiResponse.status,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate"
            }
        });
    } catch (error) {
        console.error("Candidate Subscription Details Route Error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Unable to retrieve subscription details." },
            { status: 500 }
        );
    }
}
