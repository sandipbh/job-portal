import { Suspense } from "react";
import PostJob from "@/components/dashboard-pages/employers-dashboard/post-jobs";


import JobCardSkeleton from "@/components/skeleton/Job-list";

export const metadata = {
  title: "Post Jobs || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = () => {
  return (
    <>
      <Suspense fallback={<JobCardSkeleton />}>
        <PostJob />
      </Suspense>
    </>
  );
};

export default index;
