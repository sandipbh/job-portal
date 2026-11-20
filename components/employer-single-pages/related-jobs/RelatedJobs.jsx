
"use client";

import Link from "next/link";
import Image from "next/image";
import { encodeJobId } from "@/lib/jobIdCrypto";

const RelatedJobs = ({ jobs = [] }) => {
  if (!jobs.length) return null;

  const formatDate = (dateValue) => {
    if (!dateValue) return "Recently posted";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Recently posted";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      {jobs.map((item, index) => {
        const jobId = item.id ?? item.jobId ?? item.jobPostId;
        const jobTypes = Array.isArray(item.jobType) ? item.jobType : [];

        return (
          <div className="job-block" key={jobId ?? index}>
            <div className="inner-box">
              <div className="content">
                <span className="company-logo">
                  {item.logo ? (
                    <Image
                      width={50}
                      height={49}
                      src={item.logo}
                      alt={`${item.company || "Company"} logo`}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <span>{String(item.company || "C").charAt(0)}</span>
                  )}
                </span>
                <h4>
                  {jobId != null ? (
                    <Link href={`/job-single-v2/${encodeJobId(jobId)}`}>
                      {item.jobTitle || "Untitled Job"}
                    </Link>
                  ) : (
                    item.jobTitle || "Untitled Job"
                  )}
                </h4>
                <ul className="job-info">
                  <li><span className="icon flaticon-briefcase"></span>{item.company}</li>
                  <li><span className="icon flaticon-map-locator"></span>{item.location || "Location not specified"}</li>
                  <li>
                    <span className="icon flaticon-clock-3"></span>
                    {formatDate(item.time || item.created_at || item.createdAt)}
                  </li>
                  <li><span className="icon flaticon-money"></span>{item.salary || "Not disclosed"}</li>
                </ul>
                <ul className="job-other-info">
                  {jobTypes.map((val, i) => (
                    <li key={i} className={val.styleClass || "time"}>{val.type}</li>
                  ))}
                </ul>
                {/* <button type="button" className="bookmark-btn">
                  <span className="flaticon-bookmark"></span>
                </button> */}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default RelatedJobs;
