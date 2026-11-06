import InterviewSchedule from "@/components/dashboard-pages/employers-dashboard/interview-schedule";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { Suspense } from "react";
export const metadata = {
    title: "Interview Schedule || RatinGrow - Hiring Verified",
    description: "RatinGrow - Hiring Verified",
};

const index = () => {
    return (
        <>
            <Suspense fallback={<JobCardSkeleton />}>
                <InterviewSchedule />
            </Suspense>

        </>
    );
};

export default index;
