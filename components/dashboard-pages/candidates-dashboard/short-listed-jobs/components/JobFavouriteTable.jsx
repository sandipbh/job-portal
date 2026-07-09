'use client';

import { useEffect, useState } from "react";

import Link from "next/link.js";
import { formatDate, getTimeAgo } from "@/lib/dateUtils";
import Image from "next/image.js";

const JobFavouriteTable = () => {

  const [jobList, setJobList] = useState([]);


  useEffect(() => {
    getShortListedJobs();
  }, []);

  const getShortListedJobs = async () => {
    try {
      const response = await fetch("/api/candi-applied-jobs-shortlisted", {
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
    <div className="tabs-box">
      <div className="widget-title">
        <h4>My Favorite Jobs</h4>

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
            <table className="default-table manage-job-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th> Applied Date</th>
                  <th>Status</th>
                  <th>Posted Date</th>
                  <th>JobType</th>
                </tr>
              </thead>

              <tbody>
                {jobList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {/* <!-- Job Block --> */}
                      <div className="job-block">
                        <div className="inner-box">
                          <div className="content">
                            <span className="company-logo">
                              <Image
                                width={75}
                                height={75}
                                src={item.logo}
                                alt="logo"
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
                              <li>
                                <span className="icon flaticon-map-locator"></span>
                                {item.location}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{getTimeAgo(item.apply_at)}</td>
                    <td className="status"> {item.status}</td>
                    <td  > {getTimeAgo(item.created_at)}</td>
                    <td  > {item.jobType[0].type}</td>
                    {/* <td>
                      <div className="option-box">
                        <ul className="option-list">
                          <li>
                            <button data-text="View Aplication">
                              <span className="la la-eye"></span>
                            </button>
                          </li>
                          <li>
                            <button data-text="Delete Aplication">
                              <span className="la la-trash"></span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* End table widget content */}
    </div>
  );
};

export default JobFavouriteTable;
