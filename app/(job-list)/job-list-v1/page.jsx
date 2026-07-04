import JobList from "@/components/job-listing-pages/job-list-v1";

export const metadata = {
  title: "Job List V1 || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = () => {
  return (
    <>
      <JobList />
    </>
  );
};

export default index;
