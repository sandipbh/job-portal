import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { apiFetch } from "../apiFetch";


export async function POST(req) {
    const headersList = await headers();

    const token = req.cookies.get("regToken")?.value;
    const url = req.nextUrl.pathname;

    let user = {};
    try {
        user = JSON.parse(token);
    } catch (err) {
        console.error("Invalid JSON token:", err);
        user = {};
    }
    //console.log("dashboard user User Role :", user.external.role);


    const {
        term
    } = await req.json();
    //const term = req.nextUrl.searchParams.get("term") || "";

    //console.log("Search term:", term);

    try {



        const LoginIp =
            headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            headersList.get("x-real-ip") ||
            headersList.get("cf-connecting-ip") ||
            "Unknown";

        const loginBody = {
            uqId: user.external.uqId,
            term: term,
            LoginIp: LoginIp,
            Role: user.external.role,
            Token: user.external.accessToken,
        };
        //console.log("body Data:", loginBody);

        // Allow self-signed certs in local development only.
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
        // console.log("External API Base URL 00:", externalApiBaseUrl);

        const externalApiUrl =
            process.env.REGISTER_API_URL ||
            `${externalApiBaseUrl.replace(/\/+$/, "")}/api/MasterList/industryList`;

        // console.log("External API URL :", externalApiUrl);
        // console.log("External API Request Body:", loginBody);

        const externalResponse = await apiFetch(externalApiUrl, {
            method: "POST",
            body: JSON.stringify(loginBody),
        });

        const responseData = JSON.parse(await externalResponse.text());

        const response = NextResponse.json(
            {
                data: responseData || [],
            },
            { status: 201 }
        );
        return response;

    } catch (error) {
        console.error("UPDATE ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch universities" },
            { status: 500 }
        );
    }
}


