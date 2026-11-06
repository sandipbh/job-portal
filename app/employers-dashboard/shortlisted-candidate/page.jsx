import ShortlistedCandidate from "@/components/dashboard-pages/employers-dashboard/shortlisted-candidate";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { Suspense } from "react";
export const metadata = {
    title: "Shortlisted Candidate || RatinGrow - Hiring Verified",
    description: "RatinGrow - Hiring Verified",
};

const index = () => {
    return (
        <>
            <Suspense fallback={<JobCardSkeleton />}>
                <ShortlistedCandidate />
            </Suspense>
        </>
    );
};

export default index;
