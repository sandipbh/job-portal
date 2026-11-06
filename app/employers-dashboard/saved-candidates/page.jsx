import SavedCandidates from "@/components/dashboard-pages/employers-dashboard/saved-candidates";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { Suspense } from "react";
export const metadata = {
    title: "Saved Candidate || RatinGrow - Hiring Verified",
    description: "RatinGrow - Hiring Verified",
};

const index = () => {
    return (
        <>
            <Suspense fallback={<JobCardSkeleton />}>
                <SavedCandidates />
            </Suspense>

        </>
    );
};

export default index;
