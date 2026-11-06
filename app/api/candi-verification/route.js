
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";

export async function POST(req) {
    try {
        const headersList = await headers();
        const tokenCookie = req.cookies.get("regToken")?.value;
        let user = {};
        try {
            user = tokenCookie ? JSON.parse(tokenCookie) : {};
        } catch {
            return NextResponse.json({ message: "Invalid login session. Please log in again." }, { status: 401 });
        }

        const uqId = user?.external?.uqId;
        const role = user?.external?.role;
        const token = user?.external?.accessToken;
        if (!uqId || !role || !token) {
            return NextResponse.json({ message: "Your login has expired. Please log in again." }, { status: 401 });
        }

        const incoming = await req.formData();
        const verificationType = String(incoming.get("verificationType") || "").trim().toLowerCase();
        if (verificationType !== "both") {
            return NextResponse.json({ message: "Identity document and LinkedIn URL are both required." }, { status: 400 });
        }

        const documentType = String(incoming.get("documentType") || "").trim();
        const documentNumber = String(incoming.get("documentNumber") || "").trim();
        const documentFile = incoming.get("documentFile");
        const linkedinUrl = String(incoming.get("linkedinUrl") || "").trim();

        if (!documentType || !documentNumber || !documentFile || typeof documentFile === "string") {
            return NextResponse.json({ message: "Document type, number and file are required." }, { status: 400 });
        }
        if (documentType.length > 50 || documentNumber.length > 50) {
            return NextResponse.json({ message: "Document type or number exceeds the allowed length." }, { status: 400 });
        }
        if (documentFile.size <= 0 || documentFile.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: "File size must be greater than 0 and must not exceed 5 MB." }, { status: 400 });
        }

        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(documentFile.type)) {
            return NextResponse.json({ message: "Only JPG, PNG and PDF files are allowed." }, { status: 400 });
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(linkedinUrl);
        } catch {
            return NextResponse.json({ message: "Enter a valid LinkedIn profile URL." }, { status: 400 });
        }

        if (
            !["http:", "https:"].includes(parsedUrl.protocol) ||
            !["linkedin.com", "www.linkedin.com"].includes(parsedUrl.hostname.toLowerCase()) ||
            parsedUrl.username ||
            parsedUrl.password ||
            parsedUrl.search ||
            parsedUrl.hash ||
            !/^\/in\/[a-zA-Z0-9_%~-]+\/?$/.test(parsedUrl.pathname) ||
            linkedinUrl.length > 100
        ) {
            return NextResponse.json({ message: "Enter a valid LinkedIn profile URL, such as https://www.linkedin.com/in/username/." }, { status: 400 });
        }

        const bytes = Buffer.from(await documentFile.arrayBuffer());
        if (bytes.length < 1) {
            return NextResponse.json({ message: "The uploaded document is empty." }, { status: 400 });
        }

        const validSignature = documentFile.type === "image/jpeg"
            ? bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
            : documentFile.type === "image/png"
                ? bytes.length >= 8 && Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]).equals(bytes.subarray(0, 8))
                : bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-";

        if (!validSignature) {
            return NextResponse.json({ message: "The uploaded file content does not match its file type." }, { status: 400 });
        }

        const loginIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
            || headersList.get("x-real-ip")
            || headersList.get("cf-connecting-ip")
            || "Unknown";

        const outgoing = {
            uqId,
            Token: token,
            Role: role,
            LoginIp: loginIp,
            verificationType: "both",
            verifyStatus: "Pending",
            documentType,
            documentNumber,
            documentFile: `data:${documentFile.type};base64,${bytes.toString("base64")}`,
            linkedinUrl
        };

        const baseUrl = process.env.API_BASE_URL;
        if (!baseUrl) {
            return NextResponse.json({ message: "API_BASE_URL is not configured." }, { status: 500 });
        }

        const apiUrl = `${baseUrl.replace(/\/+$/, "")}/Candidate/candi/Verification`;
        const externalResponse = await apiFetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(outgoing)
        });

        const responseText = await externalResponse.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { message: responseText || "Unexpected API response." };
        }

        if (!externalResponse.ok || data.success === false || data.isSuccess === false) {
            return NextResponse.json(
                { message: data.message || "Verification submission failed." },
                { status: externalResponse.ok ? 400 : externalResponse.status }
            );
        }

        return NextResponse.json(
            { message: data.message || "Verification submitted successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("CANDIDATE VERIFICATION ERROR:", error);
        return NextResponse.json({ message: "Unable to submit verification." }, { status: 500 });
    }
}
