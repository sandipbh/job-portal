'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate, getTimeAgo } from "@/lib/dateUtils";
import Image from "next/image";

const RelatedJobs3 = ({ id }) => {

  let jobId = id ?? 0;
  const [jobRelated, setJobRelated] = useState([]);


  useEffect(() => {
    getJobRelated();
  }, [jobId]);
  const getJobRelated = async () => {

    setJobRelated([]);
    if (jobId != 0) {

      try {

        const response = await fetch(`/api/job-list-related?JobPostId=${jobId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });

        const result = await response.json();

        const listData = result?.data;
        //  console.log('Job Details  ', JSON.stringify(listData))

        if (listData) {

          setJobRelated(listData);
        }

      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      {

        jobRelated.length > 0 && (
          <>
            {jobRelated.map((item) => (
              <div
                className="job-block-four col-lg-12 col-md-12 col-sm-12"
                key={item.id}
              >
                <div className="inner-box">
                  <ul className="job-other-info">
                    {item.jobType.map((val, i) => (
                      <li key={i} className={`${val.styleClass}`}>
                        {val.type}
                      </li>
                    ))}
                  </ul>
                  <span className="company-logo" style={{ width: "80px", height: "60px" }}>
                    <Image
                      width={80}
                      height={60}
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

export default RelatedJobs3;
