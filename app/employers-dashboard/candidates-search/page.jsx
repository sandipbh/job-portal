import { Suspense } from "react";
import CandidatesSearches from "@/components/dashboard-pages/employers-dashboard/candidates-search";
import JobCardSkeleton from "@/components/skeleton/Job-list";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Applicants || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const Index = async ({ searchParams }) => {
  let initialSearchData = null;

  try {
    const params = await searchParams;

    if (params?.searchData) {
      initialSearchData = JSON.parse(params.searchData);
    }
  } catch (error) {
    console.error("Failed to parse search data:", error);
  }

  return (
    <>
      <Suspense fallback={<JobCardSkeleton />}>
        <CandidatesSearches
          initialSearchData={initialSearchData}
        />
      </Suspense>
    </>
  );
};

export default Index;