import { Suspense } from "react";
import JobList from "@/components/job-listing-pages/job-list-v3";

export const metadata = {
  title: "Job List V3 || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = () => {
  return (
    <>
      <Suspense fallback={null}>
        <JobList />
      </Suspense>
    </>
  );
};

export default index;
