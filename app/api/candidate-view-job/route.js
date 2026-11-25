import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const body = await request.json();
        const jobPostId = Number(body.jobPostId);

        if (!Number.isSafeInteger(jobPostId) || jobPostId <= 0) {
            return NextResponse.json({ success: false, message: "Invalid job post ID." }, { status: 400 });
        }

        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("regToken")?.value;

        if (!tokenCookie) {
            return NextResponse.json({ success: false, message: "Candidate login required." }, { status: 401 });
        }

        let tokenData;

        try {
            tokenData = JSON.parse(tokenCookie);
        } catch {
            tokenData = JSON.parse(decodeURIComponent(tokenCookie));
        }

        const accessToken = tokenData?.external?.accessToken;
        const role = tokenData?.external?.role;

        if (!accessToken || String(role).toUpperCase() !== "CANDIDATE") {
            return NextResponse.json({ success: false, message: "Candidate access required." }, { status: 403 });
        }

        const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, "");

        if (!apiBaseUrl) {
            return NextResponse.json({ success: false, message: "API configuration missing." }, { status: 500 });
        }

        const response = await fetch(`${apiBaseUrl}/Candidate/candi/ViewJob`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ jobPostId }),
            cache: "no-store"
        });

        const result = await response.json();

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("Candidate job view API error:", error);
        return NextResponse.json({ success: false, message: "Unable to record job view." }, { status: 500 });
    }
}