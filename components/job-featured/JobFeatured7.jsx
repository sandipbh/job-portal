'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";


const JobFeatured7 = () => {

  const [jobList, setJobList] = useState([]);

  useEffect(() => {
    getJobList();
  }, []);

  const getJobList = async () => {
    try {
      const response = await fetch("/api/home-job-list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      const listData = result?.data;
      console.log('listData  ', listData)

      if (listData) {


        setJobList(listData);

      }
    } catch (error) {
      console.error(error);
    }
  };
  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);

    const seconds = Math.floor((now - posted) / 1000);

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days === 1) {
      return "Yesterday";
    }
    if (days < 7) {
      return `${days} days ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 5) {
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  return (
    <>
      {jobList.slice(0, 5).map((item) => (
        <div className="job-block-five" key={item.id}>
          <div className="inner-box">
            <div className="content">

              <span className="company-logo">

                <Image
                  width={100}
                  height={75}
                  src={item.logo}
                  alt="item brand"
                />
              </span>
              <h4>
                <Link href={`/job-single-v2/${item.id}`}>{item.jobTitle}</Link>

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
                  <span className="icon flaticon-clock-3"></span> {getTimeAgo(item.time)}
                </li>
                {/* time info */}
                <li>
                  <span className="icon flaticon-money"></span> {item.salary}
                </li>
                {/* salary info */}
              </ul>
              {/* End .job-info */}
            </div>
            <ul className="job-other-info">
              {item.jobType.slice(0, 1).map((val, i) => (
                <li key={i} className={`${val.styleClass}`}>
                  {val.type}
                </li>
              ))}
            </ul>
            <Link
              href={`/job-single-v2/${item.id}`}
              className="theme-btn btn-style-four"
            >
              Apply Job
            </Link>
          </div>
        </div>
      ))}
    </>
  );
};

export default JobFeatured7;
