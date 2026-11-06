import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPE = "application/pdf";

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
            return NextResponse.json({ isSuccess: false, message: "Candidate authentication details are missing." }, { status: 401 });
        }

        if (String(external.role).toLowerCase() !== "candidate") {
            return NextResponse.json({ isSuccess: false, message: "Only candidate accounts can upload resumes." }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get("resume");

        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ isSuccess: false, message: "Please select a PDF resume." }, { status: 400 });
        }

        const extension = file.name.split(".").pop()?.toLowerCase();

        if (extension !== "pdf" || file.type !== ALLOWED_TYPE) {
            return NextResponse.json({ isSuccess: false, message: "Only PDF files are allowed." }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ isSuccess: false, message: "Resume size must not exceed 5 MB." }, { status: 400 });
        }

        const bytes = Buffer.from(await file.arrayBuffer());

        if (bytes.length < 5 || bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
            return NextResponse.json({ isSuccess: false, message: "The selected file is not a valid PDF." }, { status: 400 });
        }

        const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, "");
        if (!apiBaseUrl) {
            return NextResponse.json({ isSuccess: false, message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const loginIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
            || headersList.get("x-real-ip")
            || "Unknown";

        const loginBody = {
            uqId: external.uqId,
            Token: external.accessToken,
            Role: external.role,
            LoginIp: loginIp,
            resumeFile: `data:${ALLOWED_TYPE};base64,${bytes.toString("base64")}`,
            fileName: file.name
        };

        const apiResponse = await apiFetch(`${apiBaseUrl}/Candidate/candi/UploadResume`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginBody)
        });

        const responseText = await apiResponse.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            console.error("Resume API response:", apiResponse.status, responseText);
            return NextResponse.json({ isSuccess: false, message: `Invalid API response (HTTP ${apiResponse.status}).` }, { status: 502 });
        }

        const success = result.isSuccess ?? result.success ?? result.Success ?? false;
        const message = result.message ?? result.Message ?? "Resume upload failed.";
        const data = result.data ?? result.Data;

        if (!apiResponse.ok || !success) {
            console.error("Resume upload failed:", apiResponse.status, result);
            return NextResponse.json({ isSuccess: false, message }, {
                status: apiResponse.status >= 400 ? apiResponse.status : 500
            });
        }

        return NextResponse.json({
            isSuccess: true,
            message,
            resumePath: data?.resumePath ?? data?.ResumePath ?? null
        });
    } catch (error) {
        console.error("Resume upload route exception:", error);
        return NextResponse.json({ isSuccess: false, message: "Resume upload failed. Please try again." }, { status: 500 });
    }
}