
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const token = req.cookies.get("regToken")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = JSON.parse(token);
        const external = user?.external ?? {};

        const getValue = (obj, key) => {
            const actualKey = Object.keys(obj || {}).find(k => k.toLowerCase() === key.toLowerCase());
            return actualKey ? obj[actualKey] : 0;
        };

        const isTrue = value => ["1", "true", "yes"].includes(String(value ?? "").toLowerCase());

        const response = {
            fullname: external.fullName ?? "",
            role: external.role ?? "",
            uqid: external.uqId ?? "",
            logo: external.logo ?? "",
            countrycode: external.countrycode ?? "",
            IsSubscribe: isTrue(getValue(external, "IsSubscribe")),
            BalanceView: Number(getValue(external, "BalanceView")) || 0,
            BalanceShort: Number(getValue(external, "BalanceShort")) || 0,
            Advance1: getValue(external, "Advance1"),
            Advance2: getValue(external, "Advance2"),
            Advance3: getValue(external, "Advance3")
        };

        return NextResponse.json(response, {
            status: 200,
            headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
        });
    } catch (error) {
        console.error("Cookie details error:", error);
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}
