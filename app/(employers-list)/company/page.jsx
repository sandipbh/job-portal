import EmployersList from "@/components/employers-listing-pages/company";

export const metadata = {
  title: "Employers List V1 || RatinGrow - Hiring Verified",
  description: "RatinGrow - Hiring Verified",
};

const index = () => {
  return (
    <>
      <EmployersList />
    </>
  );
};

export default index;
