import { NextResponse } from "next/server";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const getEncryptionKey = () => {
    const secret = process.env.JOB_SEARCH_ENCRYPTION_KEY || process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error("JOB_SEARCH_ENCRYPTION_KEY or AUTH_SECRET must be configured.");
    }

    return createHash("sha256").update(secret).digest();
};

const encryptFilters = (filters) => {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(filters), "utf8"),
        cipher.final(),
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
        decipher.final(),
    ]).toString("utf8");

    return JSON.parse(decrypted);
};

export async function POST(req) {
    try {
        const body = await req.json();
        const filters = {
            keywords: Array.isArray(body?.keywords)
                ? body.keywords
                    .filter((item) => item?.key != null)
                    .map((item) => ({
                        key: String(item.key),
                        type: String(item.type || ""),
                    }))
                : [],
            location: body?.location == null ? "" : String(body.location),
            category: body?.category == null ? "" : String(body.category),
        };

        return NextResponse.json({ token: encryptFilters(filters) });
    } catch (error) {
        console.error("JOB SEARCH ENCRYPTION ERROR:", error);
        return NextResponse.json(
            { message: error.message || "Failed to create search token." },
            { status: 500 }
        );
    }
}

// GET Method - Public job search
export async function GET(req) {
    const token = req.nextUrl.searchParams.get("search");
    const pageNumber = Math.max(
        1,
        Number.parseInt(req.nextUrl.searchParams.get("page") || "1", 5) || 1
    );
    const requestedPageSize = Number.parseInt(
        req.nextUrl.searchParams.get("pageSize") || "5",
        10
    );
    const pageSize = [5, 20, 30].includes(requestedPageSize)
        ? requestedPageSize
        : 5;
    let filters = { keywords: [], location: "", category: "" };

    if (token) {
        try {
            filters = decryptFilters(token);
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid or expired search query." },
                { status: 400 }
            );
        }
    }

    const queryLocation = req.nextUrl.searchParams.get("location");
    if (queryLocation !== null) filters.location = queryLocation;

    try {
        // Allow self-signed certs in local development only
        if (process.env.NODE_ENV !== "production") {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        const externalApiBaseUrl = process.env.API_BASE_URL;

        if (!externalApiBaseUrl) {
            return NextResponse.json(
                { message: "API_BASE_URL is not configured." },
                { status: 500 }
            );
        }

        const payload = {};
        filters.keywords.forEach((keyword) => {
            if (!keyword.type) return;

            const fieldName = keyword.type.toLowerCase() === "skill"
                ? "skill"
                : keyword.type;
            payload[fieldName] = payload[fieldName]
                ? `${payload[fieldName]},${keyword.key}`
                : keyword.key;
        });
        if (filters.location) payload.Location = filters.location;
        if (filters.category) {
            const categoryId = Number(filters.category);
            payload.Category = Number.isNaN(categoryId)
                ? filters.category
                : categoryId;
        }
        payload.PageNumber = pageNumber;
        payload.PageSize = pageSize;
        console.log("Search Payload:", JSON.stringify(payload));

        const externalApiUrl = `${externalApiBaseUrl.replace(/\/+$/, "")}/api/Public/getFindJobList`;

        const externalResponse = await fetch(externalApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
            cache: "no-store",
        });

        if (!externalResponse.ok) {
            return NextResponse.json(
                {
                    message: "Failed to fetch data",
                    status: externalResponse.status,
                },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();

        const resultData = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.data)
                ? responseData.data
                : [];
        const responsePage = Number(responseData?.page);
        const page = Number.isFinite(responsePage) && responsePage > 0
            ? responsePage
            : pageNumber;
        const responsePageSize = Number(responseData?.pageSize);
        const actualPageSize = Number.isFinite(responsePageSize) && responsePageSize > 0
            ? responsePageSize
            : pageSize;
        const rawTotalCount = responseData?.totalCount ??
            responseData?.totalRecords ??
            responseData?.total;
        const parsedTotalCount = Number(rawTotalCount);
        const totalCount = rawTotalCount != null && Number.isFinite(parsedTotalCount)
            ? parsedTotalCount
            : null;
        const upstreamHasMore = typeof responseData?.hasMore === "boolean"
            ? responseData.hasMore
            : null;
        const listData = resultData.length > pageSize
            ? resultData.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
            : resultData;
        const hasMore = upstreamHasMore ?? (
            totalCount !== null && Number.isFinite(totalCount)
                ? page * actualPageSize < totalCount
                : listData.length === actualPageSize
        );

        return NextResponse.json(
            {
                data: listData,
                page,
                pageSize: actualPageSize,
                totalCount,
                hasMore,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET ERROR:", error);

        return NextResponse.json(
            {
                message: "Failed to fetch search results",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
