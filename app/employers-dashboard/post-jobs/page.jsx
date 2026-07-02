import { Suspense } from "react";
import PostJob from "@/components/dashboard-pages/employers-dashboard/post-jobs";


import JobCardSkeleton from "@/components/skeleton/Job-list";

export const metadata = {
  title: "Post Jobs || Superio - Job Borad React NextJS Template",
  description: "Superio - Job Borad React NextJS Template",
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
