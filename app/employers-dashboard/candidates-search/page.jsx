import { Suspense } from "react";
import CandidatesSearches from "@/components/dashboard-pages/employers-dashboard/candidates-search";
import JobCardSkeleton from "@/components/skeleton/Job-list";


export const metadata = {
  title: "All Applicants || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = () => {
  return (
    <>

      <Suspense fallback={<JobCardSkeleton />}>
        <CandidatesSearches />
      </Suspense>
    </>
  );
};

export default index;
