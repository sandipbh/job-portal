
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("regToken")?.value;

        if (!tokenCookie) {
            return NextResponse.json({ success: false, message: "Login required." }, { status: 401 });
        }

        let user;

        try {
            user = JSON.parse(tokenCookie);
        } catch {
            return NextResponse.json({ success: false, message: "Invalid login session." }, { status: 401 });
        }

        const external = user?.external;
        const accessToken = external?.accessToken;
        const role = external?.role?.toUpperCase();

        if (!accessToken || !["EMPLOYER", "RECRUITER"].includes(role)) {
            return NextResponse.json({ success: false, message: "Unauthorized access." }, { status: 403 });
        }

        const body = await req.json();
        const candidateId = body?.candiId;

        if (!candidateId || typeof candidateId !== "string") {
            return NextResponse.json({ success: false, message: "Candidate ID is required." }, { status: 400 });
        }

        const apiBaseUrl = process.env.API_BASE_URL;

        if (!apiBaseUrl) {
            return NextResponse.json({ success: false, message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        const apiResponse = await fetch(
            `${apiBaseUrl.replace(/\/+$/, "")}/Employer/employer/ViewCandidate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({ UqIdCandi: candidateId }),
                cache: "no-store"
            }
        );

        const responseText = await apiResponse.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            result = { message: responseText };
        }

        return NextResponse.json(
            {
                success: apiResponse.ok,
                message: result?.message || result?.Message || "Candidate view processed.",
                data: result?.data ?? result?.Data ?? null
            },
            { status: apiResponse.status }
        );

    } catch (error) {
        console.error("EMPLOYER VIEW CANDIDATE ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Unable to record candidate view." },
            { status: 500 }
        );
    }
}
