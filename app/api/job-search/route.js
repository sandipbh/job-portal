
import { NextResponse } from "next/server";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const getEncryptionKey = () => {
    const secret = process.env.JOB_SEARCH_ENCRYPTION_KEY || process.env.AUTH_SECRET;
    if (!secret) throw new Error("JOB_SEARCH_ENCRYPTION_KEY or AUTH_SECRET must be configured.");
    return createHash("sha256").update(secret).digest();
};

const encryptFilters = (filters) => {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(filters), "utf8"),
        cipher.final()
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
};

const decryptFilters = (token) => {
    const payload = Buffer.from(token, "base64url");
    if (payload.length < 29) throw new Error("Invalid search token.");

    const iv = payload.subarray(0, 12);
    const authTag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);

    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]).toString("utf8");

    return JSON.parse(decrypted);
};

// CREATE ENCRYPTED SEARCH TOKEN
export async function POST(req) {
    try {
        const body = await req.json();

        const filters = {
            keywords: Array.isArray(body?.keywords)
                ? body.keywords
                    .filter(item => item?.key != null)
                    .map(item => ({
                        key: String(item.key),
                        type: String(item.type || "")
                    }))
                : [],
            location: body?.location == null ? "" : String(body.location),
            category: body?.category == null ? "" : String(body.category),
            jobTitleKeyword: body?.jobTitleKeyword == null
                ? ""
                : String(body.jobTitleKeyword).trim(),
            keywordKeyword: body?.keywordKeyword == null
                ? ""
                : String(body.keywordKeyword).trim()
        };

        console.log("SEARCH FILTERS BEFORE ENCRYPTION:", filters);

        return NextResponse.json({
            token: encryptFilters(filters)
        });
    } catch (error) {
        console.error("SEARCH TOKEN ERROR:", error);

        return NextResponse.json(
            { message: error.message || "Failed to create search token." },
            { status: 500 }
        );
    }
}

// DECRYPT TOKEN AND CALL DOT NET API
export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;

    const token = searchParams.get("search");
    const pageNumber = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
    const requestedPageSize = Number.parseInt(searchParams.get("pageSize") || "20", 10);
    const pageSize = requestedPageSize > 0 ? Math.min(requestedPageSize, 100) : 20;

    let filters = {
        keywords: [],
        location: "",
        category: "",
        jobTitleKeyword: "",
        keywordKeyword: ""
    };

    if (token) {
        try {
            const decryptedFilters = decryptFilters(token);
            filters = {
                ...filters,
                ...decryptedFilters
            };
        } catch (error) {
            console.error("SEARCH DECRYPT ERROR:", error);

            return NextResponse.json(
                { message: "Invalid or expired search query." },
                { status: 400 }
            );
        }
    }

    filters.keywords = Array.isArray(filters.keywords) ? filters.keywords : [];

    const kind = (searchParams.get("kind") || "").trim().toLowerCase();
    const term = (searchParams.get("term") || "").trim();

    let jobTitleKeyword = String(filters.jobTitleKeyword || "").trim();
    let locationKeyword = "";
    let keywordKeyword = String(filters.keywordKeyword || "").trim();

    // CATEGORY, KEYWORD AND LOCATION ARE SEPARATE FILTERS
    if (term) {
        if (kind === "category") {
            jobTitleKeyword = term;
        } else if (kind === "keyword") {
            keywordKeyword = term;
        } else if (kind === "location") {
            locationKeyword = term;
            filters.location = "";
        }
    }

    const queryLocation = searchParams.get("location");

    if (queryLocation !== null && kind !== "location") {
        filters.location = queryLocation;
    }

    try {
        const externalApiBaseUrl = process.env.API_BASE_URL?.trim().replace(/\/+$/, "");

        if (!externalApiBaseUrl) {
            return NextResponse.json(
                { message: "API_BASE_URL is not configured." },
                { status: 500 }
            );
        }

        const payload = {};

        filters.keywords.forEach(keyword => {
            if (!keyword?.type || !keyword?.key) return;

            const fieldName = keyword.type.toLowerCase() === "skill"
                ? "skill"
                : keyword.type;

            payload[fieldName] = payload[fieldName]
                ? `${payload[fieldName]},${keyword.key}`
                : keyword.key;
        });

        if (filters.location) payload.Location = filters.location;
        if (filters.category) payload.Category = filters.category;

        // CATEGORY FILTER
        if (jobTitleKeyword) {
            payload.JobTitleKeyword = jobTitleKeyword;
        }

        // LOCATION FILTER
        if (locationKeyword) {
            payload.LocationKeyword = locationKeyword;
        }

        // DATABASE KEYWORD FILTER
        if (keywordKeyword) {
            payload.KeywordKeyword = keywordKeyword;
        }

        payload.PageNumber = String(pageNumber);
        payload.PageSize = String(pageSize);

        console.log("DECRYPTED SEARCH FILTERS:", filters);
        console.log("SEARCH KIND:", kind);
        console.log("SEARCH TERM:", term);
        console.log("JOB TITLE KEYWORD:", jobTitleKeyword);
        console.log("LOCATION KEYWORD:", locationKeyword);
        console.log("DATABASE KEYWORD:", keywordKeyword);
        console.log("FINAL DOT NET API PAYLOAD:", payload);

        const externalApiUrl = `${externalApiBaseUrl}/api/Public/getFindJobList`;

        const externalResponse = await fetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(payload),
            cache: "no-store"
        });

        const externalText = await externalResponse.text();

        let externalData;

        try {
            externalData = JSON.parse(externalText);
        } catch {
            return NextResponse.json({
                isSuccess: false,
                message: "The .NET API returned an invalid response.",
                apiStatus: externalResponse.status,
                details: externalText.substring(0, 1000)
            }, { status: 502 });
        }

        if (!externalResponse.ok) {
            return NextResponse.json({
                isSuccess: false,
                message: externalData?.message || "The .NET API request failed.",
                apiStatus: externalResponse.status,
                details: externalData
            }, { status: externalResponse.status });
        }

        return NextResponse.json(externalData);

    } catch (error) {
        console.error("JOB SEARCH API ERROR:", error);

        return NextResponse.json(
            {
                message: "Failed to fetch search results.",
                details: error.message
            },
            { status: 500 }
        );
    }
}
