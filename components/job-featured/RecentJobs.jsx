'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import JobCardSkeleton from "@/components/skeleton/Job-list";

const RecentJobs = () => {

  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobList();
  }, []);

  const getJobList = async () => {
    try {
      const response = await fetch("/api/home-job-recent", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      const listData = result?.data;
      console.log('listData  recent ', listData)

      if (listData) {

        setJobList(listData);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))
        : (
          <>
            {jobList.map((item) => (
              <div className="job-block-four" key={item.id}>
                <div className="inner-box">

                  <ul className="job-other-info">

                    {item.jobType.map((val, i) => (

                      <li key={i} className={`${val.styleClass}`}>
                        {val.type}
                      </li>
                    ))}
                  </ul>
                  <span className="company-logo">
                    <Image
                      width={90}
                      height={90}
                      src={item.logo}
                      alt="featured job"
                    />
                  </span>
                  <span className="company-name">{item.company}</span>
                  <h4>
                    <Link href={`/job-single-v2/${item.id}`}>{item.jobTitle}</Link>
                  </h4>
                  <div className="location">
                    <span className="icon flaticon-map-locator"></span>
                    {item.location}
                  </div>
                </div>
              </div>
              // End job-block
            ))}
          </>
        )}
    </>
  );
};

export default RecentJobs;
