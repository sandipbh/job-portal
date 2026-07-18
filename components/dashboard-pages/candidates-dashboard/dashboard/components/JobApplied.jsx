'use client'
import Link from "next/link";
import recentJobApplied from "../../../../../data/job-featured";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatDate, getTimeAgo } from "@/lib/dateUtils";

const JobApplied = () => {

  const [jobList, setJobList] = useState([]);

  useEffect(() => {
    getAppliedJobs();
  }, []);

  const getAppliedJobs = async () => {
    try {
      const response = await fetch("/api/candi-applied-jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const result = await response.json();
      const listData = result?.data;

      console.log("Applied Jobs Data:", listData);
      if (listData) {
        setJobList(listData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>

      {jobList.slice(0, 4).map((item, index) => (
        <div className="job-block col-lg-6 col-md-12 col-sm-12" key={index}>
          <div className="inner-box">
            <div className="content">
              <span className="company-logo">
                <Image
                  width={100}
                  height={100}
                  src={item.logo}
                  alt="item brand"
                />
              </span>
              <h4>
                <Link href={`/job-single-v2/${item.id}`}>
                  {item.jobTitle}
                </Link>
              </h4>

              <ul className="job-info">
                <li>
                  <span className="icon flaticon-briefcase"></span>
                  {item.company}
                </li>
                {/* compnay info */}
                <li>
                  <span className="icon flaticon-map-locator"></span>
                  {item.location}
                </li>
                {/* location info */}
                <li>
                  <span className="icon flaticon-clock-3"></span>
                  {getTimeAgo(item.apply_at)}
                </li>
                {/* time info */}
                <li>
                  <span className="icon flaticon-money"></span> {item.salary}
                </li>
                {/* salary info */}
              </ul>
              {/* End .job-info */}

              <ul className="job-other-info">
                {item.jobType.map((val, i) => (
                  <li key={i} className={`${val.styleClass}`}>
                    {val.type}
                  </li>
                ))}
              </ul>
              {/* End .job-other-info */}

              <button className="bookmark-btn">
                <span className="flaticon-bookmark"></span>
              </button>
            </div>
          </div>
        </div>
        // End job-block
      ))}
    </>
  );
};

export default JobApplied;
