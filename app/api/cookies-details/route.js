import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const token = req.cookies.get("regToken")?.value;

        if (!token) {
            return NextResponse.json({}, { status: 401 });
        }

        const user = JSON.parse(token);

        return NextResponse.json(
            {
                fullname: user?.external?.fullName ?? "",
                role: user?.external?.role ?? "",
                uqid: user?.external?.uqId ?? "",
                logo: user?.external?.logo ?? "",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Invalid token" },
            { status: 401 }
        );
    }
}