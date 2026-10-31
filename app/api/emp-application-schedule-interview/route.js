
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const headersList = await headers();
        const sessionCookie = cookieStore.get("regToken")?.value;

        if (!sessionCookie) {
            return NextResponse.json({ isSuccess: false, message: "Your login has expired. Please log in again." }, { status: 401 });
        }

        let user;
        try {
            user = JSON.parse(sessionCookie);
        } catch {
            return NextResponse.json({ isSuccess: false, message: "Invalid login session." }, { status: 401 });
        }

        const external = user?.external;
        if (!external?.uqId || !external?.role || !external?.accessToken) {
            return NextResponse.json({ isSuccess: false, message: "Authentication details are missing." }, { status: 401 });
        }

        const role = String(external.role).trim().toLowerCase();
        if (!["employer", "recruiter"].includes(role)) {
            return NextResponse.json({ isSuccess: false, message: "Only employer or recruiter accounts can schedule interviews." }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ isSuccess: false, message: "Invalid request data." }, { status: 400 });
        }

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ isSuccess: false, message: "Invalid request data." }, { status: 400 });
        }

        const requiredFields = [
            "applicationId", "jobpostId", "candiUqId", "interviewDate",
            "interviewLocation", "interviewMode", "interviewer",
            "interviewerEmail", "duration", "description"
        ];

        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null || String(body[field]).trim() === "") {
                return NextResponse.json({ isSuccess: false, message: `${field} is required.` }, { status: 400 });
            }
        }

        const applicationId = Number(body.applicationId);
        const jobpostId = Number(body.jobpostId);
        const duration = Number(body.duration);
        const candiUqId = String(body.candiUqId).trim();
        const interviewDate = String(body.interviewDate).trim();
        const interviewLocation = String(body.interviewLocation).trim();
        const interviewMode = String(body.interviewMode).trim();
        const interviewer = String(body.interviewer).trim();
        const interviewerEmail = String(body.interviewerEmail).trim();
        const description = String(body.description).trim();

        if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid application ID." }, { status: 400 });
        }

        if (!Number.isSafeInteger(jobpostId) || jobpostId <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid job post ID." }, { status: 400 });
        }

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candiUqId)) {
            return NextResponse.json({ isSuccess: false, message: "Invalid candidate ID." }, { status: 400 });
        }

        if (Number.isNaN(Date.parse(interviewDate))) {
            return NextResponse.json({ isSuccess: false, message: "Enter a valid interview date and time." }, { status: 400 });
        }

        if (![15, 30, 45, 60, 90, 120].includes(duration)) {
            return NextResponse.json({ isSuccess: false, message: "Invalid interview duration." }, { status: 400 });
        }

        if (!["Online", "In-person", "Phone"].includes(interviewMode)) {
            return NextResponse.json({ isSuccess: false, message: "Invalid interview mode." }, { status: 400 });
        }

        if (interviewLocation.length > 500 || interviewer.length > 200 || interviewerEmail.length > 100 || description.length > 4000) {
            return NextResponse.json({ isSuccess: false, message: "One or more fields exceed the allowed length." }, { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interviewerEmail)) {
            return NextResponse.json({ isSuccess: false, message: "Enter a valid interviewer email address." }, { status: 400 });
        }

        if (interviewMode === "Online") {
            try {
                const meetingUrl = new URL(interviewLocation);
                if (!["http:", "https:"].includes(meetingUrl.protocol)) throw new Error();
            } catch {
                return NextResponse.json({ isSuccess: false, message: "Enter a valid online meeting URL." }, { status: 400 });
            }
        }

        const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, "");
        if (!apiBaseUrl) {
            return NextResponse.json({ isSuccess: false, message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        const loginIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
            || headersList.get("x-real-ip")
            || "Unknown";

        const loginBody = {
            uqId: String(external.uqId).trim(),
            empUqId: String(external.uqId).trim(),
            token: String(external.accessToken).trim(),
            role: String(external.role).trim(),
            loginIp,
            applicationId,
            jobpostId,
            candiUqId,
            interviewDate,
            interviewLocation,
            interviewMode,
            interviewer,
            interviewerEmail,
            duration,
            description,
            mode: "INTERVIEW"
        };

        const apiResponse = await apiFetch(`${apiBaseUrl}/Employer/employer/ScheduleInterview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginBody)
        });

        const responseText = await apiResponse.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            console.error("Schedule interview API response:", apiResponse.status, responseText);
            return NextResponse.json({ isSuccess: false, message: `Invalid API response (HTTP ${apiResponse.status}).` }, { status: 502 });
        }

        const success = result.isSuccess ?? result.success ?? result.Success ?? false;
        const message = result.message ?? result.Message ?? "Interview scheduling failed.";

        if (!apiResponse.ok || !success) {
            return NextResponse.json({ isSuccess: false, message }, {
                status: apiResponse.status >= 400 ? apiResponse.status : 400
            });
        }

        return NextResponse.json({
            isSuccess: true,
            message,
            data: result.data ?? result.Data ?? null
        });
    } catch (error) {
        console.error("Schedule interview route error:", error);
        return NextResponse.json({ isSuccess: false, message: "Unable to schedule interview. Please try again." }, { status: 500 });
    }
}
