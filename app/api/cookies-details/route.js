import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const token = req.cookies.get("regToken")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = JSON.parse(token);
        const external = user?.external ?? {};

        const getValue = (obj, key) => {
            const actualKey = Object.keys(obj).find(
                k => k.toLowerCase() === key.toLowerCase()
            );
            return actualKey ? obj[actualKey] : 0;
        };

        const response = {
            fullname: external.fullName ?? "",
            role: external.role ?? "",
            uqid: external.uqId ?? "",
            logo: external.logo ?? "",
            countrycode: external.countrycode ?? "",
            IsSubscribe: external.IsSubscribe ?? external.isSubscribe ?? 0,
            BalanceView: external.BalanceView ?? external.balanceView ?? 0,
            BalanceShort: external.BalanceShort ?? external.balanceShort ?? 0,
            Advance1: getValue(external, "Advance1"),
            Advance2: getValue(external, "Advance2"),
            Advance3: getValue(external, "Advance3")
        };

        console.log("Employer menu permissions:", {
            Advance1: response.Advance1,
            Advance2: response.Advance2,
            Advance3: response.Advance3
        });

        return NextResponse.json(response, {
            status: 200,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        });
    } catch (error) {
        console.error("Cookie details error:", error);
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}