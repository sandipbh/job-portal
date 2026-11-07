
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

export const runtime = "nodejs";

const API_ENDPOINT = "/Employer/employer/SaveJoiningReview";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_STATUSES = ["Joined", "Absconding", "Not Joined"];
const ALLOWED_DOCUMENT_TYPES = ["Salary Slip", "Relieving Letter", "Experience Letter", "Other"];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];

const FORWARD_FIELDS = [
    "applicationId", "jobpostId", "candiUqId", "joiningStatus",
    "joiningDate", "abscondingDate", "abscondingReason", "joiningComments",
    "interviewAttendance", "technicalSkills", "communication", "behaviour",
    "professionalism", "offerCommitment", "wouldHireAgain", "reviewComments"
];

export async function POST(req) {
    try {
        // 1. Read authentication cookie
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
        const uqId = String(external?.uqId || "").trim();
        const token = String(external?.accessToken || "").trim();
        const role = String(external?.role || "").trim();

        if (!uqId || !token || !role) {
            return NextResponse.json({ isSuccess: false, message: "Authentication details are missing." }, { status: 401 });
        }

        if (role.toLowerCase() !== "employer") {
            return NextResponse.json({ isSuccess: false, message: "Only employer accounts can submit joining reviews." }, { status: 403 });
        }

        // 2. Read frontend multipart form
        const form = await req.formData();

        for (const field of ["applicationId", "jobpostId", "candiUqId", "joiningStatus"]) {
            if (!String(form.get(field) ?? "").trim()) {
                return NextResponse.json({ isSuccess: false, message: `${field} is required.` }, { status: 400 });
            }
        }

        const applicationId = Number(form.get("applicationId"));
        const jobpostId = Number(form.get("jobpostId"));
        const candiUqId = String(form.get("candiUqId")).trim();
        const joiningStatus = String(form.get("joiningStatus")).trim();

        if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid application ID." }, { status: 400 });
        }

        if (!Number.isSafeInteger(jobpostId) || jobpostId <= 0) {
            return NextResponse.json({ isSuccess: false, message: "Invalid job post ID." }, { status: 400 });
        }

        if (!ALLOWED_STATUSES.includes(joiningStatus)) {
            return NextResponse.json({ isSuccess: false, message: "Invalid joining status." }, { status: 400 });
        }

        // 3. Validate document types
        let documentTypes = [];

        try {
            documentTypes = JSON.parse(String(form.get("documentTypes") || "[]"));
        } catch {
            return NextResponse.json({ isSuccess: false, message: "Invalid document information." }, { status: 400 });
        }

        if (!Array.isArray(documentTypes) || !documentTypes.every(type => ALLOWED_DOCUMENT_TYPES.includes(type))) {
            return NextResponse.json({ isSuccess: false, message: "Invalid document type." }, { status: 400 });
        }

        // 4. Validate uploaded documents
        const documents = form.getAll("documents").filter(
            file => file instanceof File && file.size > 0
        );

        if (documents.length > MAX_FILES) {
            return NextResponse.json({ isSuccess: false, message: "Maximum 10 documents are allowed." }, { status: 400 });
        }

        if (documents.length !== documentTypes.length) {
            return NextResponse.json({ isSuccess: false, message: "Document information does not match uploaded files." }, { status: 400 });
        }

        for (const file of documents) {
            const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ isSuccess: false, message: `${file.name} exceeds the 5 MB limit.` }, { status: 400 });
            }

            if (!ALLOWED_EXTENSIONS.includes(extension)) {
                return NextResponse.json({ isSuccess: false, message: `Invalid file format: ${file.name}` }, { status: 400 });
            }
        }

        // 5. Read API configuration
        const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, "");

        if (!apiBaseUrl) {
            console.error("API_BASE_URL is not configured.");
            return NextResponse.json({ isSuccess: false, message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        // 6. Prepare ASP.NET Core multipart form
        const forwardForm = new FormData();

        for (const field of FORWARD_FIELDS) {
            const value = form.get(field);
            if (value !== null) forwardForm.append(field, String(value));
        }

        forwardForm.append("UqId", uqId);
        forwardForm.append("Token", token);
        forwardForm.append("Role", role);

        const loginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            "Unknown";

        forwardForm.append("LoginIp", loginIp);
        forwardForm.append("DocumentTypes", JSON.stringify(documentTypes));

        for (const file of documents) {
            forwardForm.append("Documents", file, file.name);
        }

        // 7. Call .NET API
        const targetUrl = `${apiBaseUrl}${API_ENDPOINT}`;

        console.log("Joining review API URL:", targetUrl);
        console.log("Application ID:", applicationId);
        console.log("Job Post ID:", jobpostId);
        console.log("Document count:", documents.length);

        let apiResponse;

        try {
            apiResponse = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: forwardForm,
                cache: "no-store"
            });
        } catch (error) {
            console.error("Joining review backend connection error:", error);
            return NextResponse.json({
                isSuccess: false,
                message: "Unable to connect to the .NET API.",
                details: error.message
            }, { status: 502 });
        }

        // 8. Read backend response
        const responseText = await apiResponse.text();

        console.log("Joining review backend status:", apiResponse.status);
        console.log("Joining review backend response:", responseText.substring(0, 1500));

        let result;

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            return NextResponse.json({
                isSuccess: false,
                message: "The .NET API returned an invalid response.",
                details: responseText.substring(0, 500)
            }, { status: 502 });
        }

        const success = result.isSuccess ?? result.success ?? false;
        const message = result.message ?? result.Message ?? (success ? "Joining review saved successfully." : "Unable to save joining review.");

        return NextResponse.json({
            ...result,
            isSuccess: Boolean(success),
            message
        }, { status: apiResponse.ok ? 200 : apiResponse.status });

    } catch (error) {
        console.error("Joining review Next.js route error:", error);

        return NextResponse.json({
            isSuccess: false,
            message: error.message || "Unable to save joining review."
        }, { status: 500 });
    }
}
