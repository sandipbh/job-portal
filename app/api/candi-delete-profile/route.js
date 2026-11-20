import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("regToken")?.value;

        if (!tokenCookie) {
            return NextResponse.json({ status: false, message: "Session expired. Please login again." }, { status: 401 });
        }

        let user;
        try {
            user = JSON.parse(tokenCookie);
        } catch {
            return NextResponse.json({ status: false, message: "Invalid session. Please login again." }, { status: 401 });
        }

        const external = user?.external;
        const uqId = external?.uqId;
        const accessToken = external?.accessToken;

        if (!uqId || !accessToken) {
            return NextResponse.json({ status: false, message: "Candidate session details not found." }, { status: 401 });
        }

        const response = await fetch(`${process.env.API_BASE_URL}/Candidate/candi/DeleteProfile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ UQ_ID: uqId }),
            cache: "no-store"
        });

        const result = await response.json();

        if (!response.ok || !result?.status) {
            return NextResponse.json({
                status: false,
                message: result?.message || "Unable to delete your profile."
            }, { status: response.status || 400 });
        }

        cookieStore.set("regToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0
        });

        return NextResponse.json({
            status: true,
            message: result.message || "Your profile has been deleted successfully."
        });
    } catch (error) {
        console.error("Delete candidate profile error:", error);
        return NextResponse.json({
            status: false,
            message: "Something went wrong while deleting your profile."
        }, { status: 500 });
    }
}