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
  const entrydata = getFindJobBySlug(slug);
  console.log('entrydata', entrydata)
  if (!entrydata) notFound();

  return <FindJobsPage key={slug} entry={entrydata} />;
};

export default Page;
