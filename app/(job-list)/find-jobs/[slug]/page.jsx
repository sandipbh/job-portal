import { notFound } from "next/navigation";
import FindJobsPage from "@/components/job-listing-pages/find-jobs";
import { getFindJobBySlug } from "@/data/findJobsData";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getFindJobBySlug(slug);
  return {
    title: `${entry?.name ?? "Find Jobs"} || RatinGrow - Hiring Verified`,
    description: "RatinGrow - Hiring Verified",
  };
}

const Page = async ({ params }) => {
  const { slug } = await params;
  const entry = getFindJobBySlug(slug);
  if (!entry) notFound();

  return <FindJobsPage entry={entry} />;
};

export default Page;
