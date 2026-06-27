import { Suspense } from "react";
import PostJob from "@/components/dashboard-pages/employers-dashboard/post-jobs";

export const metadata = {
  title: "Post Jobs || Superio - Job Borad React NextJS Template",
  description: "Superio - Job Borad React NextJS Template",
};

const index = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <PostJob />
      </Suspense>
    </>
  );
};

export default index;
