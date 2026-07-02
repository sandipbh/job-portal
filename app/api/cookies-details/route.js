import { NextResponse } from "next/server";
import { headers } from "next/headers";


export async function GET(req) {
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
    console.log("dashboard user User Role :", user);

    try {
        const response = NextResponse.json(
            {
                fullname: user.external.fullName || "",
                role: user.external.role || "",
                uqid: user.external.uqId || "",
                logo: user.external.logo || "",
            },
            { status: 201 }
        );
        return response;

    } catch (error) {

        return NextResponse.json(
            { data: "" },
            { status: 500 }
        );
    }
}


