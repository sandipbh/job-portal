'use client'
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";


const RecentJobs = () => {

  const [jobList, setJobList] = useState([]);

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

      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {jobList.map((item) => (
        <div className="job-block-four" key={item.id}>
          <div className="inner-box">
            <span>{item.jobType.length}</span>
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
              <Link href={`/job-single-v3/${item.id}`}>{item.jobTitle}</Link>
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
  );
};

export default RecentJobs;
