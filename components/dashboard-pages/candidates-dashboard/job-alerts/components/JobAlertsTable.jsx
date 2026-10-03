'use client';
import { encodeJobId } from "@/lib/jobIdCrypto";
import { useEffect, useState } from "react";
import Link from "next/link.js";
import { formatDate, getTimeAgo } from "@/lib/dateUtils";
import JobCardSkeleton from "@/components/skeleton/Job-list";
import Image from "next/image.js";
import jobs from "../../../../../data/job-featured.js";


const JobAlertsTable = () => {


  const [jobList, setJobList] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    getJobList();
  }, []);

  const getJobList = async () => {
    try {
      const response = await fetch("/api/candi-alert-job-list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      const listData = result?.data;
      //console.log('listData  ', listData)

      if (listData) {

        setJobList(listData);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };




  return (
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Job Alerts</h4>

        <div className="chosen-outer">
          {/* <!--Tabs Box--> */}
          <select className="chosen-single form-select">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>Last 16 Months</option>
            <option>Last 24 Months</option>
            <option>Last 5 year</option>
          </select>
        </div>
      </div>
      {/* End filter top bar */}

      {/* Start table widget content */}
      <div className="widget-content">
        <div className="table-outer">
          <div className="table-outer">
            <>
              {
                loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                  ))
                ) : jobList?.length > 0 ? (
                  <>
                    {jobList.map((item) => (
                      <div className="job-block-five" key={item.id}>
                        <div className="inner-box " style={{ padding: "10px 12px" }}>
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
                              <Link href={`/job-single-v2/${encodeJobId(item.id)}`}>{item.jobTitle}</Link>

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
                            href={`/job-single-v2/${encodeJobId(item.id)}`}
                            className="theme-btn btn-style-three"
                          >
                            View Job
                          </Link>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p>No job alerts found.</p>
                )
              }
            </>
          </div>
        </div>
      </div>
      {/* End table widget content */}
    </div>
  );
};

export default JobAlertsTable;
