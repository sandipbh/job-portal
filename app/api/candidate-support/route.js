import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";
import {
    hasUnsafeSupportText,
    supportTextSecurityMessage,
} from "@/utils/validateSupportDescription";
import { getCandidateIdentityFromToken } from "@/lib/candidateIdentity";

const issueCategories = [
    "Account and profile",
    "Resume and documents",
    "Job application",
    "Job alerts",
    "Messages",
    "Technical problem",
    "Other",
];

export async function GET(request) {
    const token = request.cookies.get("regToken")?.value;
    const candidate = getCandidateIdentityFromToken(token);

    if (!candidate.role) {
        return NextResponse.json({ message: "Your session is invalid. Please sign in again." }, { status: 401 });
    }
    if (candidate.role !== "candidate") {
        return NextResponse.json({ message: "Candidate access is required." }, { status: 403 });
    }

    try {
        const headersList = await headers();
        const loginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";
        const externalApiBaseUrl = process.env.API_BASE_URL;

        if (!externalApiBaseUrl) {
            return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const externalApiUrl = `${externalApiBaseUrl.replace(/\/+$/, "")}/api/Support/support/getlist`;

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            body: JSON.stringify({
                uqId: candidate.candidateId,
                LoginIp: loginIp,
                Role: candidate.role,
                Token: JSON.parse(token)?.external?.accessToken,
            }),
        });
        const responseText = await externalResponse.text();
        const responseData = responseText ? JSON.parse(responseText) : [];
        console.log("Support API Response Data:", responseData);
        if (!externalResponse.ok) {
            return NextResponse.json(
                { message: responseData?.message || "Failed to fetch support reports." },
                { status: responseData?.status || externalResponse.status }
            );
        }

        return NextResponse.json({ data: responseData?.data || responseData || [] }, { status: 200 });
    } catch (error) {
        console.error("SUPPORT REPORT FETCH ERROR:", error);
        const isUnauthorized = error.message === "Unauthorized";
        return NextResponse.json(
            { message: isUnauthorized ? "Your session has expired. Please sign in again." : "Failed to fetch support reports." },
            { status: isUnauthorized ? 401 : 500 }
        );
    }
}

export async function POST(request) {
    const token = request.cookies.get("regToken")?.value;

    if (!token) {
        return NextResponse.json({ message: "Please sign in to contact support." }, { status: 401 });
    }

    const candidate = getCandidateIdentityFromToken(token);
    if (!candidate.role) {
        return NextResponse.json({ message: "Your session is invalid. Please sign in again." }, { status: 401 });
    }
    if (candidate.role !== "candidate") {
        return NextResponse.json({ message: "Candidate access is required." }, { status: 403 });
    }

    let input;
    try {
        input = await request.json();
    } catch {
        return NextResponse.json({ message: "Please submit a valid support report." }, { status: 400 });
    }

    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return NextResponse.json({ message: "Please submit a valid support report." }, { status: 400 });
    }

    const submittedName = typeof input.fullName === "string" ? input.fullName.trim() : "";
    const fullName = candidate.fullName || submittedName;
    const category = typeof input.category === "string" ? input.category : "";
    const subject = typeof input.subject === "string" ? input.subject.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    const errors = {};

    if (fullName.length < 2 || fullName.length > 100) {
        errors.fullName = "Enter a name between 2 and 100 characters.";
    }
    if (!issueCategories.includes(category)) {
        errors.category = "Choose an issue type from the list.";
    }
    if (hasUnsafeSupportText(subject)) {
        errors.subject = supportTextSecurityMessage;
    } else if (subject.length < 5 || subject.length > 120) {
        errors.subject = "Enter a subject between 5 and 120 characters.";
    }
    if (hasUnsafeSupportText(description)) {
        errors.description = supportTextSecurityMessage;
    } else if (description.length < 20 || description.length > 2000) {
        errors.description = "Describe the issue in 20 to 2000 characters.";
    }

    if (Object.keys(errors).length > 0) {
        return NextResponse.json(
            { message: "Please check the required fields.", errors },
            { status: 400 }
        );
    }

    const headersList = await headers();
    const loginIp =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        headersList.get("cf-connecting-ip") ||
        "Unknown";
    let tokenData;
    try {
        tokenData = JSON.parse(token);
    } catch {
        return NextResponse.json({ message: "Your session is invalid. Please sign in again." }, { status: 401 });
    }

    const externalApiBaseUrl = process.env.API_BASE_URL;
    if (!externalApiBaseUrl) {
        return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
    }

    if (process.env.NODE_ENV !== "production") {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const externalApiUrl = `${externalApiBaseUrl.replace(/\/+$/, "")}/api/Support/support/Insert`;
    console.log("External API URL:", externalApiUrl);
    const payload = {
        uqId: candidate.candidateId,
        Role: candidate.role,
        Token: tokenData?.external?.accessToken,
        LoginIp: loginIp,
        fullName,
        category,
        subject,
        description,
    };
    console.log("Payload:", JSON.stringify(payload));
    try {
        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        const responseText = await externalResponse.text();
        let externalData = {};

        if (responseText) {
            try {
                externalData = JSON.parse(responseText);
            } catch {
                externalData = { message: responseText };
            }
        }

        if (!externalResponse.ok) {
            return NextResponse.json(
                {
                    message: externalData?.message || "The support API could not accept your request.",
                    errors: externalData?.errors,
                    external: externalData,
                },
                { status: externalResponse.status }
            );
        }

        return NextResponse.json(externalData, { status: externalResponse.status });
    } catch (error) {
        console.error("SUPPORT API ERROR:", error);
        const isUnauthorized = error.message === "Unauthorized";
        return NextResponse.json(
            { message: isUnauthorized ? "Your session has expired. Please sign in again." : "Unable to contact the support API." },
            { status: isUnauthorized ? 401 : 502 }
        );
    }
}