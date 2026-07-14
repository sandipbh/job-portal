import ShortlistedResumes from "@/components/dashboard-pages/employers-dashboard/shortlisted-resumes";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import { Suspense } from "react";
export const metadata = {
  title: "Shortlisted Resumes || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = () => {
  return (
    <>
      <Suspense fallback={<JobCardSkeleton />}>
        <ShortlistedResumes />
      </Suspense>

    </>
  );
};

export default index;
