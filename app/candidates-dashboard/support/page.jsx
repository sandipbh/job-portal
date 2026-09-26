import { cookies } from "next/headers";
import { getCandidateIdentityFromToken } from "@/lib/candidateIdentity";
import Support from "@/components/dashboard-pages/candidates-dashboard/support";

export const metadata = {
    title: "Candidate Support || RatinGrow - Hiring Verified",
    description: "Report an issue and track candidate support requests.",
};

export default async function CandidateSupportPage() {
    const token = (await cookies()).get("regToken")?.value;
    const candidate = getCandidateIdentityFromToken(token);

    return (
        <Support
            candidateFullName={candidate.fullName}
        />
    );
}