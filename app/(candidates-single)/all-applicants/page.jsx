import Seo from "../../../components/common/Seo";
import AllApplicants from "../../../components/dashboard-pages/employers-dashboard/all-applicants";
import { Suspense } from "react";
import JobCardSkeleton from "@/components/skeleton/Job-list";



export const metadata = {
  title: "All Applicants || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = () => {
  return (
    <>
      <Suspense fallback={<JobCardSkeleton />}>
        <AllApplicants />
      </Suspense>
    </>
  );
};

export default index;
