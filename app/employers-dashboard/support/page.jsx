import { cookies } from "next/headers";
import { getCandidateIdentityFromToken } from "@/lib/candidateIdentity";
import Support from "@/components/dashboard-pages/employers-dashboard/support";

export const metadata = {
    title: "Employer Support || RatinGrow - Hiring Verified",
    description: "Report an issue and track employer support requests.",
};

export default async function EmployerSupportPage() {
    const token = (await cookies()).get("regToken")?.value;
    const employer = getCandidateIdentityFromToken(token);

    return (
        <Support
            employerFullName={employer.fullName}
        />
    );
}
