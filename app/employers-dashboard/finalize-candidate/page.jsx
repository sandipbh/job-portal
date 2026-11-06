import FinalizeCandidate from "@/components/dashboard-pages/employers-dashboard/finalize-candidate";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { Suspense } from "react";
export const metadata = {
    title: "Finalize Candidate || RatinGrow - Hiring Verified",
    description: "RatinGrow - Hiring Verified",
};

const index = () => {
    return (
        <>
            <Suspense fallback={<JobCardSkeleton />}>
                <FinalizeCandidate />
            </Suspense>
        </>
    );
};

export default index;
