import { Suspense } from "react";
import CandidatesSearches from "@/components/dashboard-pages/employers-dashboard/candidates-search";
import JobCardSkeleton from "@/components/skeleton/Job-list";


export const metadata = {
  title: "All Applicants || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = ({ searchParams }) => {
  let initialSearchData = null;

  try {
    if (searchParams?.searchData) {
      initialSearchData = JSON.parse(decodeURIComponent(searchParams.searchData));
    }
  } catch (error) {
    console.error("Failed to parse search data:", error);
  }

  return (
    <>
      <Suspense fallback={<JobCardSkeleton />}>
        <CandidatesSearches initialSearchData={initialSearchData} />
      </Suspense>
    </>
  );
};

export default index;
