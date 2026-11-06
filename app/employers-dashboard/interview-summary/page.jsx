// import { InterviewSummary } from "@/components/dashboard-pages/employers-dashboard/interview-summary";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { Suspense } from "react";
export const metadata = {
    title: "Interview Summary || RatinGrow - Hiring Verified",
    description: "RatinGrow - Hiring Verified",
};

const index = () => {
    return (
        <>
            <Suspense fallback={<JobCardSkeleton />}>
                {/* <InterviewSummary /> */}
            </Suspense>
        </>
    );
};

export default index;
