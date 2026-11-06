import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const headersList = await headers();
        const sessionCookie = cookieStore.get("regToken")?.value;

        if (!sessionCookie)
            return NextResponse.json({ isSuccess: false, message: "Your login has expired. Please log in again." }, { status: 401 });

        let user;
        try {
            user = JSON.parse(sessionCookie);
        } catch {
            return NextResponse.json({ isSuccess: false, message: "Invalid login session." }, { status: 401 });
        }

        const external = user?.external;
        if (!external?.uqId || !external?.role || !external?.accessToken)
            return NextResponse.json({ isSuccess: false, message: "Authentication details are missing." }, { status: 401 });

        if (!["employer", "recruiter"].includes(String(external.role).trim().toLowerCase()))
            return NextResponse.json({ isSuccess: false, message: "Unauthorized account." }, { status: 403 });

        const body = await req.json();

        const requiredFields = ["applicationId", "jobpostId", "candiUqId", "annualCtc", "offerValidUntil", "reportingTo", "reportingEmail", "terms"];

        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null || String(body[field]).trim() === "")
                return NextResponse.json({ isSuccess: false, message: `${field} is required.` }, { status: 400 });
        }

        if (String(body.terms).length > 4000)
            return NextResponse.json({ isSuccess: false, message: "Offer letter cannot exceed 4000 characters." }, { status: 400 });

        const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, "");
        if (!apiBaseUrl)
            return NextResponse.json({ isSuccess: false, message: "API_BASE_URL is not configured." }, { status: 500 });

        const loginIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || headersList.get("x-real-ip") || "Unknown";

        const apiBody = {
            uqId: String(external.uqId).trim(),
            empUqId: String(external.uqId).trim(),
            token: String(external.accessToken).trim(),
            role: String(external.role).trim(),
            loginIp,
            applicationId: Number(body.applicationId),
            jobpostId: Number(body.jobpostId),
            candiUqId: String(body.candiUqId).trim(),
            annualCtc: Number(body.annualCtc),
            offerValidUntil: String(body.offerValidUntil),
            reportingTo: String(body.reportingTo).trim(),
            reportingEmail: String(body.reportingEmail).trim(),
            terms: String(body.terms)
        };

        const apiResponse = await apiFetch(`${apiBaseUrl}/Employer/employer/SubmitJobOffer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiBody)
        });

        const responseText = await apiResponse.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            console.error("Submit job offer API response:", apiResponse.status, responseText);
            return NextResponse.json({ isSuccess: false, message: "Invalid API response." }, { status: 502 });
        }

        const success = result.isSuccess ?? result.success ?? result.Success ?? false;
        const message = result.message ?? result.Message ?? "Job offer submission failed.";

        if (!apiResponse.ok || !success)
            return NextResponse.json({ isSuccess: false, message }, { status: apiResponse.status >= 400 ? apiResponse.status : 400 });

        return NextResponse.json({ isSuccess: true, message, data: result.data ?? result.Data ?? null });
    } catch (error) {
        console.error("Submit job offer route error:", error);
        return NextResponse.json({ isSuccess: false, message: "Unable to submit job offer." }, { status: 500 });
    }
}